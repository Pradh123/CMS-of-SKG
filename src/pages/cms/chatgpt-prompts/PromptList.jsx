import { useMemo, useState } from 'react'
import { Check, Clipboard, FileText, Info, MapPinned, Route, Sparkles } from 'lucide-react'

const pageTypes = [
  { id: 'area', label: 'Area SEO Page', icon: MapPinned },
  { id: 'route', label: 'Route SEO Page', icon: Route },
  { id: 'blog', label: 'Blog Article', icon: FileText },
]
const services = ['Taxi service', 'Cab service', 'Car rental', 'Tempo traveller hire']
const outputRules = {
  area: `Output exactly these labelled blocks, in this order:\n\n=== AREA NAME ===\n=== CITY NAME ===\n=== SLUG ===\n=== H1 TITLE ===\n=== SEO TITLE ===\n=== META DESCRIPTION ===\n=== KEYWORDS ===\n=== CANONICAL URL ===\n=== INTRO HTML ===\n=== BODY HTML ===\n=== FAQ HTML ===`,
  route: `Output exactly these labelled blocks, in this order:\n\n=== TITLE ===\n=== SLUG ===\n=== CONTENT ===\n=== IMAGE URL ===\n=== META TITLE ===\n=== META DESCRIPTION ===\n=== STATUS ===`,
  blog: `Output exactly these labelled blocks, in this order:\n\n=== TITLE ===\n=== SLUG ===\n=== CONTENT ===\n=== IMAGE URL ===\n=== META TITLE ===\n=== META DESCRIPTION ===\n=== STATUS ===`,
}

function buildPrompt(type, values) {
  const common = `You are an SEO copywriter for SKG Travels, an outstation travel operator based in Mumbai. Write in natural Indian English with a helpful, human tone. Do not use AI filler, emojis or exclamation marks. Use accurate details only and never invent facts.`
  if (type === 'area') return `${common}\n\nWrite the content for ONE area landing page.\n\nAREA: ${values.area || '<<< enter area name >>>'}\nCITY: Mumbai\nSERVICE: ${values.service || '<<< select a service >>>'}\n\nUse the service wording consistently in the slug, H1, SEO title, keywords and headings. Mention the area naturally 4-6 times. Include useful local context, service benefits, popular routes, available vehicles, a booking section and five FAQs.\n\nHTML rules:\n- Use clean semantic fragments with <h2>, <h3>, <p>, <ul>, <li> and <strong>.\n- Do not include <html>, <head>, <body>, inline styles, classes, images or an <h1>.\n- Intro HTML: one paragraph of 40-60 words.\n- Body HTML: 400-600 words.\n- FAQ HTML: five practical questions with 2-3 sentence answers.\n\n${outputRules.area}\n\nReturn each label on its own line followed by its value. No commentary and no code fences.`
  if (type === 'route') return `${common}\n\nWrite the content for ONE route landing page.\n\nFROM CITY: ${values.from || '<<< enter origin city >>>'}\nTO CITY: ${values.to || '<<< enter destination city >>>'}\nSERVICE: ${values.service || '<<< select a service >>>'}\nSTARTING FARE: ${values.fare || '<<< enter starting fare >>>'}\n\nCreate useful route-focused content covering the trip overview, approximate travel considerations, service benefits, vehicle choices, booking guidance and FAQs. Use the supplied starting fare consistently, but do not invent any other exact fare, distance or travel time. The CONTENT must be clean semantic HTML using headings, paragraphs and lists.\n\n${outputRules.route}\n\nSet STATUS to Draft. Return each label on its own line followed by its value. No commentary and no code fences.`
  return `${common}\n\nWrite ONE useful blog article for the SKG Travels website.\n\nTOPIC: ${values.topic || '<<< enter article topic >>>'}\nSERVICE TO PROMOTE: ${values.service || '<<< select a service >>>'}\n\nCreate an engaging, practical article with a clear introduction, descriptive H2/H3 sections, short paragraphs, useful lists and a concise conclusion. The CONTENT must be 800-1200 words of clean semantic HTML. Mention the selected service naturally and avoid keyword stuffing.\n\n${outputRules.blog}\n\nSet STATUS to Draft. Return each label on its own line followed by its value. No commentary and no code fences.`
}

