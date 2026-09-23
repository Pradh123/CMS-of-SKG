import { useEffect, useState } from 'react'
import { Globe2, Pencil, Plus, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import Pagination from '../../../components/common/Pagination.jsx'
import { readRecords } from '../../../data/store.js'

const PAGE_SIZE = 8
const formatUpdated = value => value ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)) : '—'

export default function AreaSEOList() {
  const [records, setRecords] = useState(() => readRecords('area-seo'))
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  useEffect(() => setRecords(readRecords('area-seo')), [])
  const filtered = records.filter(record => `${record.areaName || record.title || ''} ${record.cityName || ''} ${record.slug || ''} ${record.seoTitle || record.metaTitle || ''}`.toLowerCase().includes(query.trim().toLowerCase()))
  const pages = Math.ceil(filtered.length / PAGE_SIZE)
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="area-list-page">
      <div className="area-list-topbar">
        <div><h1>Area SEO</h1><p>Create and manage location landing pages.</p></div>
        <Link className="btn area-create-btn" to="/cms/area-seo/create"><Plus size={17} /> Add Area Page</Link>
      </div>
      <section className="card area-list-card">
        <div className="area-list-heading">
          <div className="area-list-title"><span className="area-list-icon"><Globe2 size={18} /></span><h2>Saved Area Pages</h2></div>
          <label className="area-search"><span>Search:</span><span className="area-search-input"><input value={query} onChange={event => { setQuery(event.target.value); setPage(1) }} aria-label="Search saved area pages" /><Search size={17} /></span></label>
        </div>
        <div className="area-table-wrap">
          <table className="area-table">
            <thead><tr><th>Area</th><th>Slug</th><th>SEO Title</th><th>Status</th><th>Updated</th><th>Edit</th></tr></thead>
            <tbody>{visible.map(record => (
              <tr key={record.id}>
                <td><strong>{record.areaName || record.title || 'Untitled'}</strong><small>{record.cityName || '—'}</small></td>
                <td><code>{record.slug || '—'}</code></td>
                <td className="seo-title-cell">{record.seoTitle || record.metaTitle || '—'}</td>
                <td><div className="area-status-stack"><span className={`area-badge ${record.active === false ? 'inactive' : 'active'}`}>{record.active === false ? 'Inactive' : 'Active'}</span><span className={`area-badge ${record.published || record.status === 'Published' ? 'published' : 'draft'}`}>{record.published || record.status === 'Published' ? 'Published' : 'Draft'}</span></div></td>
                <td className="updated-cell">{formatUpdated(record.updatedAt)}</td>
                <td><Link className="area-edit-btn" aria-label={`Edit ${record.areaName || record.title}`} title="Edit page" to={`/cms/area-seo/${record.id}/edit`}><Pencil size={17} /></Link></td>
              </tr>
            ))}</tbody>
          </table>
          {!visible.length && <div className="area-empty"><Globe2 size={28} /><p>{query ? 'No matching area pages found.' : 'No area pages saved yet.'}</p><Link to="/cms/area-seo/create">Create your first page</Link></div>}
        </div>
        <Pagination page={page} pages={pages} onChange={setPage} />
      </section>
    </div>
  )
}
