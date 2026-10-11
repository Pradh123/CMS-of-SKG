import Loading from '../../components/common/Loading.jsx'
import { FormSelect } from '../../components/common/FormControls.jsx'
import RequiredMark from '../../components/common/RequiredMark.jsx'
import { blogUrl, routeUrl } from '../../utils/websiteUrl.js'
import MediaPicker from '../../components/gallery/MediaPicker.jsx'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  CalendarClock,
  CircleCheck,
  CircleDashed,
  FileText,
  Eye,
  Globe,
  Image,
  Link2,
  MapPinned,
  Search,
  TriangleAlert,
} from 'lucide-react'
import Button from '../../components/common/Button.jsx'
import RichTextEditor from '../../components/editor/RichTextEditor.jsx'
import FaqEditor from '../../components/editor/FaqEditor.jsx'
import useCollectionRecords from '../../hooks/useCollectionRecords.js'
import slugify from '../../utils/slugify.js'
import { countState, seoChecklist, serpPreview, stripHtml } from '../../utils/seoContent.js'

function Field({ label, hint, className = '', as = 'input', children, ...props }) {
  const Element = as
  return (
    <label className={`seo-field ${className}`}>
      <span className="form-label">
        {label}
        {props.required && <RequiredMark />}
      </span>
      <Element className="field" {...props}>
        {children}
      </Element>
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  )
}

function SectionHeading({ icon: Icon, title, description }) {
  return (
    <div className="seo-section-heading">
      <span>
        <Icon size={19} />
      </span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  )
}

function CounterField({
  label,
  hint,
  value,
  min,
  max,
  as = 'input',
  rows,
  className = '',
  ...props
}) {
  const length = String(value || '').length
  const state = countState(length, { min, max })
  const Element = as
  return (
    <label className={`seo-field ${className}`}>
      <span className="form-label">
        {label}
        {props.required && <RequiredMark />}
        <span className={`char-counter is-${state}`}>
          {length}/{max}
        </span>
      </span>
      <Element className="field" rows={rows} value={value} {...props} />
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  )
}

const CHECKLIST_ICONS = {
  ok: CircleCheck,
  warn: TriangleAlert,
  empty: CircleDashed,
}

