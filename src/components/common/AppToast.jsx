import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, CircleAlert, X } from 'lucide-react'

export default function AppToast({ toast, onClose, duration = 4000 }) {
  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(onClose, duration)
    return () => window.clearTimeout(timer)
  }, [toast, onClose, duration])

  if (!toast || typeof document === 'undefined') return null
  const success = toast.type !== 'error'
  const title = toast.title || (success ? 'Done' : 'Couldn’t complete that')

  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-3 top-3 z-[150] flex justify-center sm:inset-x-5 sm:top-5 sm:justify-end"
      role={success ? 'status' : 'alert'}
      aria-live={success ? 'polite' : 'assertive'}
    >
      <div
        className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.18)] ${success ? 'border-emerald-200' : 'border-rose-200'}`}
      >
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${success ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}
        >
          {success ? <CheckCircle2 size={19} /> : <CircleAlert size={19} />}
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-sm font-bold text-slate-800">{title}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{toast.message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-400"
          aria-label="Dismiss notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>,
    document.body
  )
}
