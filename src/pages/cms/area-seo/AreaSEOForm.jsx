import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Code2, FileText, Image, MapPinned, Search } from 'lucide-react'
import Button from '../../../components/common/Button.jsx'
import RichTextEditor from '../../../components/editor/RichTextEditor.jsx'
import { readRecords, writeRecords } from '../../../data/store.js'
import slugify from '../../../utils/slugify.js'

const emptyForm = { areaName: '', cityName: 'Mumbai', slug: '', h1Title: '', seoTitle: '', metaDescription: '', keywords: '', canonicalUrl: '', heroImage: '', introHtml: '', bodyHtml: '', faqHtml: '', headScripts: '', active: true, published: false }
const cities = ['Mumbai', 'Navi Mumbai', 'Thane', 'Pune', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai']

function Field({ label, hint, className = '', as = 'input', children, ...props }) {
  const Element = as
  return <label className={`seo-field ${className}`}><span className="form-label">{label}</span><Element className="field" {...props}>{children}</Element>{hint && <span className="field-hint">{hint}</span>}</label>
}

function SectionHeading({ icon: Icon, title, description }) {
  return <div className="seo-section-heading"><span><Icon size={19} /></span><div><h2>{title}</h2><p>{description}</p></div></div>
}

export default function AreaSEOForm({ mode }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const records = readRecords('area-seo')
  const existing = records.find(record => record.id === id)
  const [form, setForm] = useState(() => ({ ...emptyForm, ...existing }))
  const [imageName, setImageName] = useState(existing?.heroImageName || '')
  if (mode === 'edit' && !existing) return <div className="card">Page not found. <Link className="text-blue-700" to="/cms/area-seo">Back to list</Link></div>
  const update = event => {
    const { name, value, type, checked } = event.target
    setForm(current => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }
  const updateArea = event => {
    const areaName = event.target.value
    setForm(current => ({ ...current, areaName, slug: current.slug || slugify(`${areaName}-${current.cityName}`), h1Title: current.h1Title || (areaName ? `Taxi Service in ${areaName}` : '') }))
  }
  const uploadImage = event => {
    const file = event.target.files?.[0]
    if (!file) return
    setImageName(file.name)
    const reader = new FileReader()
    reader.onload = () => setForm(current => ({ ...current, heroImage: reader.result, heroImageName: file.name }))
    reader.readAsDataURL(file)
  }
  const submit = event => {
    event.preventDefault()
    const record = { ...form, title: form.areaName, status: form.published ? 'Published' : 'Draft', id: mode === 'edit' ? id : crypto.randomUUID(), slug: form.slug || slugify(`${form.areaName}-${form.cityName}`), updatedAt: new Date().toISOString() }
    writeRecords('area-seo', mode === 'edit' ? records.map(item => item.id === id ? record : item) : [record, ...records])
    navigate('/cms/area-seo')
  }
  return <form className="card seo-page-form" onSubmit={submit}>
    <header className="seo-form-header"><div><span className="seo-header-kicker">Area landing page</span><h1>{mode === 'edit' ? 'Edit' : 'Add'} Area SEO Page</h1><p>Create a search-optimized location page that publishes directly to skgtravels.com.</p></div><div className="seo-header-state"><span className={form.active ? 'is-active' : ''}>{form.active ? 'Active' : 'Inactive'}</span><span className={form.published ? 'is-published' : ''}>{form.published ? 'Published' : 'Draft'}</span></div></header>

    <section className="seo-section"><SectionHeading icon={MapPinned} title="Page details" description="Set the location, public URL and main page heading." /><div className="seo-form-grid">
      <Field label="Area name" name="areaName" required value={form.areaName} onChange={updateArea} placeholder="Andheri East" hint="Primary locality customers search for." />
      <Field label="City name" as="select" name="cityName" value={form.cityName} onChange={update} hint="Default city for the landing page.">{cities.map(city => <option key={city}>{city}</option>)}</Field>
      <Field className="full-width" label="Slug" name="slug" required value={form.slug} onChange={update} placeholder="taxi-service-in-andheri-east-mumbai" hint="Becomes the public URL (slug.html) and must stay unique." />
      <Field className="full-width" label="H1 title" name="h1Title" required value={form.h1Title} onChange={update} placeholder="Taxi Service in Andheri East" />
    </div></section>

    <section className="seo-section"><SectionHeading icon={Search} title="Search & metadata" description="Control how this page appears in Google and other search results." /><div className="seo-form-grid">
      <Field className="full-width" label="SEO title" name="seoTitle" required value={form.seoTitle} onChange={update} placeholder="Taxi Service in Andheri East Mumbai | SKG Travels" hint="Browser title and search result headline." />
      <Field className="full-width" as="textarea" rows="4" label="Meta description" name="metaDescription" value={form.metaDescription} onChange={update} placeholder="Book clean cabs, tempo travellers and outstation taxis..." />
      <Field label="Keywords" name="keywords" value={form.keywords} onChange={update} placeholder="taxi service, cab booking" />
      <Field label="Canonical URL" type="url" name="canonicalUrl" value={form.canonicalUrl} onChange={update} placeholder="https://skgtravels.com/taxi-service..." />
    </div></section>

    <section className="seo-section"><SectionHeading icon={Image} title="Hero media" description="Add the primary visual shown at the top of the public page." /><div className="seo-upload-layout"><label className="seo-field"><span className="form-label">Hero image upload</span><input className="field file-field" type="file" accept="image/*" onChange={uploadImage} /><span className="field-hint">Recommended: landscape JPG or WebP, at least 1600 × 900 px.</span><span className="upload-file-name">{imageName || 'No image uploaded yet'}</span></label>{form.heroImage ? <img className="hero-preview" src={form.heroImage} alt="Hero preview" /> : <div className="hero-placeholder"><Image size={25} /><span>Image preview</span></div>}</div></section>

    <section className="seo-section seo-content-section"><SectionHeading icon={FileText} title="Page content" description="Build the opening, main content and FAQ sections of the landing page." />
      <RichTextEditor label="Intro HTML" name="introHtml" value={form.introHtml} onChange={update} hint="Short opening paragraph below the hero image." />
      <RichTextEditor label="Body HTML" name="bodyHtml" value={form.bodyHtml} onChange={update} hint="Main content. Generated HTML can be pasted here directly." />
      <RichTextEditor label="FAQ HTML" name="faqHtml" value={form.faqHtml} onChange={update} />
    </section>

    <section className="seo-section"><SectionHeading icon={Code2} title="Advanced settings" description="Optional code and verification tags for the document head." /><div className="seo-form-grid"><Field className="full-width code-field" as="textarea" rows="6" label="Head scripts" name="headScripts" value={form.headScripts} onChange={update} placeholder="<script> ... </script>" hint="Written verbatim into the <head> — use for verification meta tags, tracking pixels or JSON-LD schema." /></div></section>
    <div className="seo-form-footer"><div className="seo-statuses"><label><input type="checkbox" name="active" checked={form.active} onChange={update} /> Active</label><label><input type="checkbox" name="published" checked={form.published} onChange={update} /> Published</label></div><div className="seo-actions"><Link className="btn btn-secondary" to="/cms/area-seo">Cancel</Link><Button type="submit">Save Page</Button></div></div>
  </form>
}
