export default function SearchBox(props) {
  return (
    <input
      type="search"
      placeholder="Search records..."
      aria-label="Search records"
      className="field max-w-sm"
      {...props}
    />
  )
}
