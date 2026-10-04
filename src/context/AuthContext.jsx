import { createContext, useContext, useEffect, useState } from 'react'
import { accessPanels } from '../config/menu.js'

const AuthContext = createContext(null)
const USERS_KEY = 'skg-admin-users'
const SUPER_ADMIN_EMAIL = 'admin@skg.com'

function readUsers() {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
    return Array.isArray(users) ? users.map(item => ({ ...item, createdAt: item.createdAt || new Date().toISOString(), blocked: Boolean(item.blocked) })) : []
  } catch {
    return []
  }
}

function defaultPanels() {
  return accessPanels.map(panel => panel.id)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return sessionStorage.getItem('skg-admin-user') } catch { return null }
  })
  const [users, setUsers] = useState(readUsers)

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }, [users])

  const currentUser = users.find(item => item.email === user?.toLowerCase())
  const isSuperAdmin = !user || user.toLowerCase() === SUPER_ADMIN_EMAIL || currentUser?.role === 'Super Admin'
  const userAccess = currentUser?.panels || defaultPanels()

  const login = name => {
    const value = name.trim().toLowerCase()
    sessionStorage.setItem('skg-admin-user', value)
    if (value === SUPER_ADMIN_EMAIL && !users.some(item => item.email === value)) {
      setUsers(existing => [...existing, { id: crypto.randomUUID(), name: 'Super Admin', email: value, role: 'Super Admin', panels: defaultPanels() }])
    }
    if (!users.some(item => item.email === value) && value !== SUPER_ADMIN_EMAIL) {
      setUsers(existing => [...existing, { id: crypto.randomUUID(), name: name.trim(), email: value, role: 'Admin', panels: defaultPanels() }])
    }
    setUser(value)
  }
  const logout = () => {
    sessionStorage.removeItem('skg-admin-user')
    setUser(null)
  }
  const saveUserAccess = (id, panels) => setUsers(existing => existing.map(item => item.id === id ? { ...item, panels } : item))
  const createUser = data => {
    const email = data.email.trim().toLowerCase()
    if (users.some(item => item.email === email)) return
    setUsers(existing => [...existing, { id: crypto.randomUUID(), ...data, email, role: data.role || 'Admin', panels: defaultPanels(), createdAt: new Date().toISOString(), blocked: false }])
  }
  const updateUser = (id, data) => setUsers(existing => existing.map(item => item.id === id ? { ...item, ...data, blocked: data.blocked ?? item.blocked } : item))
  const deleteUser = id => setUsers(existing => existing.filter(item => item.id !== id))

  return <AuthContext.Provider value={{ user, login, logout, users, isSuperAdmin, userAccess, saveUserAccess, createUser, updateUser, deleteUser }}>{children}</AuthContext.Provider>
}
export const useAuthContext = () => useContext(AuthContext)
