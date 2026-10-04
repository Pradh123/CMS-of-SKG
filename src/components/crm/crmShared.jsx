import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, Download, FileText, Image as ImageIcon } from 'lucide-react'
import AppToast from '../common/AppToast.jsx'

export const inputClass =
  'h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500'
export const labelClass =
  'mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-600'

export function getSections(config) {
  if (!Array.isArray(config?.sections)) return []
  return config.sections.map((section, index) => {
    if (Array.isArray(section)) return { title: `Details ${index + 1}`, fields: section }
    return {
      ...section,
      title: section.title || section.label || `Details ${index + 1}`,
      fields: Array.isArray(section.fields) ? section.fields : [],
    }
  })
}

export function getFields(config) {
  return getSections(config).flatMap(section => section.fields)
}

export function optionValue(option) {
  return typeof option === 'object' && option !== null
    ? (option.value ?? option.label ?? '')
    : option
}

export function optionLabel(option) {
  return typeof option === 'object' && option !== null
    ? (option.label ?? option.value ?? '')
    : option
}

export function getOptions(field) {
  return Array.isArray(field?.options) ? field.options : []
}

export function isBlank(value) {
  return value === undefined || value === null || value === ''
}

export function isFileObject(value) {
  return Boolean(
    value && typeof value === 'object' && (value.dataUrl || value.url) && (value.name || value.type)
  )
}

export function fileUrl(value) {
  if (isFileObject(value)) return value.dataUrl || value.url || ''
  return typeof value === 'string' ? value : ''
}

export function fileName(value, fallback = 'Attached file') {
  if (isFileObject(value)) return value.name || fallback
  if (typeof value === 'string' && value && !value.startsWith('data:')) {
    const clean = value.split('?')[0].split('#')[0]
    return decodeURIComponent(clean.split('/').pop() || fallback)
  }
  return fallback
}

export function isImageValue(value, descriptor = {}) {
  const url = fileUrl(value)
  const type = String(descriptor.type || '').toLowerCase()
  const mime = isFileObject(value) ? String(value.type || '').toLowerCase() : ''
  const name = isFileObject(value) ? String(value.name || '') : url
  const acceptRules = String(descriptor.accept || '')
    .toLowerCase()
    .split(',')
    .map(rule => rule.trim())
    .filter(Boolean)
  const acceptsOnlyImages =
    acceptRules.length > 0 &&
    acceptRules.every(
      rule => rule.startsWith('image/') || /^\.(avif|gif|jpe?g|png|svg|webp)$/.test(rule)
    )

  if (mime) return mime.startsWith('image/')
  if (/^data:/i.test(url)) return /^data:image\//i.test(url)
  if (/\.[a-z0-9]+(\?.*)?$/i.test(name)) {
    return /\.(avif|gif|jpe?g|png|svg|webp)(\?.*)?$/i.test(name)
  }
  return type === 'image' || acceptsOnlyImages
}

export function getRecordName(config, record) {
  if (!record) return config?.singular || 'Record'
  const primary = config?.columns?.find(column => column.primary)?.key
  const value =
    record[primary] ??
    record.name ??
    record.title ??
    record.driverName ??
    record.vehicleNumber ??
    record.id
  return isBlank(value) ? config?.singular || 'Record' : String(value)
}

export function searchableText(value) {
  if (isBlank(value)) return ''
  if (Array.isArray(value)) return value.map(searchableText).join(' ')
  if (isFileObject(value)) return `${value.name || ''} ${value.type || ''}`
  if (typeof value === 'object') return Object.values(value).map(searchableText).join(' ')
  const text = String(value)
  return text.startsWith('data:') ? '' : text
}

function validDate(value) {
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatPlainValue(value, format, record) {
  if (typeof format === 'function') return format(value, record)
  if (isBlank(value)) return '—'
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (isFileObject(value)) return value.name || 'Attached file'

  const formatType = typeof format === 'object' ? format.type : format
  if (formatType === 'date' || formatType === 'datetime') {
    const date = validDate(value)
    if (!date) return String(value)
    const options =
      formatType === 'datetime'
        ? { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
        : { day: '2-digit', month: 'short', year: 'numeric' }
    return new Intl.DateTimeFormat('en-IN', options).format(date)
  }
  if (formatType === 'currency') {
    const amount = Number(value)
    if (!Number.isFinite(amount)) return String(value)
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: typeof format === 'object' ? format.currency || 'INR' : 'INR',
      maximumFractionDigits: 2,
    }).format(amount)
  }
  if (formatType === 'number') {
    const number = Number(value)
    return Number.isFinite(number) ? new Intl.NumberFormat('en-IN').format(number) : String(value)
  }
  if (formatType === 'phone' || formatType === 'tel') return String(value)
  if (typeof value === 'object') return value.label ?? value.name ?? JSON.stringify(value)
  return String(value)
}

