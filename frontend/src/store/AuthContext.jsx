import { createContext, useContext, useState, useEffect } from 'react'
import AuthService from '../services/auth.service'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const user = await AuthService.login(email, password)
      setUser(user)
      return { success: true, data: user, error: null }
    } catch (error) {
      return { success: false, data: null, error: error.message }
    }
  }

  const register = async (email, password, userData) => {
    try {
      const data = await AuthService.register(email, password, userData)
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message || error }
    }
  }

  const logout = () => {
    AuthService.logout()
    setUser(null)
    return { success: true }
  }

  const updateProfile = async (updates) => {
    return { success: false, error: 'Not implemented via API yet' }
  }

  const getProfile = async () => {
    return { success: true, data: user }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    getProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
