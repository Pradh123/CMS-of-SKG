export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null
  return (
    <div className="flex gap-3 items-center mt-5">
      <button className="btn btn-secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </button>
      <span>
        Page {page} of {pages}
      </span>
      <button
        className="btn btn-secondary"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </div>
  )
}