function statusClasses(value) {
  const normalized = String(value || '').toLowerCase()
  if (
    [
      'inactive',
      'blocked',
      'cancelled',
      'canceled',
      'expired',
      'failed',
      'missing',
      'overdue',
      'rejected',
      'unavailable',
    ].some(item => normalized.includes(item))
  )
    return 'border-rose-200 bg-rose-50 text-rose-700'
  if (
    [
      'active',
      'available',
      'approved',
      'completed',
      'paid',
      'success',
      'published',
      'resolved',
    ].some(item => normalized.includes(item))
  )
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  if (
    ['pending', 'draft', 'due', 'maintenance', 'progress', 'assigned'].some(item =>
      normalized.includes(item)
    )
  )
    return 'border-amber-200 bg-amber-50 text-amber-700'
  return 'border-sky-200 bg-sky-50 text-sky-700'
}

export function ValuePreview({ value, descriptor = {}, compact = false }) {
  const format = descriptor.format || descriptor.type
  if (isBlank(value)) return <span className="text-slate-400">—</span>

  if (isImageValue(value, descriptor)) {
    const src = fileUrl(value)
    if (!src) return <span className="text-slate-400">—</span>
    return (
      <a
        className="inline-flex"
        href={src}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open ${descriptor.label || 'image'}`}
      >
        <img
          className={
            compact
              ? 'h-10 w-10 rounded-xl border border-slate-200 object-cover shadow-sm'
              : 'h-28 w-40 rounded-2xl border border-slate-200 bg-slate-50 object-cover shadow-sm sm:h-36 sm:w-52'
          }
          src={src}
          alt={descriptor.label || fileName(value, 'Uploaded image')}
        />
      </a>
    )
  }

  if (descriptor.type === 'file' || isFileObject(value)) {
    const href = fileUrl(value)
    return href ? (
      <a
        className="inline-flex max-w-full items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
        href={href}
        target="_blank"
        rel="noreferrer"
        download={isFileObject(value) ? value.name : undefined}
      >
        <FileText size={16} className="shrink-0" />
        <span className="truncate">{fileName(value)}</span>
        <Download size={14} className="shrink-0" />
      </a>
    ) : (
      <span className="text-slate-400">—</span>
    )
  }

  if (format === 'status' || format === 'badge') {
    return (
      <span
        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusClasses(value)}`}
      >
        {String(value)}
      </span>
    )
  }

  const rendered = formatPlainValue(value, descriptor.format, descriptor.record)
  return typeof rendered === 'string' || typeof rendered === 'number' ? (
    <span className={compact ? 'line-clamp-2 break-all' : 'whitespace-pre-wrap break-words'}>
      {rendered}
    </span>
  ) : (
    rendered
  )
}

export function CrudToast({ toast, onClose }) {
  return <AppToast toast={toast} onClose={onClose} />
}

export function ConfirmDialog({
  open,
  recordName,
  singular = 'record',
  onCancel,
  onConfirm,
  busy = false,
}) {
  const cancelRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    cancelRef.current?.focus()
    const closeOnEscape = event => {
      if (event.key === 'Escape' && !busy) onCancel()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open, busy, onCancel])

  if (!open || typeof document === 'undefined') return null
  return createPortal(
    <div
      className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
      onMouseDown={event => {
        if (event.target === event.currentTarget && !busy) onCancel()
      }}
    >
      <section
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="crud-delete-title"
        aria-describedby="crud-delete-copy"
      >
        <div className="flex items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600">
            <AlertTriangle size={21} />
          </span>
          <div>
            <h2 id="crud-delete-title" className="text-lg font-bold text-slate-800">
              Delete {singular}?
            </h2>
            <p id="crud-delete-copy" className="mt-2 text-sm leading-6 text-slate-500">
              “{recordName}” will be permanently removed. This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            disabled={busy}
            type="button"
            onClick={onCancel}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            disabled={busy}
            type="button"
            onClick={onConfirm}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-semibold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-100 disabled:cursor-wait disabled:opacity-60"
          >
            {busy && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {busy ? 'Deleting…' : `Delete ${singular}`}
          </button>
        </div>
      </section>
    </div>,
    document.body
  )
}

export function EmptyIllustration({ image = false }) {
  return (
    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-sky-50 text-sky-600">
      {image ? <ImageIcon size={25} /> : <FileText size={25} />}
    </span>
  )
}
