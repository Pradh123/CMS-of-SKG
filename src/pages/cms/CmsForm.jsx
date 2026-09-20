import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader.jsx'
import Button from '../../components/common/Button.jsx'
import Input from '../../components/common/Input.jsx'
import Select from '../../components/common/Select.jsx'
import RichTextEditor from '../../components/editor/RichTextEditor.jsx'
import ImageUploader from '../../components/editor/ImageUploader.jsx'
import SEOFields from '../../components/editor/SEOFields.jsx'
import { readRecords, writeRecords } from '../../data/store.js'
import slugify from '../../utils/slugify.js'
export default function CmsForm({ title, storageKey, mode }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const base = `/cms/${storageKey}`
  const [form, setForm] = useState(
    () =>
      readRecords(storageKey).find(record => record.id === id) || {
        title: '',
        slug: '',
        content: '',
        image: '',
        metaTitle: '',
        metaDescription: '',
        status: 'Draft',
      }
  )
  const update = event => setForm({ ...form, [event.target.name]: event.target.value })
  function submit(event) {
    event.preventDefault()
    const records = readRecords(storageKey)
    const record = {
      ...form,
      id: mode === 'edit' ? id : crypto.randomUUID(),
      slug: form.slug || slugify(form.title),
      updatedAt: new Date().toISOString(),
    }
    writeRecords(
      storageKey,
      mode === 'edit' ? records.map(item => (item.id === id ? record : item)) : [record, ...records]
    )
    navigate(base)
  }
  if (mode === 'edit' && !readRecords(storageKey).some(item => item.id === id))
    return (
      <div className="card">
        Record not found.{' '}
        <Link className="text-blue-700" to={base}>
          Back to list
        </Link>
      </div>
    )
  return (
    <>
      <PageHeader title={`${mode === 'edit' ? 'Edit' : 'Create'} ${title}`} />
      <form onSubmit={submit} className="card max-w-3xl space-y-5">
        <Input label="Title" name="title" required value={form.title} onChange={update} />
        <Input
          label="Slug"
          name="slug"
          value={form.slug}
          onChange={update}
          placeholder="Generated from title if blank"
        />
        <RichTextEditor value={form.content} name="content" onChange={update} />
        <ImageUploader
          value={form.image}
          onChange={event => setForm({ ...form, image: event.target.value })}
        />
        <SEOFields value={form} onChange={setForm} />
        <Select
          label="Status"
          name="status"
          value={form.status}
          onChange={update}
          options={[
            { value: 'Draft', label: 'Draft' },
            { value: 'Published', label: 'Published' },
          ]}
        />
        <div className="flex gap-3">
          <Button type="submit">Save</Button>
          <Link className="btn btn-secondary" to={base}>
            Cancel
          </Link>
        </div>
      </form>
    </>
  )
}
