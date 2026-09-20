export default function EmptyState({ message = 'No records found.' }) {
  return <div className="text-center text-slate-500 py-12">{message}</div>
}
