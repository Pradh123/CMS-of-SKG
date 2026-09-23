import { NavLink } from 'react-router-dom'
import { menu } from '../../config/menu.js'

export default function Sidebar({ isOpen = true, isCollapsed = false, onClose }) {
  return (
    <aside className={`sidebar ${isOpen ? 'is-open' : ''} ${isCollapsed ? 'is-collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="flex items-center gap-3 px-3">
          <span className="sidebar-logo-mark">
            <img src="/logo/skg-logo.png" alt="SKG" className="sidebar-logo" />
          </span>
          <strong>SKG Admin</strong>
        </div>

        <button
          type="button"
          className="sidebar-close"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          ×
        </button>
      </div>

      <nav>
        {menu.map(item => {
          const Icon = item.icon

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
