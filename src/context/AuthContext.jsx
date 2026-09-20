import { createContext, useContext, useState } from 'react'
const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => sessionStorage.getItem('skg-admin-user'))
  const login = (name) => { const value = name.trim(); sessionStorage.setItem('skg-admin-user', value); setUser(value) }
  const logout = () => { sessionStorage.removeItem('skg-admin-user'); setUser(null) }
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}
export const useAuthContext = () => useContext(AuthContext)
