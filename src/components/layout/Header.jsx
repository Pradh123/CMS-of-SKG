import { ChevronDown, LogOut, Mail, Menu, Settings, ShieldCheck, UserCircle2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth.js'

export default function Header({ onToggleSidebar, isSidebarOpen, isSidebarCollapsed }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const menuRef = useRef(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const formatDisplayName = value => {
    if (!value) return 'Admin User'

    const trimmedValue = value.trim()
    const rawName = trimmedValue.includes('@') ? trimmedValue.split('@')[0] : trimmedValue
    const spacedName = rawName
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_\-.]+/g, ' ')
      .trim()

    return (
      spacedName
        .split(/\s+/)
        .filter(Boolean)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ') || 'Admin User'
    )
  }

  const displayName = formatDisplayName(user)
  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase() || 'AD'

  const email = user ? user.toLowerCase() : 'admin@skg.com'

  useEffect(() => {
    const handleClickOutside = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
    navigate('/login', { replace: true })
  }

  const handleMenuMouseEnter = () => {
    if (window.innerWidth > 800) {
      setIsMenuOpen(true)
    }
  }

  const handleMenuMouseLeave = () => {
    if (window.innerWidth > 800) {
      setIsMenuOpen(false)
    }
  }

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          aria-pressed={isSidebarOpen || isSidebarCollapsed}
        >
          <Menu size={20} />
        </button>
        <span className="font-semibold">Content Management</span>
      </div>

      <div
        ref={menuRef}
        className={`profile-menu ${isMenuOpen ? 'is-open' : ''}`}
        onMouseEnter={handleMenuMouseEnter}
        onMouseLeave={handleMenuMouseLeave}
        onFocus={handleMenuMouseEnter}
        onBlur={handleMenuMouseLeave}
      >
        <button
          type="button"
          className="profile-trigger"
          aria-label="Open profile menu"
          aria-expanded={isMenuOpen}
          onClick={() => {
            if (window.innerWidth <= 800) {
              setIsMenuOpen(current => !current)
            }
          }}
        >
          <span className="profile-avatar desktop-avatar">{initials}</span>
          <span className="profile-name">{displayName}</span>
          <ChevronDown size={16} className="profile-caret desktop-caret" />
        </button>

        <div className="profile-dropdown">
          <div className="profile-summary">
            <span className="profile-avatar large">{initials}</span>
            <div>
              <strong>{displayName}</strong>
              <small>Administrator</small>
            </div>
          </div>

          <div className="profile-contact">
            <Mail size={15} />
            <span>{email}</span>
          </div>

          <div className="profile-links">
            <NavLink to="/profile" className="profile-item" onClick={closeMenu}>
              <UserCircle2 size={18} />
              <span>Profile</span>
            </NavLink>
            <NavLink to="/settings" className="profile-item" onClick={closeMenu}>
              <Settings size={18} />
              <span>Settings</span>
            </NavLink>
            <NavLink to="/change-password" className="profile-item" onClick={closeMenu}>
              <ShieldCheck size={18} />
              <span>Change Password</span>
            </NavLink>
            <button type="button" onClick={handleLogout} className="profile-item profile-logout">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
