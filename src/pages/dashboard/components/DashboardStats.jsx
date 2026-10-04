import { BusFront, CarFront, Fuel, IndianRupee, Route, UserRound } from 'lucide-react'

const icons = { car: CarFront, driver: UserRound, route: Route, fuel: Fuel, rupee: IndianRupee }

export default function DashboardStats({ stats }) {
  return <section className="dashboard-stats" aria-label="Fleet summary">
    {stats.map(stat => {
      const Icon = icons[stat.icon] || BusFront
      return <article className="dashboard-card dashboard-stat" key={stat.label}>
        <span className={`dashboard-icon tone-${stat.tone}`}><Icon size={20} strokeWidth={2.5} /></span>
        <div className="dashboard-stat-copy"><span>{stat.label}</span><strong>{stat.value}</strong><small>{stat.detail}</small></div>
      </article>
    })}
  </section>
}
