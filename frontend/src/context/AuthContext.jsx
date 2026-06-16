import { createContext, useContext, useState, useEffect } from 'react'
import { loginUser, registerUser, getMe } from '../api/endpoints'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setLoading(false)
      return
    }
    getMe()
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const res = await loginUser({ email, password })
    localStorage.setItem('access_token', res.data.access_token)
    setUser(res.data.user)
    return res.data.user
  }

  const register = async (payload) => {
    const res = await registerUser(payload)
    localStorage.setItem('access_token', res.data.access_token)
    setUser(res.data.user)
    return res.data.user
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
