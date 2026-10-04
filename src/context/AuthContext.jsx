import { createContext, useContext, useEffect, useState } from 'react'
import { accessPanels } from '../config/menu.js'
import { normalizePermissions, permissionsForRole, visiblePanels } from '../config/accessControl.js'

const AuthContext = createContext(null)
const USERS_KEY = 'skg-admin-users'
const SESSION_KEY = 'skg-admin-user'
const SIGNED_OUT_KEY = 'skg-admin-signed-out'
const IMPERSONATED_USER_KEY = 'skg-admin-impersonated-user'
export const SUPER_ADMIN_EMAIL = 'skgtravels9@gmail.com'

const superAdminAccount = () => ({
  id: 'skg-super-admin',
  firstName: 'Super',
  lastName: 'Admin',
  name: 'Super Admin',
  email: SUPER_ADMIN_EMAIL,
  role: 'Super Admin',
  panels: defaultPanels(),
  permissions: permissionsForRole('Super Admin'),
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
          permissions: normalizePermissions(item),
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
  const [authenticatedUser, setAuthenticatedUser] = useState(readInitialUser)
  const [users, setUsers] = useState(readUsers)
  const [impersonatedUserId, setImpersonatedUserId] = useState(() => {
    try {
      return sessionStorage.getItem(IMPERSONATED_USER_KEY)
    } catch {
      return null
    }
  })

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }, [users])

  const authenticatedAccount = users.find(
    item => item.email?.toLowerCase() === authenticatedUser?.toLowerCase()
  )
  const isActualSuperAdmin =
    authenticatedUser?.toLowerCase() === SUPER_ADMIN_EMAIL ||
    authenticatedAccount?.role === 'Super Admin'
  const impersonatedUser = isActualSuperAdmin
    ? users.find(item => String(item.id) === String(impersonatedUserId) && !item.blocked)
    : null
  const currentUser = impersonatedUser || authenticatedAccount
  const user = currentUser?.email || authenticatedUser
  const isImpersonating = Boolean(impersonatedUser)
  const isSuperAdmin = isActualSuperAdmin && !isImpersonating
  const currentPermissions = normalizePermissions(currentUser)
  const userAccess = isSuperAdmin ? defaultPanels() : visiblePanels(currentPermissions)
  const hasPermission = (path, operation = 'view') =>
    Boolean(isSuperAdmin || currentPermissions[path]?.includes(operation))

  useEffect(() => {
    if (impersonatedUserId && !impersonatedUser) {
      sessionStorage.removeItem(IMPERSONATED_USER_KEY)
      setImpersonatedUserId(null)
    }
  }, [impersonatedUserId, impersonatedUser])

  const login = name => {
    const value = name.trim().toLowerCase()
    const account = users.find(item => item.email?.toLowerCase() === value)
    if (account?.blocked) return false
    sessionStorage.setItem(SESSION_KEY, value)
    sessionStorage.removeItem(SIGNED_OUT_KEY)
    sessionStorage.removeItem(IMPERSONATED_USER_KEY)
    setImpersonatedUserId(null)
    if (value === SUPER_ADMIN_EMAIL && !users.some(item => item.email === value)) {
      setUsers(existing => [
        ...existing,
        {
          id: crypto.randomUUID(),
          name: 'Super Admin',
          email: value,
          role: 'Super Admin',
          panels: defaultPanels(),
          permissions: permissionsForRole('Super Admin'),
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
          permissions: permissionsForRole('Admin'),
        },
      ])
    }
    setAuthenticatedUser(value)
    return true
  }
  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(IMPERSONATED_USER_KEY)
    sessionStorage.setItem(SIGNED_OUT_KEY, 'true')
    setAuthenticatedUser(null)
    setImpersonatedUserId(null)
  }
  const saveUserAccess = (id, panels) =>
    setUsers(existing =>
      existing.map(item =>
        item.id === id
          ? {
              ...item,
              panels,
              permissions: Object.fromEntries(
                accessPanels.map(panel => [
                  panel.id,
                  panels.includes(panel.id) ? ['view', 'create', 'edit', 'delete'] : [],
                ])
              ),
            }
          : item
      )
    )
  const saveUserPermissions = (id, permissions) =>
    setUsers(existing =>
      existing.map(item =>
        item.id === id ? { ...item, permissions, panels: visiblePanels(permissions) } : item
      )
    )
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
        permissions: permissionsForRole(data.role || 'Admin'),
        createdAt: new Date().toISOString(),
        blocked: false,
      },
    ])
  }
  const updateUser = (id, data) =>
    setUsers(existing =>
      existing.map(item =>
        item.id === id
          ? {
              ...item,
              ...data,
              blocked: data.blocked ?? item.blocked,
              permissions:
                data.permissions ||
                (data.role && data.role !== item.role
                  ? permissionsForRole(data.role)
                  : item.permissions),
            }
          : item
      )
    )
  const deleteUser = id =>
    setUsers(existing => existing.filter(item => item.id !== id || item.role === 'Super Admin'))
  const impersonateUser = id => {
    const target = users.find(item => String(item.id) === String(id))
    if (!isActualSuperAdmin || !target || target.blocked || target.role === 'Super Admin')
      return false
    sessionStorage.setItem(IMPERSONATED_USER_KEY, String(target.id))
    setImpersonatedUserId(String(target.id))
    return true
  }
  const stopImpersonating = () => {
    sessionStorage.removeItem(IMPERSONATED_USER_KEY)
    setImpersonatedUserId(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser,
        login,
        logout,
        users,
        isSuperAdmin,
        isActualSuperAdmin,
        isImpersonating,
        userAccess,
        currentPermissions,
        hasPermission,
        saveUserAccess,
        saveUserPermissions,
        createUser,
        updateUser,
        deleteUser,
        impersonateUser,
        stopImpersonating,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
export const useAuthContext = () => useContext(AuthContext)
