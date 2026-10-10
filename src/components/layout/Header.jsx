import {
  ChevronDown,
  LogOut,
  Mail,
  Menu,
  Settings,
  ShieldCheck,
  UserCircle2,
  UsersRound,
  Undo2,
  LoaderCircle,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth.js'

export default function Header({ onToggleSidebar, isSidebarOpen, isSidebarCollapsed }) {
  const { user, currentUser, logout, isSuperAdmin, isImpersonating, stopImpersonating } = useAuth()
  const navigate = useNavigate()
  const menuRef = useRef(null)
  const closeTimerRef = useRef(null)
  const [isMenuPinned, setIsMenuPinned] = useState(false)
  const [isMenuHovered, setIsMenuHovered] = useState(false)
  const [returning, setReturning] = useState(false)
  const [returnError, setReturnError] = useState('')
  const isMenuOpen = isMenuPinned || isMenuHovered

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

  const displayName = currentUser?.name || formatDisplayName(user)
  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase() || 'AD'

  const email = currentUser?.email || (user ? user.toLowerCase() : '')

  useEffect(() => {
    const handleClickOutside = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuPinned(false)
        setIsMenuHovered(false)
      }
    }
    const handleEscape = event => {
      if (event.key === 'Escape') {
        setIsMenuPinned(false)
        setIsMenuHovered(false)
      }
    }

    document.addEventListener('pointerdown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
      window.clearTimeout(closeTimerRef.current)
    }
  }, [])

  const handleLogout = async () => {
    await logout()
    setIsMenuPinned(false)
    setIsMenuHovered(false)
    navigate('/login', { replace: true })
  }

  const openOnHover = () => {
    window.clearTimeout(closeTimerRef.current)
    setIsMenuHovered(true)
  }
  const closeAfterHover = () => {
    window.clearTimeout(closeTimerRef.current)
    closeTimerRef.current = window.setTimeout(() => setIsMenuHovered(false), 180)
  }
  const closeMenu = () => {
    setIsMenuPinned(false)
    setIsMenuHovered(false)
  }
  const returnToDashboard = async () => {
    if (returning) return
    setReturning(true)
    setReturnError('')
    try {
      const restored = await stopImpersonating()
      if (!restored) {
        setReturnError('Could not restore the Super Admin session. Please try again.')
        return
      }
      closeMenu()
      window.setTimeout(() => navigate('/', { replace: true }), 0)
    } catch {
      setReturnError('Could not restore the Super Admin session. Please try again.')
    } finally {
      setReturning(false)
    }
  }
  const avatar = currentUser?.photo ? <img src={currentUser.photo} alt="" /> : initials

  return (
    <>
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
          <span className="topbar-title font-semibold">Content Management</span>
        </div>

        <div
          ref={menuRef}
          className={`profile-menu ${isMenuOpen ? 'is-open' : ''}`}
          onMouseEnter={openOnHover}
          onMouseLeave={closeAfterHover}
        >
          <button
            type="button"
            className="profile-trigger"
            aria-label="Open profile menu"
            aria-expanded={isMenuOpen}
            aria-controls="profile-dropdown"
            onClick={() => {
              if (isMenuPinned) closeMenu()
              else setIsMenuPinned(true)
            }}
          >
            <span className="profile-avatar desktop-avatar">{avatar}</span>
            <span className="profile-avatar mobile-avatar">{avatar}</span>
            <span className="profile-name">{displayName}</span>
            <ChevronDown size={16} className="profile-caret desktop-caret" />
          </button>

          <div id="profile-dropdown" className="profile-dropdown">
            <div className="profile-summary">
              <span className="profile-avatar large">{avatar}</span>
              <div>
                <strong>{displayName}</strong>
                <small>{currentUser?.role || 'Administrator'}</small>
              </div>
            </div>

            <div className="profile-contact">
              <Mail size={15} />
              <span>{email}</span>
            </div>

            <div className="profile-links">
              {isSuperAdmin ? (
                <>
                  <NavLink to="/profile" className="profile-item" onClick={closeMenu}>
                    <UserCircle2 size={18} />
                    <span>My profile</span>
                  </NavLink>
                  <NavLink to="/users" className="profile-item" onClick={closeMenu}>
                    <UsersRound size={18} />
                    <span>Users</span>
                  </NavLink>
                  <NavLink to="/permissions" className="profile-item" onClick={closeMenu}>
                    <ShieldCheck size={18} />
                    <span>Permissions</span>
                  </NavLink>
                </>
              ) : !isImpersonating ? (
                <NavLink to="/profile" className="profile-item" onClick={closeMenu}>
                  <UserCircle2 size={18} />
                  <span>My profile</span>
                </NavLink>
              ) : null}
              {isImpersonating && (
                <button
                  type="button"
                  className="profile-item text-amber-700"
                  onClick={returnToDashboard}
                  disabled={returning}
                >
                  <Undo2 size={18} />
                  <span>{returning ? 'Returning…' : 'Back to Super Admin'}</span>
                </button>
              )}
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
      {isImpersonating && (
        <div className="impersonation-banner" aria-busy={returning}>
          <div className="impersonation-identity">
            <span className="impersonation-icon" aria-hidden="true">
              <ShieldCheck size={20} />
            </span>
            <div className="impersonation-copy">
              <span className="impersonation-label">User session</span>
              <p>
                Viewing as <strong>{displayName}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            className="impersonation-return"
            onClick={returnToDashboard}
            disabled={returning}
            title="Restore your Super Admin session and open the dashboard"
          >
            {returning ? (
              <LoaderCircle className="impersonation-spinner" size={17} aria-hidden="true" />
            ) : (
              <Undo2 size={17} aria-hidden="true" />
            )}
            <span>{returning ? 'Returning…' : 'Back to Super Admin'}</span>
          </button>
          {returnError && (
            <p className="impersonation-error" role="alert">
              {returnError}
            </p>
          )}
        </div>
      )}
    </>
  )
}
