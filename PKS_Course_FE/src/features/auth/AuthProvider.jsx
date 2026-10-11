import { useEffect, useState } from 'react'
import { apiRequest } from '../../lib/api'
import { AuthContext } from './authContext'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest('/auth/me').then(setUser).catch(() => setUser(null)).finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const result = await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    setUser(result.user)
  }

  async function register(fullName, email, password) {
    const result = await apiRequest('/auth/register', { method: 'POST', body: JSON.stringify({ fullName, email, password }) })
    setUser(result.user)
  }

  async function logout() {
    await apiRequest('/auth/logout', { method: 'POST' }).catch(() => {})
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}
