import PageHeader from '../../components/layout/PageHeader.jsx'
import DashboardCharts from './components/DashboardCharts.jsx'
import DashboardStats from './components/DashboardStats.jsx'
import TripPanels from './components/TripPanels.jsx'
import { dashboardData } from './data/dashboardData.js'
import './dashboard.css'

export default function Dashboard() {
  return (
    <div className="dashboard-page">
      <PageHeader title="Dashboard" description="Fleet and trip activity at a glance." />
      <DashboardStats stats={dashboardData.stats} />
      <DashboardCharts charts={dashboardData.charts} />
      <TripPanels trips={{ ...dashboardData.trips, quickStats: dashboardData.quickStats }} />
    </div>
  )
}
