import { useEffect, useState } from 'react'
import { FileText, MapPinned, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import Pagination from '../../components/common/Pagination.jsx'
import { readRecords, writeRecords } from '../../data/store.js'

const PAGE_SIZE = 8
const formatUpdated = value => value ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)) : '—'

export default function CmsList({ title, storageKey }) {
  const location = useLocation()
  const [records, setRecords] = useState(() => readRecords(storageKey))
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const isBlog = storageKey === 'blog'
  const Icon = isBlog ? FileText : MapPinned
  useEffect(() => { setRecords(readRecords(storageKey)); setPage(1) }, [storageKey])
  const filtered = records.filter(record => `${record.title || ''} ${record.slug || ''} ${record.metaTitle || ''}`.toLowerCase().includes(query.trim().toLowerCase()))
  const pages = Math.ceil(filtered.length / PAGE_SIZE)
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  function remove(id) {
    if (!window.confirm('Delete this record?')) return
    const next = records.filter(record => record.id !== id)
    writeRecords(storageKey, next)
    setRecords(next)
  }
  return (
    <div className="area-list-page">
      <div className="area-list-topbar">
        <div><h1>{title}</h1><p>Create and manage your {isBlog ? 'blog posts' : 'route landing pages'}.</p></div>
        <Link className="btn area-create-btn" to={`${location.pathname}/create`}><Plus size={17} /> Add {isBlog ? 'Blog Post' : 'Route Page'}</Link>
      </div>
      <section className="card area-list-card">
        <div className="area-list-heading">
          <div className="area-list-title"><span className="area-list-icon"><Icon size={18} /></span><h2>Saved {isBlog ? 'Blog Posts' : 'Route Pages'}</h2></div>
          <label className="area-search"><span>Search:</span><span className="area-search-input"><input value={query} onChange={event => { setQuery(event.target.value); setPage(1) }} aria-label={`Search saved ${title} records`} /><Search size={17} /></span></label>
        </div>
        <div className="area-table-wrap">
          <table className="area-table cms-seo-table">
            <thead><tr><th>Title</th><th>Slug</th><th>Meta Title</th><th>Status</th><th>Updated</th><th>Actions</th></tr></thead>
            <tbody>{visible.map(record => <tr key={record.id}>
              <td><strong>{record.title || 'Untitled'}</strong></td><td><code>{record.slug || '—'}</code></td><td className="seo-title-cell">{record.metaTitle || '—'}</td>
              <td><span className={`area-badge ${record.status === 'Published' ? 'published' : 'draft'}`}>{record.status || 'Draft'}</span></td><td className="updated-cell">{formatUpdated(record.updatedAt)}</td>
              <td><div className="cms-row-actions"><Link className="area-edit-btn" aria-label={`Edit ${record.title || 'record'}`} title="Edit" to={`${location.pathname}/${record.id}/edit`}><Pencil size={16} /></Link><button className="cms-delete-btn" type="button" aria-label={`Delete ${record.title || 'record'}`} title="Delete" onClick={() => remove(record.id)}><Trash2 size={16} /></button></div></td>
            </tr>)}</tbody>
          </table>
          {!visible.length && <div className="area-empty"><Icon size={28} /><p>{query ? `No matching ${isBlog ? 'blog posts' : 'route pages'} found.` : `No ${isBlog ? 'blog posts' : 'route pages'} saved yet.`}</p><Link to={`${location.pathname}/create`}>Create your first {isBlog ? 'post' : 'page'}</Link></div>}
        </div>
        <Pagination page={page} pages={pages} onChange={setPage} />
      </section>
    </div>
  )
}
