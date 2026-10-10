import { useEffect, useState } from 'react'
import PageHeader from '../../components/layout/PageHeader.jsx'
import DashboardCharts from './components/DashboardCharts.jsx'
import DashboardStats from './components/DashboardStats.jsx'
import TripPanels from './components/TripPanels.jsx'
import { dashboardData } from './data/dashboardData.js'
import useAuth from '../../hooks/useAuth.js'
import { dashboardApi } from '../../services/apiClient.js'
import './dashboard.css'

export default function Dashboard() {
  const { hasPermission, isSuperAdmin } = useAuth()
  const [data, setData] = useState(dashboardData)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    dashboardApi
      .get()
      .then(result => {
        const next = result?.dashboard || result
        if (active && next) {
          setData(current => ({
            ...current,
            ...next,
            stats: next.stats || current.stats,
            charts: { ...current.charts, ...(next.charts || {}) },
            trips: { ...current.trips, ...(next.trips || {}) },
            quickStats: next.quickStats || current.quickStats,
          }))
        }
      })
      .catch(requestError => {
        if (active) setError(requestError.message)
      })
    return () => {
      active = false
    }
  }, [])
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
  const stats = data.stats.filter(stat => {
    if (stat.label === 'Total Trips') return canRegularTrips || canPickupTrips
    const permission = statAccess[stat.label]
    return permission ? hasPermission(permission, 'view') : false
  })
  const quickStats = data.quickStats.filter(stat =>
    quickAccess[stat.label] === '/users'
      ? isSuperAdmin
      : hasPermission(quickAccess[stat.label], 'view')
  )

  return (
    <div className="dashboard-page">
      <PageHeader title="Dashboard" description="Fleet and trip activity at a glance." />
      {error && <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      <DashboardStats stats={stats} />
      <DashboardCharts
        charts={data.charts}
        showTrips={canRegularTrips || canPickupTrips}
        showVehicles={hasPermission('/vehicles', 'view')}
      />
      <TripPanels
        trips={{ ...data.trips, quickStats }}
        showRegular={canRegularTrips}
        showPickup={canPickupTrips}
      />
    </div>
  )
}
