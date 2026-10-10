import { CalendarDays } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

function DonutCard({ title, total, data, colors, rows, action }) {
  const hasData = data.some(item => Number(item.value) > 0)
  return (
    <article className="dashboard-card donut-card">
      <header className="dashboard-card-heading">
        <h2>{title}</h2>
        {action && (
          <a className="dashboard-action" href={action}>
            View All
          </a>
        )}
      </header>
      <div className="donut-wrap">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="70%"
                outerRadius="96%"
                paddingAngle={0}
                stroke="none"
                startAngle={90}
                endAngle={-270}
              >
                {data.map((item, i) => (
                  <Cell key={item.name} fill={colors[i]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <svg
            width="145"
            height="145"
            viewBox="0 0 145 145"
            role="img"
            aria-label={`${title}: no data yet`}
          >
            <circle cx="72.5" cy="72.5" r="59" fill="none" stroke="#e2eaf1" strokeWidth="18" />
          </svg>
        )}
        <div className="donut-total">
          <strong>{total}</strong>
          <span>{hasData ? 'Total' : 'No data yet'}</span>
        </div>
      </div>
      <div className="donut-legend">
        {rows.map((row, i) => (
          <div className="legend-row" key={row.label}>
            <i style={{ background: colors[i] }} />
            <span>{row.label}</span>
            <strong>{row.value}</strong>
            <small>{row.percent}</small>
          </div>
        ))}
      </div>
    </article>
  )
}

export default function DashboardCharts({ charts, showTrips = true, showVehicles = true }) {
  const tripTotal = Number(charts.trips.total) || 0
  const vehicleTotal = Number(charts.vehicles.total) || 0
  const tripRows = [
    {
      label: 'Regular Trips',
      value: charts.trips.regular,
      percent: `${(tripTotal ? (charts.trips.regular / tripTotal) * 100 : 0).toFixed(1)}%`,
    },
    {
      label: 'Pick Up / Drop',
      value: charts.trips.pickup,
      percent: `${(tripTotal ? (charts.trips.pickup / tripTotal) * 100 : 0).toFixed(1)}%`,
    },
  ]
  const vehicleRows = [
    {
      label: 'Active',
      value: charts.vehicles.active,
      percent: `${(vehicleTotal ? (charts.vehicles.active / vehicleTotal) * 100 : 0).toFixed(0)}%`,
    },
    {
      label: 'Inactive',
      value: charts.vehicles.inactive,
      percent: `${(vehicleTotal ? (charts.vehicles.inactive / vehicleTotal) * 100 : 0).toFixed(0)}%`,
    },
  ]
  if (!showTrips && !showVehicles) return null
  return (
    <section className="dashboard-overview" aria-label="Trip and vehicle overview">
      {showTrips && (
        <article className="dashboard-card trips-overview">
          <header className="dashboard-card-heading">
            <h2>Trips Overview</h2>
            <span className="dashboard-action muted">All recorded trips</span>
          </header>
          <strong className="overview-number">{tripTotal}</strong>
          <p className="overview-caption">Latest trip on record: {charts.latestTrip}</p>
          <div className="overview-empty">
            <CalendarDays size={25} />
            <span>
              {tripTotal ? `${tripTotal} trip(s) recorded.` : 'No trips have been recorded yet.'}
            </span>
          </div>
        </article>
      )}
      {showTrips && (
        <DonutCard
          title="Trips by Type"
          total={charts.trips.total}
          data={[
            { name: 'Regular Trips', value: charts.trips.regular },
            { name: 'Pick Up / Drop', value: charts.trips.pickup },
          ]}
          colors={['#1173c5', '#83c438']}
          rows={tripRows}
        />
      )}
      {showVehicles && (
        <DonutCard
          title="Vehicle Status"
          total={charts.vehicles.total}
          data={[
            { name: 'Active', value: charts.vehicles.active },
            { name: 'Inactive', value: charts.vehicles.inactive },
          ]}
          colors={['#83c438', '#f4a52f']}
          rows={vehicleRows}
          action="/vehicles"
        />
      )}
    </section>
  )
}