export default function PromptList() {
  const [type, setType] = useState('area')
  const [values, setValues] = useState({ area: '', service: '', from: '', to: '', fare: '', topic: '' })
  const [copied, setCopied] = useState(false)
  const prompt = useMemo(() => buildPrompt(type, values), [type, values])
  const setValue = event => setValues(current => ({ ...current, [event.target.name]: event.target.value }))
  async function copyPrompt() {
    try { await navigator.clipboard.writeText(prompt) } catch {
      const area = document.createElement('textarea')
      area.value = prompt
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      area.remove()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }
  const current = pageTypes.find(item => item.id === type)
  const CurrentIcon = current.icon
  return (
    <div className="prompt-page">
      <header className="prompt-page-header"><span className="prompt-kicker"><Sparkles size={14} /> Content assistant</span><h1>ChatGPT Prompts for the Website CMS</h1><p>Fill in the details, copy the generated prompt, then paste each labelled answer into the matching CMS field.</p></header>
      <section className="prompt-guide card"><div className="prompt-guide-title"><span><Info size={19} /></span><div><h2>How to use</h2><p>A simple workflow for consistent website content.</p></div></div><ol><li>Choose a page type and complete the small fields shown for it.</li><li>Click <strong>Copy prompt</strong> and paste it into ChatGPT.</li><li>Copy each labelled response into the CMS field with the same name.</li><li>For HTML content, paste through the editor's code view so tags render correctly.</li><li>Review facts and formatting before publishing the page.</li></ol></section>
      <nav className="prompt-tabs" aria-label="Prompt page types">{pageTypes.map(({ id, label, icon: Icon }) => <button key={id} type="button" className={type === id ? 'active' : ''} onClick={() => { setType(id); setCopied(false) }}><Icon size={17} />{label}</button>)}</nav>
      <section className="prompt-builder card">
        <div className="prompt-builder-head"><div className="prompt-builder-title"><span><CurrentIcon size={20} /></span><div><h2>{current.label}</h2><p>Prompt updates automatically as you type.</p></div></div><div className={`prompt-inputs prompt-inputs-${type}`}>
          {type === 'area' && <><label><span>Area name</span><input name="area" value={values.area} onChange={setValue} placeholder="Andheri East" /></label><label><span>Service</span><select name="service" value={values.service} onChange={setValue}><option value="">Not chosen yet</option>{services.map(service => <option key={service}>{service}</option>)}</select></label></>}
          {type === 'route' && <><label><span>From city</span><input name="from" value={values.from} onChange={setValue} placeholder="Mumbai" /></label><label><span>To city</span><input name="to" value={values.to} onChange={setValue} placeholder="Pune" /></label><label><span>Service</span><select name="service" value={values.service} onChange={setValue}><option value="">Not chosen yet</option>{services.map(service => <option key={service}>{service}</option>)}</select></label><label><span>Starting fare</span><input name="fare" value={values.fare} onChange={setValue} placeholder="Rs. 2,500" /></label></>}
          {type === 'blog' && <><label><span>Topic</span><input name="topic" value={values.topic} onChange={setValue} placeholder="Weekend getaways from Mumbai" /></label><label><span>Service to promote</span><select name="service" value={values.service} onChange={setValue}><option value="">Not chosen yet</option>{services.map(service => <option key={service}>{service}</option>)}</select></label></>}
        </div><button type="button" className={`prompt-copy-btn ${copied ? 'copied' : ''}`} onClick={copyPrompt}>{copied ? <Check size={17} /> : <Clipboard size={17} />}{copied ? 'Copied' : 'Copy prompt'}</button></div>
        <pre className="prompt-preview" tabIndex="0"><code>{prompt}</code></pre>
        <div className="prompt-note"><strong>Before publishing:</strong> Check local facts, links, spelling and SEO fields. Generated content should always receive a final human review.</div>
      </section>
    </div>
  )
}
