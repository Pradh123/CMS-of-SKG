import { useState } from 'react'
import { FileText, MapPinned, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import Pagination from '../../components/common/Pagination.jsx'
import useCollectionRecords from '../../hooks/useCollectionRecords.js'
import useAuth from '../../hooks/useAuth.js'

const PAGE_SIZE = 8
const formatUpdated = value =>
  value
    ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(
        new Date(value)
      )
    : '—'

function seoState(record) {
  const hasTitle = Boolean((record.metaTitle || '').trim())
  const hasDescription = Boolean((record.metaDescription || '').trim())
  const hasImage = Boolean((record.image || '').trim())
  if (hasTitle && hasDescription && hasImage) return { label: 'SEO ready', tone: 'ready' }
  if (hasTitle || hasDescription) return { label: 'Partial SEO', tone: 'partial' }
  return { label: 'Needs SEO', tone: 'missing' }
}

export default function CmsList({ title, storageKey }) {
  const { hasPermission } = useAuth()
  const location = useLocation()
  const accessPath = storageKey === 'blog' ? '/cms/blog' : '/cms/route-seo'
  const canCreate = hasPermission(accessPath, 'create')
  const canEdit = hasPermission(accessPath, 'edit')
  const canDelete = hasPermission(accessPath, 'delete')
  const { records, loading, error, deleteRecord } = useCollectionRecords(storageKey)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const isBlog = storageKey === 'blog'
  const Icon = isBlog ? FileText : MapPinned
  const filtered = records.filter(record =>
    `${record.title || ''} ${record.slug || ''} ${record.metaTitle || ''}`
      .toLowerCase()
      .includes(query.trim().toLowerCase())
  )
  const pages = Math.ceil(filtered.length / PAGE_SIZE)
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  async function remove(id) {
    if (!canDelete) return
    if (!window.confirm('Delete this record?')) return
    await deleteRecord(id)
  }
  return (
    <div className="area-list-page">
      <div className="area-list-topbar">
        <div>
          <h1>{title}</h1>
          <p>Create and manage your {isBlog ? 'blog posts' : 'route landing pages'}.</p>
        </div>
        {canCreate && (
          <Link className="btn area-create-btn" to={`${location.pathname}/create`}>
            <Plus size={17} /> Add {isBlog ? 'Blog Post' : 'Route Page'}
          </Link>
        )}
      </div>
      <section className="card area-list-card">
        {error && (
          <p className="m-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error.message}</p>
        )}
        <div className="area-list-heading">
          <div className="area-list-title">
            <span className="area-list-icon">
              <Icon size={18} />
            </span>
            <h2>Saved {isBlog ? 'Blog Posts' : 'Route Pages'}</h2>
          </div>
          <label className="area-search">
            <span>Search:</span>
            <span className="area-search-input">
              <input
                value={query}
                onChange={event => {
                  setQuery(event.target.value)
                  setPage(1)
                }}
                aria-label={`Search saved ${title} records`}
              />
              <Search size={17} />
            </span>
          </label>
        </div>
        <div className="area-table-wrap">
          <table className="area-table cms-seo-table">
            <thead>
              <tr>
                <th>{isBlog ? 'Post' : 'Page'}</th>
                <th>Slug</th>
                <th>SEO</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(record => {
                const seo = seoState(record)
                return (
                  <tr key={record.id}>
                    <td>
                      <div className="cms-title-cell">
                        {record.image ? (
                          <img
                            className="cms-thumb"
                            src={record.image}
                            alt=""
                            loading="lazy"
                            onError={event => {
                              event.currentTarget.style.visibility = 'hidden'
                            }}
                          />
                        ) : (
                          <span className="cms-thumb cms-thumb-empty" aria-hidden="true">
                            <Icon size={15} />
                          </span>
                        )}
                        <span>
                          <strong>{record.title || 'Untitled'}</strong>
                          <small className="cms-meta-line">
                            {(record.metaTitle || record.metaDescription || 'No meta description yet').slice(0, 70)}
                          </small>
                        </span>
                      </div>
                    </td>
                    <td>
                      <code>{record.slug || '—'}</code>
                    </td>
                    <td>
                      <span className={`seo-chip is-${seo.tone}`}>{seo.label}</span>
                    </td>
                    <td>
                      <span
                        className={`area-badge ${record.status === 'Published' ? 'published' : 'draft'}`}
                      >
                        {record.status || 'Draft'}
                      </span>
                    </td>
                    <td className="updated-cell">{formatUpdated(record.updatedAt)}</td>
                    <td>
                      <div className="cms-row-actions">
                        {canEdit && (
                          <Link
                            className="area-edit-btn"
                            aria-label={`Edit ${record.title || 'record'}`}
                            title="Edit"
                            to={`${location.pathname}/${record.id}/edit`}
                          >
                            <Pencil size={16} />
                          </Link>
                        )}
                        {canDelete && (
                          <button
                            className="cms-delete-btn"
                            type="button"
                            aria-label={`Delete ${record.title || 'record'}`}
                            title="Delete"
                            onClick={() => remove(record.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!loading && !visible.length && (
            <div className="area-empty">
              <Icon size={28} />
              <p>
                {query
                  ? `No matching ${isBlog ? 'blog posts' : 'route pages'} found.`
                  : `No ${isBlog ? 'blog posts' : 'route pages'} saved yet.`}
              </p>
              {canCreate && (
                <Link to={`${location.pathname}/create`}>
                  Create your first {isBlog ? 'post' : 'page'}
                </Link>
              )}
            </div>
          )}
        </div>
        <Pagination page={page} pages={pages} onChange={setPage} />
      </section>
    </div>
  )
}
