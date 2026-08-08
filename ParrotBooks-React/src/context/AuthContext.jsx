import { createContext, useContext, useState } from 'react'
import { login as apiLogin } from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('pb_user')
    return stored ? JSON.parse(stored) : null
  })

  async function login(username, password) {
    const data = await apiLogin(username, password)
    localStorage.setItem('pb_token', data.token)
    localStorage.setItem('pb_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  function logout() {
    localStorage.removeItem('pb_token')
    localStorage.removeItem('pb_user')
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
