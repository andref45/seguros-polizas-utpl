import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')

      if (storedToken && storedUser) {
        setUser(JSON.parse(storedUser))

        // Optional: Verify token validity with backend
        // try {
        //   const res = await api.get('/auth/me')
        //   setUser(res.data.data)
        // } catch (e) {
        //   logout()
        // }
      }
    } catch (error) {
      console.error('Error restoring session:', error)
      localStorage.clear()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      // STRICT 3-TIER: Call Backend API, not Supabase Direct
      const response = await api.post('/auth/login', { email, password })

      const { user, token, refreshToken } = response.data.data

      if (!user || !token) throw new Error('Respuesta de login inválida')

      localStorage.setItem('token', token)
      localStorage.setItem('refreshToken', refreshToken) // If supported
      localStorage.setItem('user', JSON.stringify(user))

      setUser(user)

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      const msg = error.response?.data?.error || error.message
      return { success: false, error: msg }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
    return { success: true }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
