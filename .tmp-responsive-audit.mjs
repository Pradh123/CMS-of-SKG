import { spawn } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const routes = ['/vehicles/create']
const sizes = [
  { name: 'small-mobile', width: 320, height: 720 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
]
const profile = await mkdtemp(join(tmpdir(), 'skg-responsive-'))
const port = 9357
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  'about:blank',
])
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
let target
for (let attempt = 0; attempt < 35; attempt += 1) {
  try {
    const list = await fetch(`http://127.0.0.1:${port}/json`).then(r => r.json())
    target = list.find(item => item.type === 'page')
    if (target) break
  } catch {}
  await wait(200)
}
if (!target) throw new Error('Chrome target unavailable')
const socket = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true })
  socket.addEventListener('error', reject, { once: true })
})
let id = 0
const pending = new Map()
const exceptions = []
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data)
  if (message.id && pending.has(message.id)) {
    const request = pending.get(message.id)
    pending.delete(message.id)
    message.error
      ? request.reject(new Error(message.error.message))
      : request.resolve(message.result)
  }
  if (message.method === 'Runtime.exceptionThrown')
    exceptions.push(message.params.exceptionDetails.text)
})
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const requestId = ++id
    pending.set(requestId, { resolve, reject })
    socket.send(JSON.stringify({ id: requestId, method, params }))
  })
const evaluate = async expression => {
  const response = await send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  })
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.text)
  return response.result.value
}

try {
  await send('Runtime.enable')
  await send('Page.enable')
  const report = []
  for (const size of sizes) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: size.width,
      height: size.height,
      deviceScaleFactor: 1,
      mobile: size.name === 'mobile',
    })
    for (const route of routes) {
      await send('Page.navigate', { url: `http://127.0.0.1:5173${route}` })
      for (let attempt = 0; attempt < 20; attempt += 1) {
        await wait(100)
        if (await evaluate(`Boolean(document.querySelector('#root')?.children.length)`)) break
      }
      await wait(120)
      const result = await evaluate(`(() => {
        const width = innerWidth;
        const insideScroller = element => { let parent = element.parentElement; while (parent && parent !== document.body) { const style = getComputedStyle(parent); if (['auto','scroll'].includes(style.overflowX)) return true; parent = parent.parentElement } return false };
        const offenders = [...document.body.querySelectorAll('*')].filter(element => { const style = getComputedStyle(element); if (element.closest('.sidebar') || style.display === 'none' || style.visibility === 'hidden' || style.position === 'fixed' || insideScroller(element)) return false; const rect = element.getBoundingClientRect(); return rect.width > 0 && (rect.right > width + 2 || rect.left < -2) }).slice(0, 8).map(element => ({ tag: element.tagName, class: String(element.className).slice(0, 100), right: Math.round(element.getBoundingClientRect().right), width: Math.round(element.getBoundingClientRect().width) }));
        const tinyTargets = [...document.querySelectorAll('button, a, input:not([type="hidden"])')].filter(element => { const style = getComputedStyle(element); const rect = element.getBoundingClientRect(); return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && (rect.height < 32 || rect.width < 28) }).length;
        return { actualPath: location.pathname, overflow: document.documentElement.scrollWidth > width + 1, scrollWidth: document.documentElement.scrollWidth, offenders, tinyTargets, heading: document.querySelector('h1')?.textContent?.trim() || '' };
      })()`)
      if (result.overflow || result.offenders.length || result.actualPath !== route)
        report.push({ size: size.name, route, ...result })
    }
  }
  console.log(JSON.stringify({ report, exceptionCount: exceptions.length, exceptions }, null, 2))
} finally {
  socket.close()
  chrome.kill()
  await wait(200)
  if (profile.startsWith(tmpdir())) await rm(profile, { recursive: true, force: true })
}
