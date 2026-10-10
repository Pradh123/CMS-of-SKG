import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import MediaLibrary from './MediaLibrary.jsx'
export default function MediaPicker({ open, onClose, onSelect, multiple = true }) {
  const ref = useRef(null)
  const title = 'Choose blog images'
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement
    ref.current?.showModal()
    return () => {
      ref.current?.close()
      previous?.focus?.()
    }
  }, [open])
  if (!open) return null
  return createPortal(
    <dialog ref={ref} className="media-dialog" onCancel={onClose} aria-label={title}>
      <div className="media-dialog-heading">
        <h2>{title}</h2>
        <button type="button" onClick={onClose} aria-label="Close gallery">
          <X size={22} />
        </button>
      </div>
      <MediaLibrary
        multiple={multiple}
        onSelect={items => {
          ref.current?.close()
          onSelect(items)
          onClose()
        }}
      />
    </dialog>,
    document.body
  )
}
