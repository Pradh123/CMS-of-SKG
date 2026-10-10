import { blogUrl } from '../../../utils/websiteUrl.js'

const escape = value =>
  String(value || '').replace(
    /[&<>"']/g,
    char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]
  )

export function openBlogPreview(record) {
  const previewWindow = window.open('', '_blank')
  if (!previewWindow) return
  previewWindow.opener = null
  const image = /^(https?:\/\/|\/)/i.test(record.image || '') ? record.image : ''
  const document = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font:18px/1.7 system-ui;color:#18314c;max-width:960px;margin:24px auto;padding:0 24px}h1,h2,h3{color:#007681}h1{font-weight:500;line-height:1.25}img,video,iframe{max-width:100%}.hero{width:100%;max-height:440px;object-fit:cover;border-radius:12px}.description{white-space:pre-wrap}a{color:#007681}</style></head><body><h1>${escape(record.title || 'Untitled blog')}</h1>${record.description ? `<p class="description">${escape(record.description)}</p>` : ''}${image ? `<img class="hero" src="${escape(image)}" alt="${escape(record.title)}">` : ''}<article>${record.content || ''}</article></body></html>`
  previewWindow.document.title = 'Preview: ' + (record.title || 'Blog')
  previewWindow.document.body.style.margin = '0'
  if (record.status === 'Published') {
    const link = previewWindow.document.createElement('a')
    link.href = blogUrl(record.slug, record.title)
    link.textContent = 'Open saved blog on website'
    link.style.cssText =
      'display:block;padding:12px 24px;font:14px system-ui;color:#007681;background:#f0f7ff'
    previewWindow.document.body.appendChild(link)
  }
  const frame = previewWindow.document.createElement('iframe')
  frame.title = 'Blog preview'
  frame.setAttribute('sandbox', '')
  frame.style.cssText = 'width:100%;height:100vh;border:0;display:block'
  frame.srcdoc = document
  previewWindow.document.body.appendChild(frame)
}
