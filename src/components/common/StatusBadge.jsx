export default function StatusBadge({ status = 'Draft' }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}
    >
      {status}
    </span>
  )
}
