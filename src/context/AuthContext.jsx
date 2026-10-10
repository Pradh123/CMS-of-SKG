import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { accessPanels } from '../config/menu.js'
import { normalizePermissions, visiblePanels } from '../config/accessControl.js'
import {
  asRecordList,
  authApi,
  extractSessionToken,
  getAccessToken,
  profileApi,
  setAccessToken,
  usersApi,
} from '../services/apiClient.js'
import { clearCollectionCache } from '../hooks/useCollectionRecords.js'

const AuthContext = createContext(null)

// Compatibility export for older imports. Super Admin status now comes only from the API session.
export const SUPER_ADMIN_EMAIL = ''

function defaultPanels() {
  return accessPanels.map(panel => panel.id)
}

function normalizeUser(value) {
  if (!value || typeof value !== 'object') return null
  const firstName = value.firstName || ''
  const lastName = value.lastName || ''
  const name = value.name || `${firstName} ${lastName}`.trim() || value.email || 'Admin User'
  const user = {
    ...value,
    id: value.id || value._id,
    name,
    blocked: Boolean(value.blocked),
  }
  return { ...user, permissions: normalizePermissions(user) }
}

function sessionUser(payload) {
  if (!payload || typeof payload !== 'object') return null
  return normalizeUser(payload.user || payload.currentUser || payload.account || payload)
}

function sessionActor(payload) {
  if (!payload || typeof payload !== 'object') return null
  return normalizeUser(payload.actor || payload.authenticatedUser || payload.originalUser)
}

function sessionToken(payload) {
  return extractSessionToken(payload)
}

