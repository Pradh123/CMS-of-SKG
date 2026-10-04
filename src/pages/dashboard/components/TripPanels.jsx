import {
  AlertTriangle,
  CalendarCheck,
  Clock3,
  FileText,
  MessageSquare,
  NotebookTabs,
  Users,
  UserRound,
} from 'lucide-react'

const icons = {
  message: MessageSquare,
  users: Users,
  vendor: NotebookTabs,
  alert: AlertTriangle,
  invoice: FileText,
  user: UserRound,
}

function TripTable({ trip }) {
  return (
    <article className="dashboard-card trip-table-card">
      <header className="trip-table-heading">
        <span className="dashboard-icon tone-blue">
          <CalendarCheck size={17} />
        </span>
        <h2>{trip.title}</h2>
        <span className="dashboard-action">View All</span>
      </header>
      <div className="trip-table-scroll">
        <table>
          <thead>
            <tr>
              {trip.columns.map(column => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={trip.columns.length}>{trip.empty}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="trip-table-total">{trip.total}</p>
    </article>
  )
}

function QuickStats({ stats }) {
  return (
    <section className="dashboard-quick-stats">
      {stats.map(stat => {
        const Icon = icons[stat.icon] || Clock3
        return (
          <article className="dashboard-card quick-stat" key={stat.label}>
            <span className="dashboard-icon tone-blue">
              <Icon size={18} fill={stat.icon === 'message' ? 'currentColor' : 'none'} />
            </span>
            <div>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          </article>
        )
      })}
    </section>
  )
}

export default function TripPanels({ trips, showRegular = true, showPickup = true }) {
  return (
    <section className="dashboard-bottom">
      {showRegular && <TripTable trip={trips.todayRegular} />}
      {showRegular && <TripTable trip={trips.upcoming} />}
      {showPickup && <TripTable trip={trips.todayPickup} />}
      {trips.quickStats.length > 0 && <QuickStats stats={trips.quickStats} />}
    </section>
  )
}
