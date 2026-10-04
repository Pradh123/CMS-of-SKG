import PageHeader from '../../components/layout/PageHeader.jsx'
import DashboardCharts from './components/DashboardCharts.jsx'
import DashboardStats from './components/DashboardStats.jsx'
import TripPanels from './components/TripPanels.jsx'
import { dashboardData } from './data/dashboardData.js'
import useAuth from '../../hooks/useAuth.js'
import './dashboard.css'

export default function Dashboard() {
  const { hasPermission, isSuperAdmin } = useAuth()
  const statAccess = {
    'Total Vehicles': '/vehicles',
    'Total Drivers': '/drivers',
    'Total Trips': '/trips/regular',
    'Fuel Entries': '/fuel',
    'Invoiced Value': '/invoices',
  }
  const quickAccess = {
    Inquiries: '/leads',
    Parties: '/parties',
    Vendors: '/vendors',
    Issues: '/issues',
    Invoices: '/invoices',
    Users: '/users',
  }
  const canRegularTrips = hasPermission('/trips/regular', 'view')
  const canPickupTrips = hasPermission('/trips/pickup-drop', 'view')
  const stats = dashboardData.stats.filter(stat => hasPermission(statAccess[stat.label], 'view'))
  const quickStats = dashboardData.quickStats.filter(stat =>
    quickAccess[stat.label] === '/users'
      ? isSuperAdmin
      : hasPermission(quickAccess[stat.label], 'view')
  )

  return (
    <div className="dashboard-page">
      <PageHeader title="Dashboard" description="Fleet and trip activity at a glance." />
      <DashboardStats stats={stats} />
      <DashboardCharts
        charts={dashboardData.charts}
        showTrips={canRegularTrips || canPickupTrips}
        showVehicles={hasPermission('/vehicles', 'view')}
      />
      <TripPanels
        trips={{ ...dashboardData.trips, quickStats }}
        showRegular={canRegularTrips}
        showPickup={canPickupTrips}
      />
    </div>
  )
}