function SeoChecklist({ items }) {
  const done = items.filter(item => item.state === 'ok').length
  return (
    <div className="editor-panel">
      <div className="editor-panel-head">
        <h2>SEO readiness</h2>
        <span className="editor-progress">
          {done}/{items.length}
        </span>
      </div>
      <div className="editor-progress-bar" role="presentation">
        <span style={{ width: `${Math.round((done / items.length) * 100)}%` }} />
      </div>
      <ul className="editor-checklist">
        {items.map(item => {
          const Icon = CHECKLIST_ICONS[item.state]
          return (
            <li key={item.label} className={`check-item is-${item.state}`}>
              <Icon size={16} aria-hidden="true" />
              <div>
                <p>{item.label}</p>
                <span>{item.detail}</span>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function SerpPreview({ form, resolvedSlug }) {
  const preview = serpPreview({
    title: form.metaTitle || form.title,
    slug: resolvedSlug,
    description: form.metaDescription,
    content: form.content,
  })
  return (
    <section className="seo-section">
      <SectionHeading
        icon={Search}
        title="Search result preview"
        description="How this page appears on Google when people search for it."
      />
      <div className="serp-preview" aria-label="Search result preview">
        <p className="serp-url">{preview.url}</p>
        <p className="serp-title">{preview.title}</p>
        <p className="serp-description">{preview.description}</p>
      </div>
    </section>
  )
}

export default function CmsForm({ title, storageKey, mode }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const base = `/cms/${storageKey}`
  const { records, loading, createRecord, updateRecord } = useCollectionRecords(storageKey)
  const {
    records: cityRecords,
    loading: citiesLoading,
    error: citiesError,
  } = useCollectionRecords(storageKey === 'blog' ? null : 'cities')
  const cities = [
    ...new Set(cityRecords.map(city => String(city.cityName || '').trim()).filter(Boolean)),
  ]
  const existing = records.find(record => record.id === id)
  const [form, setForm] = useState(
    () =>
      existing || {
        title: '',
        cityName: '',
        description: '',
        slug: '',
        content: '',
        faqs: [],
        image: '',
        ogImage: '',
        canonicalUrl: '',
        metaTitle: '',
        metaDescription: '',
        keywords: '',
        headScripts: '',
        bodyScripts: '',
        status: 'Draft',
      }
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [imageTarget, setImageTarget] = useState('')
  const isBlog = storageKey === 'blog'
  const update = event =>
    setForm(current => ({ ...current, [event.target.name]: event.target.value }))
  useEffect(() => {
    if (mode === 'edit' && existing) setForm(current => ({ ...current, ...existing }))
  }, [existing, mode])

  const resolvedSlug = form.slug || slugify(form.title || '')
  const checklist = useMemo(
    () => seoChecklist({ ...form, slug: resolvedSlug }),
    [form, resolvedSlug]
  )
  const contentLength = stripHtml(form.content).length
  const imagePreview = /^(https?:\/\/|\/)/i.test(form.image || '') ? form.image : ''

  async function submit(event) {
    event.preventDefault()
    if (!isBlog && (citiesLoading || citiesError || !cities.includes(form.cityName))) {
      setError('Select a city from Masters / Cities before saving this route page.')
      return
    }
    const record = {
      ...form,
      id: mode === 'edit' ? id : crypto.randomUUID(),
      slug: resolvedSlug,
      updatedAt: new Date().toISOString(),
    }
    setSaving(true)
    setError('')
    try {
      if (mode === 'edit') await updateRecord(id, record)
      else await createRecord(record)
      navigate(base)
    } catch (requestError) {
      setError(requestError.message)
      setSaving(false)
    }
  }
  if (mode === 'edit' && loading) return <Loading variant="form" />
  if (mode === 'edit' && !existing)
    return (
      <div className="card">
        Record not found.{' '}
        <Link className="text-blue-700" to={base}>
          Back to list
        </Link>
      </div>
    )
  return (
    <form className="card seo-page-form editor-form" onSubmit={submit}>
      <MediaPicker
        open={Boolean(imageTarget)}
        multiple={false}
        onClose={() => setImageTarget('')}
        onSelect={items => setForm(previous => ({ ...previous, [imageTarget]: items[0].url }))}
      />
      <header className="seo-form-header">
        <div>
          <span className="seo-header-kicker">
            {isBlog ? 'Blog content' : 'Route landing page'}
          </span>
          <h1>
            {mode === 'edit' ? 'Edit' : 'Add'} {title} {isBlog ? 'Post' : 'Page'}
          </h1>
          <p>
            {isBlog
              ? 'Write, optimise and publish content for your travel audience.'
              : 'Create a search-optimised route page for SKG Travels.'}
          </p>
        </div>
        <div className="seo-header-state">
          <span className={form.status === 'Published' ? 'is-published' : ''}>
            {form.status || 'Draft'}
          </span>
        </div>
      </header>
      <div className="editor-layout">
        <div className="editor-main">
          <section className="seo-section">
            <SectionHeading
              icon={isBlog ? FileText : MapPinned}
              title="Page details"
              description="Set the title and the public URL for this content."
            />
            <div className="seo-form-grid">
              <Field
                className="full-width"
                label="Title"
                name="title"
                required
                value={form.title}
                onChange={update}
              />
              {isBlog && (
                <Field
                  className="full-width"
                  label="Description"
                  name="description"
                  as="textarea"
                  rows="3"
                  value={form.description || ''}
                  onChange={update}
                  hint="Shown below the blog title on the website and blog listing. Separate from the SEO meta description."
                />
              )}
              {!isBlog && (
                <Field
                  className="full-width"
                  label="City"
                  name="cityName"
                  as={FormSelect}
                  required
                  value={form.cityName || ''}
                  onChange={update}
                  disabled={citiesLoading || Boolean(citiesError)}
                  hint={
                    citiesError
                      ? 'Cities could not be loaded. Please refresh and try again.'
                      : 'This route will appear on the selected city page. Add cities in Masters / Cities.'
                  }
                >
                  <option value="">Select a city</option>
                  {cities.map(city => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </Field>
              )}
              <Field
                className="full-width"
                label="Slug"
                name="slug"
                value={form.slug}
                onChange={update}
                placeholder={slugify(form.title) || 'Generated from title if blank'}
                hint={
                  isBlog
                    ? `Live URL: ${blogUrl(resolvedSlug)}`
                    : `Live URL: skgtravels.com/${resolvedSlug || '…'}`
                }
              />
            </div>
          </section>
          <section className="seo-section seo-content-section">
            <SectionHeading
              icon={FileText}
              title="Content"
              description={`Write the main content for this ${isBlog ? 'blog post' : 'route page'}.`}
            />
            <RichTextEditor label="Content" value={form.content} name="content" onChange={update} />
            <p
              className={`content-length is-${contentLength >= 300 ? 'ok' : contentLength ? 'warn' : 'empty'}`}
            >
              {contentLength} characters of readable content
            </p>
          </section>
          <section className="seo-section">
            <SectionHeading
              icon={Image}
              title="Images"
              description="The featured image appears on listings and social cards."
            />
            <div className="seo-form-grid">
              <Field
                className="full-width"
                label="Featured image URL"
                name="image"
                type="url"
                value={form.image || ''}
                onChange={update}
                placeholder="https://example.com/image.jpg"
              />
              <button type="button" className="btn" onClick={() => setImageTarget('image')}>
                Choose featured image from Gallery
              </button>
              {imagePreview && (
                <div className="full-width">
                  <img className="hero-preview" src={imagePreview} alt="Featured preview" />
                </div>
              )}
              <Field
                className="full-width"
                label="Social share image URL (optional)"
                name="ogImage"
                type="url"
                value={form.ogImage || ''}
                onChange={update}
                hint="Used for WhatsApp, Facebook and Twitter previews. Falls back to the featured image."
              />
              <button type="button" className="btn" onClick={() => setImageTarget('ogImage')}>
                Choose social image from Gallery
              </button>
            </div>
          </section>
          <section className="seo-section">
            <SectionHeading
              icon={Search}
              title="Search & metadata"
              description="Control exactly how this page appears in search results."
            />
            <div className="seo-form-grid">
              <CounterField
                className="full-width"
                label="SEO title"
                name="metaTitle"
                min={30}
                max={60}
                value={form.metaTitle || ''}
                onChange={update}
                placeholder={form.title}
                hint="Leave blank to use the page title. Aim for 30-60 characters."
              />
              <CounterField
                className="full-width"
                label="Meta description"
                name="metaDescription"
                as="textarea"
                rows="4"
                min={70}
                max={160}
                value={form.metaDescription || ''}
                onChange={update}
                hint="Aim for 70-160 characters so the full sentence shows in results."
              />
              <Field
                className="full-width"
                label="Keywords"
                name="keywords"
                value={form.keywords || ''}
                onChange={update}
                placeholder="Mumbai taxi, airport transfer"
                hint="Comma-separated, relevant terms. Keep wording natural in the content."
              />
              <Field
                className="full-width"
                label="Canonical URL (optional)"
                name="canonicalUrl"
                type="url"
                value={form.canonicalUrl || ''}
                onChange={update}
                hint="Only set this when the same story exists at another address."
              />
            </div>
          </section>
          <section className="seo-section">
            <SectionHeading
              icon={Globe}
              title="Optional page scripts"
              description="Keep schema and tracking code separate from article content."
            />
            <div className="seo-form-grid">
              <Field
                className="full-width code-field"
                as="textarea"
                rows="6"
                label="SEO / schema scripts"
                name="headScripts"
                value={form.headScripts || ''}
                onChange={update}
                placeholder={
                  '<script type="application/ld+json">{ "@context": "https://schema.org" }</script>'
                }
                hint="Paste complete script tags. JSON-LD is rendered with the page; JavaScript loads after the page becomes interactive."
              />
              <Field
                className="full-width code-field"
                as="textarea"
                rows="6"
                label="After-content scripts"
                name="bodyScripts"
                value={form.bodyScripts || ''}
                onChange={update}
                placeholder={'<script src="https://example.com/tracking.js"></script>'}
                hint="Optional tracking scripts. Loaded after page content without blocking rendering."
              />
            </div>
          </section>
          <FaqEditor
            value={form.faqs}
            onChange={faqs => setForm(current => ({ ...current, faqs }))}
          />
          <SerpPreview form={form} resolvedSlug={resolvedSlug} />
        </div>
        <aside className="editor-sidebar">
          <div className="editor-panel">
            <div className="editor-panel-head">
              <h2>Publishing</h2>
              <span className={`area-badge ${form.status === 'Published' ? 'published' : 'draft'}`}>
                {form.status || 'Draft'}
              </span>
            </div>
            <Field as="select" label="Status" name="status" value={form.status} onChange={update}>
              <option value="Draft">Draft — hidden from the website</option>
              <option value="Published">Published — live on the website</option>
            </Field>
            <p className="publish-date">
              <CalendarClock size={15} aria-hidden="true" />
              {form.publishedAt
                ? `Published on ${new Date(form.publishedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
                : form.status === 'Published'
                  ? 'Publish date is set when saved'
                  : 'Not published yet'}
            </p>
          </div>
          <SeoChecklist items={checklist} />
          <div className="editor-panel editor-panel-soft">
            <Globe size={16} aria-hidden="true" />
            <p>
              Published {isBlog ? 'posts' : 'pages'} reach the website within a minute: they enter
              the sitemap, get structured data, and are eligible for rich results.
            </p>
          </div>
        </aside>
      </div>
      {error && (
        <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700" role="alert">
          {error}
        </p>
      )}
      <div className="seo-form-footer">
        <span className={`area-badge ${form.status === 'Published' ? 'published' : 'draft'}`}>
          {form.status || 'Draft'}
        </span>
        <div className="seo-actions">
          {
            <a
              className="btn btn-secondary"
              title={`View ${isBlog ? 'blog' : 'route page'} on website`}
              aria-label={`View ${isBlog ? 'blog' : 'route page'} on website`}
              href={(isBlog ? blogUrl : routeUrl)(resolvedSlug)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Eye size={18} aria-hidden="true" />
            </a>
          }
          <Link className="btn btn-secondary" to={base}>
            Cancel
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : `Save ${isBlog ? 'Post' : 'Page'}`}
          </Button>
        </div>
      </div>
    </form>
  )
}
