import { useEffect, useState } from 'react'
import { mediaApi } from '../../services/mediaApi.js'
export default function SecureMedia({ value, compact = false }) {
  const [preview, setPreview] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    setPreview('')
    setError('')
  }, [value.mediaId])
  const open = async () => {
    setBusy(true)
    setError('')
    try {
      const result = await mediaApi.url(value.mediaId)
      setPreview(result.url)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <div>
      <button type="button" className="btn" disabled={busy} onClick={open}>
        {busy ? 'Loading?' : preview ? 'Refresh access' : 'View private file'}
        {!compact && ' ? ' + value.name}
      </button>
      {error && <p role="alert">{error}</p>}
      {preview && (
        <div>
          {value.type?.startsWith('image/') ? (
            <img
              src={preview}
              alt={value.name}
              className="max-h-64 max-w-full rounded-lg"
              onError={() => {
                setPreview('')
                setError('Access expired. Click View private file again.')
              }}
            />
          ) : (
            <a href={preview} target="_blank" rel="noreferrer">
              Open document
            </a>
          )}
        </div>
      )}
    </div>
  )
}
