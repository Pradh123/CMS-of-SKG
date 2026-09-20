import { NavLink } from 'react-router-dom'
import { menu } from '../../config/menu.js'

export default function Sidebar({ isOpen = true, onClose }) {
  return (
    <aside className={`sidebar ${isOpen ? 'is-open' : ''}`}>
      <div className="sidebar-header">
        <div className="flex items-center gap-3 px-3">
          <img
            src="/logo/skg-logo.png"
            alt="SKG"
            className="w-12 h-12 object-contain bg-white rounded-lg"
          />
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
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
