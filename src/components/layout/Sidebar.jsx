import { useEffect, useState } from 'react'
import { ChevronDown, Menu as MenuIcon, UserRound } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { menu } from '../../config/menu.js'
import useAuth from '../../hooks/useAuth.js'

export default function Sidebar({ isOpen = true, isCollapsed = false, onClose }) {
  const location = useLocation()
  const { isSuperAdmin, userAccess } = useAuth()
  const [expanded, setExpanded] = useState({})
  const visibleMenu = menu.filter(
    item =>
      (!item.superAdminOnly || isSuperAdmin) &&
      (!item.path || isSuperAdmin || userAccess.includes(item.path))
  )

  useEffect(() => {
    setExpanded(current => {
      const next = { ...current }
      visibleMenu
        .filter(item => item.children?.some(child => child.path === location.pathname))
        .forEach(item => {
          next[item.label] = true
        })
      return next
    })
  }, [location.pathname])

  return (
    <aside className={`sidebar ${isOpen ? 'is-open' : ''} ${isCollapsed ? 'is-collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <img src="/logo/skg-logo.png" alt="SKG" className="sidebar-logo" />
          <strong>SKG Admin</strong>
        </div>
        <button
          type="button"
          className="sidebar-close"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <MenuIcon size={20} />
        </button>
      </div>
      <nav className="sidebar-nav">
        <p className="sidebar-section-label">Menu</p>
        <NavLink
          to="/profile"
          onClick={onClose}
          className="nav-item"
          title={isCollapsed ? 'User' : undefined}
        >
          <UserRound size={18} aria-hidden="true" />
          <span>User</span>
        </NavLink>
        {visibleMenu.map(item => {
          const Icon = item.icon
          const isExpanded =
            expanded[item.label] ??
            item.children?.some(child => child.path === location.pathname) ??
            false
          if (item.children) {
            const children = item.children.filter(
              child => isSuperAdmin || userAccess.includes(child.path)
            )
            return (
              <div className="nav-group" key={item.label}>
                <button
                  type="button"
                  className={`nav-item nav-group-trigger ${isExpanded ? 'is-expanded' : ''}`}
                  onClick={() =>
                    setExpanded(current => ({ ...current, [item.label]: !isExpanded }))
                  }
                  aria-expanded={isExpanded}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{item.label}</span>
                  <ChevronDown size={15} className="nav-chevron" />
                </button>
                <div
                  className={`nav-submenu ${isExpanded ? 'is-expanded' : ''}`}
                  aria-hidden={!isExpanded}
                >
                  <div className="nav-submenu-inner">
                    {children.map(child => {
                      const ChildIcon = child.icon
                      return (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          onClick={onClose}
                          tabIndex={isExpanded ? 0 : -1}
                          title={isCollapsed ? child.label : undefined}
                          className={({ isActive }) => `nav-subitem ${isActive ? 'active' : ''}`}
                        >
                          <ChildIcon size={16} />
                          <span>{child.label}</span>
                        </NavLink>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          }
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={onClose}
              className="nav-item"
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
