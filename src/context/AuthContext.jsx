import { createContext, useContext, useEffect, useState } from 'react'
import { accessPanels } from '../config/menu.js'

const AuthContext = createContext(null)
const USERS_KEY = 'skg-admin-users'
const SESSION_KEY = 'skg-admin-user'
const SIGNED_OUT_KEY = 'skg-admin-signed-out'
export const SUPER_ADMIN_EMAIL = 'skgtravels9@gmail.com'

const superAdminAccount = () => ({
  id: 'skg-super-admin',
  firstName: 'Super',
  lastName: 'Admin',
  name: 'Super Admin',
  email: SUPER_ADMIN_EMAIL,
  role: 'Super Admin',
  panels: defaultPanels(),
  createdAt: new Date().toISOString(),
  blocked: false,
})

function readUsers() {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
    const records = Array.isArray(users)
      ? users.map(item => ({
          ...item,
          createdAt: item.createdAt || new Date().toISOString(),
          blocked: Boolean(item.blocked),
        }))
      : []
    return records.some(item => item.email?.toLowerCase() === SUPER_ADMIN_EMAIL)
      ? records
      : [superAdminAccount(), ...records]
  } catch {
    return [superAdminAccount()]
  }
}

function defaultPanels() {
  return accessPanels.map(panel => panel.id)
}

function readInitialUser() {
  try {
    const savedUser = sessionStorage.getItem(SESSION_KEY)
    if (savedUser) {
      if (savedUser.toLowerCase() === 'admin@skg.com') {
        sessionStorage.setItem(SESSION_KEY, SUPER_ADMIN_EMAIL)
        return SUPER_ADMIN_EMAIL
      }
      return savedUser
    }
    if (sessionStorage.getItem(SIGNED_OUT_KEY) === 'true') return null
    sessionStorage.setItem(SESSION_KEY, SUPER_ADMIN_EMAIL)
    return SUPER_ADMIN_EMAIL
  } catch {
    return SUPER_ADMIN_EMAIL
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readInitialUser)
  const [users, setUsers] = useState(readUsers)

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }, [users])

  const currentUser = users.find(item => item.email === user?.toLowerCase())
  const isSuperAdmin =
    user?.toLowerCase() === SUPER_ADMIN_EMAIL || currentUser?.role === 'Super Admin'
  const userAccess = currentUser?.panels || defaultPanels()

  const login = name => {
    const value = name.trim().toLowerCase()
    sessionStorage.setItem(SESSION_KEY, value)
    sessionStorage.removeItem(SIGNED_OUT_KEY)
    if (value === SUPER_ADMIN_EMAIL && !users.some(item => item.email === value)) {
      setUsers(existing => [
        ...existing,
        {
          id: crypto.randomUUID(),
          name: 'Super Admin',
          email: value,
          role: 'Super Admin',
          panels: defaultPanels(),
        },
      ])
    }
    if (!users.some(item => item.email === value) && value !== SUPER_ADMIN_EMAIL) {
      setUsers(existing => [
        ...existing,
        {
          id: crypto.randomUUID(),
          name: name.trim(),
          email: value,
          role: 'Admin',
          panels: defaultPanels(),
        },
      ])
    }
    setUser(value)
  }
  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.setItem(SIGNED_OUT_KEY, 'true')
    setUser(null)
  }
  const saveUserAccess = (id, panels) =>
    setUsers(existing => existing.map(item => (item.id === id ? { ...item, panels } : item)))
  const createUser = data => {
    const email = data.email.trim().toLowerCase()
    if (users.some(item => item.email === email)) return
    setUsers(existing => [
      ...existing,
      {
        id: crypto.randomUUID(),
        ...data,
        email,
        role: data.role || 'Admin',
        panels: defaultPanels(),
        createdAt: new Date().toISOString(),
        blocked: false,
      },
    ])
  }
  const updateUser = (id, data) =>
    setUsers(existing =>
      existing.map(item =>
        item.id === id ? { ...item, ...data, blocked: data.blocked ?? item.blocked } : item
      )
    )
  const deleteUser = id => setUsers(existing => existing.filter(item => item.id !== id))

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser,
        login,
        logout,
        users,
        isSuperAdmin,
        userAccess,
        saveUserAccess,
        createUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
export const useAuthContext = () => useContext(AuthContext)
