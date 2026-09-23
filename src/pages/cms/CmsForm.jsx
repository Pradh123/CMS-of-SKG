import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FileText, Image, Link2, MapPinned, Search } from 'lucide-react'
import Button from '../../components/common/Button.jsx'
import RichTextEditor from '../../components/editor/RichTextEditor.jsx'
import { readRecords, writeRecords } from '../../data/store.js'
import slugify from '../../utils/slugify.js'

function Field({ label, hint, className = '', as = 'input', children, ...props }) {
  const Element = as
  return <label className={`seo-field ${className}`}><span className="form-label">{label}</span><Element className="field" {...props}>{children}</Element>{hint && <span className="field-hint">{hint}</span>}</label>
}
function SectionHeading({ icon: Icon, title, description }) {
  return <div className="seo-section-heading"><span><Icon size={19} /></span><div><h2>{title}</h2><p>{description}</p></div></div>
}

export default function CmsForm({ title, storageKey, mode }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const base = `/cms/${storageKey}`
  const records = readRecords(storageKey)
  const existing = records.find(record => record.id === id)
  const [form, setForm] = useState(() => existing || { title: '', slug: '', content: '', image: '', metaTitle: '', metaDescription: '', status: 'Draft' })
  const isBlog = storageKey === 'blog'
  const update = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }))
  function submit(event) {
    event.preventDefault()
    const record = { ...form, id: mode === 'edit' ? id : crypto.randomUUID(), slug: form.slug || slugify(form.title), updatedAt: new Date().toISOString() }
    writeRecords(storageKey, mode === 'edit' ? records.map(item => item.id === id ? record : item) : [record, ...records])
    navigate(base)
  }
  if (mode === 'edit' && !existing) return <div className="card">Record not found. <Link className="text-blue-700" to={base}>Back to list</Link></div>
  return (
    <form className="card seo-page-form" onSubmit={submit}>
      <header className="seo-form-header"><div><span className="seo-header-kicker">{isBlog ? 'Blog content' : 'Route landing page'}</span><h1>{mode === 'edit' ? 'Edit' : 'Add'} {title} {isBlog ? 'Post' : 'Page'}</h1><p>{isBlog ? 'Create and optimize content for your travel audience.' : 'Create a search-optimized route page for SKG Travels.'}</p></div><div className="seo-header-state"><span className={form.status === 'Published' ? 'is-published' : ''}>{form.status || 'Draft'}</span></div></header>
      <section className="seo-section"><SectionHeading icon={isBlog ? FileText : MapPinned} title="Page details" description="Set the title and public URL for this content." /><div className="seo-form-grid">
        <Field className="full-width" label="Title" name="title" required value={form.title} onChange={update} />
        <Field className="full-width" label="Slug" name="slug" value={form.slug} onChange={update} placeholder="Generated from title if blank" hint="Leave blank to generate it automatically from the title." />
      </div></section>
      <section className="seo-section seo-content-section"><SectionHeading icon={FileText} title="Content" description={`Write the main content for this ${isBlog ? 'blog post' : 'route page'}.`} /><RichTextEditor label="Content" value={form.content} name="content" onChange={update} /></section>
      <section className="seo-section"><SectionHeading icon={Image} title="Featured image" description="Add the image displayed with this content." /><div className="seo-form-grid"><Field className="full-width" label="Image URL" name="image" type="url" value={form.image} onChange={update} placeholder="https://example.com/image.jpg" /></div></section>
      <section className="seo-section"><SectionHeading icon={Search} title="Search & metadata" description="Control how this content appears in search results." /><div className="seo-form-grid">
        <Field className="full-width" label="Meta title" name="metaTitle" value={form.metaTitle || ''} onChange={update} />
        <Field className="full-width" as="textarea" rows="4" label="Meta description" name="metaDescription" value={form.metaDescription || ''} onChange={update} />
      </div></section>
      <section className="seo-section"><SectionHeading icon={Link2} title="Publishing" description="Choose whether this content is a draft or visible to visitors." /><div className="seo-form-grid"><Field className="full-width" as="select" label="Status" name="status" value={form.status} onChange={update}><option value="Draft">Draft</option><option value="Published">Published</option></Field></div></section>
      <div className="seo-form-footer"><span className={`area-badge ${form.status === 'Published' ? 'published' : 'draft'}`}>{form.status || 'Draft'}</span><div className="seo-actions"><Link className="btn btn-secondary" to={base}>Cancel</Link><Button type="submit">Save {isBlog ? 'Post' : 'Page'}</Button></div></div>
    </form>
  )
}
