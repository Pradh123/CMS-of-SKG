import { FormSelect } from '../common/FormControls.jsx'
import { useEffect, useRef, useState } from 'react'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  UploadCloud,
  Search,
  X,
  Pencil,
  Trash2,
} from 'lucide-react'
import { mediaApi } from '../../services/mediaApi.js'
import useAuth from '../../hooks/useAuth.js'
const PAGE_SIZE = 24
const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
export default function MediaLibrary({ onSelect, multiple = true }) {
  const { hasPermission } = useAuth()
  const inputRef = useRef(null)
  const editRef = useRef(null)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const libraryRef = useRef(null)
  const [items, setItems] = useState([])
  const [pending, setPending] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState([])
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [dragging, setDragging] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const canUpload = hasPermission('/gallery', 'create') || hasPermission('/gallery', 'edit')
  const busy = uploading || loading || saving || Boolean(deleting)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchInput])
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setItems([])
    setError('')
    mediaApi
      .list('/gallery', page, PAGE_SIZE, controller.signal, search)
      .then(data => {
        if (controller.signal.aborted) return
        if (page > data.pages) {
          setPage(data.pages)
          return
        }
        setItems(data.items)
        setPagination({ total: data.total, pages: data.pages })
      })
      .catch(e => {
        if (!controller.signal.aborted) setError(e.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [page, refresh, search])
  const queueFiles = files => {
    if (!canUpload || uploading) return
    const invalid = files.find(file => !TYPES.includes(file.type) || file.size > 2 * 1024 * 1024)
    if (invalid) {
      setError(invalid.name + ': choose a supported image up to 2 MB.')
      return
    }
    setError('')
    setPending(old => [
      ...old,
      ...files.map(file => ({ file, name: file.name.replace(/\.[^.]+$/, ''), alt: '' })),
    ])
  }
  const uploadFiles = async event => {
    event.preventDefault()
    const files = pending.map(item => item.file)
    if (!canUpload || uploading || !files.length) return
    const invalid = files.find(file => !TYPES.includes(file.type) || file.size > 2 * 1024 * 1024)
    if (invalid) {
      setError(invalid.name + ': choose a JPG, PNG, WEBP or GIF image up to 2 MB.')
      return
    }
    if (pending.some(item => !item.name.trim() || !item.alt.trim())) {
      setError('Image name and alt text are required for every image.')
      return
    }
    setUploading(true)
    setError('')
    setNotice('')
    setProgress({ done: 0, total: files.length })
    let done = 0,
      failure = ''
    try {
      for (const item of pending) {
        await mediaApi.upload(item.file, '/gallery', {
          name: item.name.trim(),
          alt: item.alt.trim(),
        })
        done++
        setProgress({ done, total: files.length })
      }
    } catch (e) {
      failure = e.message
    } finally {
      setUploading(false)
      setPending(old => old.slice(done))
      if (done) {
        setSearchInput('')
        setSearch('')
        setPage(1)
        setRefresh(old => old + 1)
      }
      setNotice(
        failure
          ? done + ' uploaded. ' + failure
          : done + ' image' + (done === 1 ? '' : 's') + ' uploaded successfully.'
      )
    }
  }
  const beginEdit = item => {
    setEditing({ ...item })
    setError('')
    setNotice('')
    requestAnimationFrame(() => {
      editRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      editRef.current?.querySelector('input')?.focus({ preventScroll: true })
    })
  }
  const saveEdit = async event => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const updated = await mediaApi.update(editing.id, { name: editing.name, alt: editing.alt })
      setSelected(old => old.map(item => (item.id === updated.id ? updated : item)))
      setEditing(null)
      setNotice('Image details updated.')
      setRefresh(old => old + 1)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }
  const deleteImage = async item => {
    if (
      !window.confirm('Delete "' + item.name + '"? Blogs using this image URL will lose the image.')
    )
      return
    setDeleting(item.id)
    setError('')
    try {
      await mediaApi.remove(item.id)
      setSelected(old => old.filter(image => image.id !== item.id))
      if (editing?.id === item.id) setEditing(null)
      setNotice('Image deleted.')
      setRefresh(old => old + 1)
    } catch (e) {
      setError(e.message)
    } finally {
      setDeleting(null)
    }
  }
  const toggle = item =>
    setSelected(old =>
      old.some(i => i.id === item.id)
        ? old.filter(i => i.id !== item.id)
        : multiple
          ? [...old, item]
          : [item]
    )
  const start = pagination.total ? (page - 1) * PAGE_SIZE + 1 : 0
  const pageNumbers = Array.from(
    { length: Math.min(5, pagination.pages) },
    (_, i) => Math.max(1, Math.min(page - 2, pagination.pages - 4)) + i
  )
  return (
    <div ref={libraryRef} className="media-library">
      {editing && (
        <form ref={editRef} className="media-upload-form media-edit-panel" onSubmit={saveEdit}>
          <div className="media-edit-heading">
            <h3>Edit image details</h3>
            <button
              type="button"
              aria-label="Cancel image edit"
              disabled={saving}
              onClick={() => setEditing(null)}
            >
              <X size={20} />
            </button>
          </div>
          <div className="media-edit-fields">
            <img src={editing.url} alt={editing.alt || editing.name} />
            <label>
              Image name *
              <input
                required
                maxLength={200}
                value={editing.name}
                disabled={saving}
                onChange={e => setEditing(old => ({ ...old, name: e.target.value }))}
              />
            </label>
            <label>
              Alt text *
              <input
                required
                maxLength={300}
                value={editing.alt || ''}
                disabled={saving}
                onChange={e => setEditing(old => ({ ...old, alt: e.target.value }))}
              />
            </label>
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>{' '}
          <button type="button" className="btn" disabled={saving} onClick={() => setEditing(null)}>
            Cancel
          </button>
        </form>
      )}
      {canUpload && !editing && (
        <div
          className={'media-dropzone' + (dragging ? ' is-dragging' : '')}
          onDragOver={e => {
            e.preventDefault()
            if (!uploading) setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => {
            e.preventDefault()
            setDragging(false)
            queueFiles(Array.from(e.dataTransfer.files))
          }}
        >
          <span className="media-upload-icon">
            <UploadCloud size={26} />
          </span>
          <div className="media-upload-copy">
            <h3>Upload blog images</h3>
            <p>Drag and drop images here, or choose files from your device.</p>
            <small>JPG, PNG, WEBP or GIF ? Up to 2 MB each ? Multiple images supported</small>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus size={17} /> {uploading ? 'Uploading...' : 'Choose images'}
          </button>
          <input
            ref={inputRef}
            className="sr-only"
            aria-label="Upload blog images"
            type="file"
            multiple
            accept={TYPES.join(',')}
            disabled={uploading}
            onChange={e => {
              const files = Array.from(e.target.files || [])
              e.target.value = ''
              queueFiles(files)
            }}
          />
          {uploading && (
            <div className="media-upload-progress" role="status">
              <span>
                Uploading {Math.min(progress.done + 1, progress.total)} of {progress.total}
              </span>
              <progress value={progress.done} max={progress.total} />
            </div>
          )}
        </div>
      )}
      {pending.length > 0 && (
        <form className="media-upload-form" onSubmit={uploadFiles}>
          <h3>
            Image details <span>Alt text is required for each image</span>
          </h3>
          {pending.map((item, index) => (
            <div className="media-pending-row" key={index}>
              <span className="media-pending-name" title={item.file.name}>
                {item.file.name}
              </span>
              <label>
                Image name *
                <input
                  required
                  maxLength={200}
                  value={item.name}
                  disabled={uploading}
                  onChange={e =>
                    setPending(old =>
                      old.map((entry, i) =>
                        i === index ? { ...entry, name: e.target.value } : entry
                      )
                    )
                  }
                />
              </label>
              <label>
                Alt text *
                <input
                  required
                  maxLength={300}
                  placeholder="Describe what is shown in the image"
                  value={item.alt}
                  disabled={uploading}
                  onChange={e =>
                    setPending(old =>
                      old.map((entry, i) =>
                        i === index ? { ...entry, alt: e.target.value } : entry
                      )
                    )
                  }
                />
              </label>
              <button
                type="button"
                aria-label={'Remove ' + item.file.name}
                disabled={uploading}
                onClick={() => setPending(old => old.filter((_, i) => i !== index))}
              >
                <X size={18} />
              </button>
            </div>
          ))}
          <button type="submit" className="btn btn-primary" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload ' + pending.length + ' images'}
          </button>
        </form>
      )}
      {notice && (
        <p className="media-notice" role="status">
          {notice}
        </p>
      )}
      <div className="media-tools">
        <div>
          <h2>Image library</h2>
          <span>{pagination.total} public blog images</span>
        </div>
        <label className="media-search">
          <Search size={17} />
          <input
            type="search"
            aria-label="Search gallery images"
            placeholder="Search image name or alt text..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
        </label>
        <label className="media-page-select">
          Page
          <FormSelect
            className="media-pagination-select"
            menuMinWidth={100}
            menuOwnerRef={libraryRef}
            aria-label="Gallery page"
            value={page}
            disabled={busy}
            onChange={e => setPage(Number(e.target.value))}
          >
            {Array.from({ length: pagination.pages }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </FormSelect>
        </label>
      </div>
      {error && (
        <div className="media-error" role="alert">
          {error}
          <button type="button" className="btn" onClick={() => setRefresh(old => old + 1)}>
            Retry
          </button>
        </div>
      )}
      {loading && (
        <div className="media-empty" role="status">
          Loading images...
        </div>
      )}
      {!loading && !items.length && !error && (
        <div className="media-empty">
          <ImagePlus size={32} />
          <h3>No images yet</h3>
          <p>Upload your blog images to start building your library.</p>
        </div>
      )}
      <div className="media-grid">
        {items.map(item => (
          <div
            key={item.id}
            className={'media-card' + (selected.some(i => i.id === item.id) ? ' is-selected' : '')}
          >
            {onSelect ? (
              <button
                type="button"
                className="media-thumbnail"
                aria-label={'Select ' + item.name}
                aria-pressed={selected.some(i => i.id === item.id)}
                onClick={() => toggle(item)}
              >
                <img src={item.url} alt={item.alt || item.name} loading="lazy" />
                {selected.some(i => i.id === item.id) && (
                  <span className="media-check">
                    <Check size={16} />
                  </span>
                )}
              </button>
            ) : (
              <a
                className="media-thumbnail"
                href={item.url}
                target="_blank"
                rel="noreferrer"
                aria-label={'View ' + item.name}
              >
                <img src={item.url} alt={item.name} loading="lazy" />
              </a>
            )}
            <div className="media-card-caption">
              <p title={item.name}>{item.name}</p>
              <p className="media-alt-caption" title={item.alt}>
                {item.alt || 'Alt text not set'}
              </p>
              <div className="media-card-actions">
                {hasPermission('/gallery', 'edit') && (
                  <button
                    type="button"
                    aria-label={'Edit ' + item.name}
                    title="Edit image details"
                    disabled={busy}
                    onClick={() => beginEdit(item)}
                  >
                    <Pencil size={16} />
                  </button>
                )}
                {hasPermission('/gallery', 'delete') && (
                  <button
                    type="button"
                    className="media-delete-button"
                    aria-label={'Delete ' + item.name}
                    title="Delete image"
                    disabled={busy}
                    onClick={() => deleteImage(item)}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <span>
                {Math.max(1, Math.round(item.size / 1024))} KB ?{' '}
                {item.type?.split('/')[1]?.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="media-pagination">
        <span>
          Showing {start}?{Math.min(page * PAGE_SIZE, pagination.total)} of {pagination.total}
        </span>
        <nav aria-label="Gallery pagination">
          <button
            type="button"
            aria-label="Previous page"
            disabled={busy || page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            <ChevronLeft size={17} />
          </button>
          {pageNumbers.map(number => (
            <button
              type="button"
              key={number}
              disabled={busy}
              aria-current={page === number ? 'page' : undefined}
              onClick={() => setPage(number)}
            >
              {number}
            </button>
          ))}
          <button
            type="button"
            aria-label="Next page"
            disabled={busy || page >= pagination.pages}
            onClick={() => setPage(p => p + 1)}
          >
            <ChevronRight size={17} />
          </button>
        </nav>
      </div>
      {onSelect && (
        <div className="media-footer">
          <span>
            {selected.length} selected{multiple ? ' across pages' : ''}
          </span>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!selected.length || busy}
            onClick={() => onSelect(selected)}
          >
            Insert {selected.length > 1 ? 'images' : 'image'}
          </button>
        </div>
      )}
    </div>
  )
}
