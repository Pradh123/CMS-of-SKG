import PageHeader from '../../../components/layout/PageHeader.jsx'

const Block = ({ className = '', style }) => (
  <div className={`skeleton ${className}`} style={style} />
)

export default function DashboardSkeleton({
  statsCount,
  showTrips,
  showVehicles,
  showRegular,
  showPickup,
  quickCount,
}) {
  return (
    <div
      className="dashboard-page dashboard-skeleton"
      role="status"
      aria-label="Loading dashboard"
      aria-busy="true"
    >
      <PageHeader title="Dashboard" description="Fleet and trip activity at a glance." />
      <div aria-hidden="true" className="dashboard-stats">
        {Array.from({ length: statsCount }, (_, index) => (
          <div className="dashboard-card dashboard-stat" key={index}>
            <Block className="dashboard-icon" />
            <div className="dashboard-stat-copy skeleton-stat-copy">
              <Block className="skeleton-line" />
              <Block className="skeleton-number" />
              <Block className="skeleton-line" />
            </div>
          </div>
        ))}
      </div>
      {(showTrips || showVehicles) && (
        <div className="dashboard-overview" aria-hidden="true">
          {showTrips && (
            <>
              <div className="dashboard-card trips-overview">
                <Block className="skeleton-heading" />
                <div className="skeleton-chart-bars">
                  {[45, 72, 55, 88, 65, 95, 60].map((height, index) => (
                    <Block key={index} style={{ height: `${height}%` }} />
                  ))}
                </div>
                <Block className="skeleton-line" />
              </div>
              <Donut />
            </>
          )}
          {showVehicles && <Donut />}
        </div>
      )}
      <div className="dashboard-bottom" aria-hidden="true">
        {Array.from({ length: (showRegular ? 2 : 0) + (showPickup ? 1 : 0) }, (_, index) => (
          <div key={index} className="dashboard-card trip-table-card skeleton-trip-card">
            <Block className="skeleton-heading" />
            {[0, 1, 2].map(row => (
              <Block key={row} className="skeleton-row" />
            ))}
          </div>
        ))}
        {quickCount > 0 && (
          <div className="dashboard-quick-stats">
            {Array.from({ length: quickCount }, (_, index) => (
              <div key={index} className="dashboard-card quick-stat">
                <Block className="dashboard-icon" />
                <Block className="skeleton-line" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Donut() {
  return (
    <div className="dashboard-card donut-card">
      <Block className="skeleton-heading" />
      <Block className="skeleton-donut" />
      {[0, 1].map(row => (
        <Block key={row} className="skeleton-row" />
      ))}
    </div>
  )
}
