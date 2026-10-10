export default function Loading({ variant = 'page', rows = 6 }) {
  if (variant === 'app')
    return (
      <div className="app-loader" role="status" aria-label="Loading admin">
        <img src="/logo/skg-logo.png" alt="SKG Travels" />
        <span className="app-loader-spinner" aria-hidden="true" />
      </div>
    )
  return (
    <div
      className={`loading-skeleton loading-skeleton-${variant}`}
      role="status"
      aria-label="Loading content"
      aria-busy="true"
    >
      <div className="skeleton skeleton-heading" aria-hidden="true" />
      <div className="skeleton skeleton-subheading" aria-hidden="true" />
      <div className="skeleton-grid" aria-hidden="true">
        {Array.from({ length: rows }, (_, index) => (
          <div
            key={index}
            className={`skeleton ${variant === 'gallery' ? 'skeleton-image' : 'skeleton-row'}`}
          />
        ))}
      </div>
    </div>
  )
}
