import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Header from './Header.jsx'

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 800) {
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className={`admin-shell ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar isOpen={isSidebarOpen} isCollapsed={isSidebarCollapsed} onClose={() => setIsSidebarOpen(false)} />

      <div className="admin-main">
        <Header
          onToggleSidebar={() => {
            if (window.innerWidth <= 800) setIsSidebarOpen(current => !current)
            else setIsSidebarCollapsed(current => !current)
          }}
          isSidebarOpen={isSidebarOpen}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