function isSuperAdminAccount(account) {
  return String(account?.role || '').toLowerCase() === 'super admin'
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [actor, setActor] = useState(null)
  const [users, setUsers] = useState([])
  const [isImpersonating, setIsImpersonating] = useState(false)
  const [serverSaysSuperAdmin, setServerSaysSuperAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  const replaceUser = useCallback(nextUser => {
    if (!nextUser?.id) return
    setUsers(existing => {
      const found = existing.some(item => String(item.id) === String(nextUser.id))
      return found
        ? existing.map(item => (String(item.id) === String(nextUser.id) ? nextUser : item))
        : [nextUser, ...existing]
    })
  }, [])

  const applySession = useCallback(
    (payload, fallbackActor = null) => {
      const nextUser = sessionUser(payload)
      if (!nextUser) return null

      const nextActor = sessionActor(payload) || fallbackActor
      const nextImpersonating = Boolean(
        payload?.isImpersonating ?? payload?.impersonating ?? nextActor
      )
      const explicitSuperAdmin = Boolean(
        payload?.isActualSuperAdmin ?? payload?.actualSuperAdmin ?? isSuperAdminAccount(nextActor)
      )

      setCurrentUser(nextUser)
      setActor(nextActor)
      setIsImpersonating(nextImpersonating)
      setServerSaysSuperAdmin(explicitSuperAdmin)
      replaceUser(nextUser)
      return nextUser
    },
    [replaceUser]
  )

  const refreshUsers = useCallback(async () => {
    try {
      const response = await usersApi.list()
      const records = asRecordList(response).map(normalizeUser).filter(Boolean)
      setUsers(records)
      return records
    } catch (error) {
      setAuthError(error)
      return []
    }
  }, [])

  const clearSession = useCallback(() => {
    setAccessToken('')
    clearCollectionCache()
    setCurrentUser(null)
    setActor(null)
    setUsers([])
    setIsImpersonating(false)
    setServerSaysSuperAdmin(false)
  }, [])

  useEffect(() => {
    let active = true

    const unauthorized = () => {
      if (!active) return
      clearSession()
      setIsLoading(false)
    }
    window.addEventListener('skg-admin:unauthorized', unauthorized)

    const bootstrap = async () => {
      if (!getAccessToken()) {
        if (active) setIsLoading(false)
        return
      }

      try {
        const response = await authApi.me()
        if (!active) return
        const account = applySession(response)
        const responseActor = sessionActor(response)
        const actualSuperAdmin = Boolean(
          response?.isActualSuperAdmin ||
          response?.actualSuperAdmin ||
          isSuperAdminAccount(responseActor) ||
          (!response?.isImpersonating && isSuperAdminAccount(account))
        )
        if (actualSuperAdmin && !response?.isImpersonating) await refreshUsers()
      } catch (error) {
        if (active) {
          clearSession()
          setAuthError(error)
        }
      } finally {
        if (active) setIsLoading(false)
      }
    }

    bootstrap()
    return () => {
      active = false
      window.removeEventListener('skg-admin:unauthorized', unauthorized)
    }
  }, [applySession, clearSession, refreshUsers])

  const login = useCallback(
    async (email, password) => {
      setAuthError(null)
      const response = await authApi.login(email.trim().toLowerCase(), password)
      const token = sessionToken(response)
      if (!token) throw new Error('Login response did not include an access token.')
      clearCollectionCache()
      setAccessToken(token)

      try {
        const hasUser = Boolean(response?.user || response?.currentUser || response?.account)
        const session = hasUser ? response : await authApi.me()
        const account = applySession(session)
        if (!account) throw new Error('Login response did not include an account.')
        if (isSuperAdminAccount(account) && !session?.isImpersonating) await refreshUsers()
        return account
      } catch (error) {
        clearSession()
        throw error
      }
    },
    [applySession, clearSession, refreshUsers]
  )

  const logout = useCallback(() => {
    const request = getAccessToken() ? authApi.logout().catch(() => null) : Promise.resolve()
    clearSession()
    return request
  }, [clearSession])

  const currentPermissions = useMemo(
    () => normalizePermissions(currentUser || {}),
    [currentUser]
  )
  const isActualSuperAdmin = Boolean(
    serverSaysSuperAdmin ||
    isSuperAdminAccount(actor) ||
    (!isImpersonating && isSuperAdminAccount(currentUser))
  )
  const isSuperAdmin = isActualSuperAdmin && !isImpersonating
  const userAccess = isSuperAdmin ? defaultPanels() : visiblePanels(currentPermissions)
  const user = currentUser?.email || currentUser?.id || null
  const hasPermission = (path, operation = 'view') =>
    Boolean(isSuperAdmin || currentPermissions[path]?.includes(operation))

  const createUser = useCallback(
    async data => {
      try {
        setAuthError(null)
        const response = await usersApi.create({
          ...data,
          email: data.email?.trim().toLowerCase(),
        })
        const created = sessionUser(response) || normalizeUser(response)
        if (created?.id) replaceUser(created)
        else await refreshUsers()
        return created
      } catch (error) {
        setAuthError(error)
        return null
      }
    },
    [refreshUsers, replaceUser]
  )

  const updateUser = useCallback(
    async (id, data) => {
      try {
        setAuthError(null)
        const isSelf = String(currentUser?.id) === String(id)
        const response = isSelf ? await profileApi.update(data) : await usersApi.update(id, data)
        const saved =
          sessionUser(response) ||
          normalizeUser({
            ...(users.find(item => String(item.id) === String(id)) || {}),
            ...data,
            id,
          })
        if (saved) {
          replaceUser(saved)
          if (String(currentUser?.id) === String(id)) setCurrentUser(saved)
          if (String(actor?.id) === String(id)) setActor(saved)
        }
        return saved
      } catch (error) {
        setAuthError(error)
        return null
      }
    },
    [actor?.id, currentUser?.id, replaceUser, users]
  )

  const deleteUser = useCallback(async id => {
    try {
      setAuthError(null)
      await usersApi.remove(id)
      setUsers(existing => existing.filter(item => String(item.id) !== String(id)))
      return true
    } catch (error) {
      setAuthError(error)
      return false
    }
  }, [])

  const saveUserPermissions = useCallback(
    async (id, permissions) => {
      try {
        setAuthError(null)
        const response = await usersApi.updatePermissions(id, permissions)
        const previous = users.find(item => String(item.id) === String(id)) || { id }
        const saved =
          sessionUser(response) ||
          normalizeUser({ ...previous, permissions, panels: visiblePanels(permissions) })
        if (saved) replaceUser(saved)
        return saved
      } catch (error) {
        setAuthError(error)
        return null
      }
    },
    [replaceUser, users]
  )

  const saveUserAccess = useCallback(
    (id, panels) =>
      saveUserPermissions(
        id,
        Object.fromEntries(
          accessPanels.map(panel => [
            panel.id,
            panels.includes(panel.id) ? ['view', 'create', 'edit', 'delete'] : [],
          ])
        )
      ),
    [saveUserPermissions]
  )

  // Resolve only after the backend has issued and installed the impersonated session.
  const impersonateUser = useCallback(
    async id => {
      const target = users.find(item => String(item.id) === String(id))
      if (!isActualSuperAdmin || !target || target.blocked || isSuperAdminAccount(target))
        return false
      const adminActor = actor || currentUser

      try {
        setAuthError(null)
        const response = await authApi.impersonate(id)
        const token = sessionToken(response)
        if (!token) throw new Error('Impersonation response did not include an access token.')
        clearCollectionCache()
        setAccessToken(token)
        applySession({ ...response, isImpersonating: true }, adminActor)
        return true
      } catch (error) {
        setAuthError(error)
        return false
      }
    },
    [actor, applySession, currentUser, isActualSuperAdmin, users]
  )

  const stopImpersonating = useCallback(async () => {
    if (!isImpersonating) return Promise.resolve(true)
    const restoredActor = actor

    try {
      setAuthError(null)
      const response = await authApi.stopImpersonating()
      const token = sessionToken(response)
      if (!token) throw new Error('Restored session did not include an access token.')
      clearCollectionCache()
      setAccessToken(token)
      const account = applySession({ ...response, isImpersonating: false })
      if (isSuperAdminAccount(account || restoredActor)) await refreshUsers()
      return true
    } catch (error) {
      setAuthError(error)
      return false
    }
  }, [actor, applySession, isImpersonating, refreshUsers])

  const forgotPassword = useCallback(
    email => authApi.forgotPassword(email.trim().toLowerCase()),
    []
  )
  const resetPassword = useCallback(data => authApi.resetPassword(data), [])
  const changePassword = useCallback(data => authApi.changePassword(data), [])

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser,
        login,
        logout,
        users,
        isLoading,
        isBootstrapping: isLoading,
        authError,
        isSuperAdmin,
        isActualSuperAdmin,
        isImpersonating,
        userAccess,
        currentPermissions,
        hasPermission,
        refreshUsers,
        saveUserAccess,
        saveUserPermissions,
        createUser,
        updateUser,
        deleteUser,
        impersonateUser,
        stopImpersonating,
        forgotPassword,
        resetPassword,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)
