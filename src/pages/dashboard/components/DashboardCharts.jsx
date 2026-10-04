import { CalendarDays } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

function DonutCard({ title, total, data, colors, rows, action }) {
  return (
    <article className="dashboard-card donut-card">
      <header className="dashboard-card-heading">
        <h2>{title}</h2>
        {action && (
          <a className="dashboard-action" href="/">
            View All
          </a>
        )}
      </header>
      <div className="donut-wrap">
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
        <div className="donut-total">
          <strong>{total}</strong>
          <span>Total</span>
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
  const tripRows = [
    {
      label: 'Regular Trips',
      value: charts.trips.regular,
      percent: `${((charts.trips.regular / charts.trips.total) * 100).toFixed(1)}%`,
    },
    {
      label: 'Pick Up / Drop',
      value: charts.trips.pickup,
      percent: `${((charts.trips.pickup / charts.trips.total) * 100).toFixed(1)}%`,
    },
  ]
  const vehicleRows = [
    {
      label: 'Active',
      value: charts.vehicles.active,
      percent: `${((charts.vehicles.active / charts.vehicles.total) * 100).toFixed(0)}%`,
    },
    {
      label: 'Inactive',
      value: charts.vehicles.inactive,
      percent: `${((charts.vehicles.inactive / charts.vehicles.total) * 100).toFixed(0)}%`,
    },
  ]
  if (!showTrips && !showVehicles) return null
  return (
    <section className="dashboard-overview" aria-label="Trip and vehicle overview">
      {showTrips && (
        <article className="dashboard-card trips-overview">
          <header className="dashboard-card-heading">
            <h2>Trips Overview</h2>
            <span className="dashboard-action muted">No recent activity</span>
          </header>
          <strong className="overview-number">0</strong>
          <p className="overview-caption">Latest trip on record: {charts.latestTrip}</p>
          <div className="overview-empty">
            <CalendarDays size={25} />
            <span>No trips started in the last 12 months.</span>
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
          action
        />
      )}
    </section>
  )
}
