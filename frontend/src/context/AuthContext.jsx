import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      authAPI.me()
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('token')
          localStorage.removeItem('role')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password })
    localStorage.setItem('token', res.data.access_token)
    localStorage.setItem('role', res.data.role)
    setUser({ 
      id: res.data.user_id, 
      full_name: res.data.full_name, 
      role: res.data.role, 
      email 
    })
    return res.data
  }

  const register = async (userData) => {
    const res = await authAPI.register(userData)
    localStorage.setItem('token', res.data.access_token)
    localStorage.setItem('role', res.data.role)
    setUser({ 
      id: res.data.user_id, 
      full_name: res.data.full_name, 
      role: res.data.role, 
      email: userData.email 
    })
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)