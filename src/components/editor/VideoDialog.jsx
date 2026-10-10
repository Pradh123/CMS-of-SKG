import RequiredMark from '../common/RequiredMark.jsx'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Video, Play, Link2 } from 'lucide-react'
import { parseVideoUrl } from '../../utils/editorVideo.js'
export default function VideoDialog({ open, onClose, onSave }) {
  const ref = useRef(null)
  const [url, setUrl] = useState(''),
    [title, setTitle] = useState(''),
    [error, setError] = useState('')
  useEffect(() => {
    if (open) {
      setUrl('')
      setTitle('')
      setError('')
      ref.current?.showModal()
    }
  }, [open])
  if (!open) return null
  const submit = event => {
    event.preventDefault()
    try {
      parseVideoUrl(url)
      ref.current?.close()
      onSave(url, title)
      onClose()
    } catch (e) {
      setError(e.message)
    }
  }
  let preview = null
  try {
    if (url) preview = parseVideoUrl(url)
  } catch {}
  return createPortal(
    <dialog
      ref={ref}
      className="media-dialog editor-video-dialog"
      aria-labelledby="insert-video-title"
      onCancel={onClose}
    >
      <div className="media-dialog-heading">
        <div className="video-dialog-title">
          <span className="video-dialog-icon">
            <Video size={22} />
          </span>
          <div>
            <h2 id="insert-video-title">Insert video</h2>
            <p>Add a video link to your page content.</p>
          </div>
        </div>
        <button type="button" aria-label="Close video dialog" onClick={onClose}>
          <X size={22} />
        </button>
      </div>
      <form onSubmit={submit} className="video-dialog-form">
        <div className="video-dialog-body">
          <label className="form-label">
            <span>
              Video link
              <RequiredMark />
            </span>
            <input
              autoFocus
              required
              type="url"
              className="field"
              placeholder="YouTube, Vimeo or direct video URL"
              value={url}
              onChange={e => {
                setUrl(e.target.value)
                setError('')
              }}
            />
            <span className="video-field-hint">
              Supports YouTube, Vimeo and direct MP4 / WebM links.
            </span>
          </label>
          <label className="form-label">
            <span>
              Video title <small>(optional)</small>
            </span>
            <input
              className="field"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Describe the video"
            />
          </label>
          {error && (
            <p role="alert" className="video-dialog-error">
              {error}
            </p>
          )}
          {preview && (
            <div className="video-dialog-preview">
              <span className="video-preview-label">
                <Play size={14} /> Video preview
              </span>
              <div className="cms-video">
                {preview.kind === 'iframe' ? (
                  <iframe src={preview.src} title={title || 'Video preview'} allowFullScreen />
                ) : (
                  <video src={preview.src} controls preload="metadata" />
                )}
              </div>
            </div>
          )}
          {!preview && (
            <div className="video-preview-empty">
              <Link2 size={24} />
              <p>Paste a video link above to see a preview.</p>
            </div>
          )}
        </div>
        <div className="video-dialog-actions">
          <button className="btn btn-primary" type="submit">
            <Video size={16} /> Insert video
          </button>
          <button className="btn" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </dialog>,
    document.body
  )
}
