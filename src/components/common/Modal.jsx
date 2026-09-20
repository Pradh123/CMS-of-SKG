export default function Modal({ open, title, children, onClose }) {
  if (!open) return null
  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="card max-w-lg w-full"
        onClick={event => event.stopPropagation()}
      >
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}
