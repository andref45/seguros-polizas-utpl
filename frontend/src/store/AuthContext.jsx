import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'

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
    // Verificar sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return { success: true, data, error: null }
    } catch (error) {
      return { success: false, data: null, error }
    }
  }

  const register = async (email, password, userData) => {
    try {
      // 1. Crear usuario en auth.users
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('No se pudo crear el usuario')
      }

      // 2. Crear perfil en tabla usuarios
      const { error: profileError } = await supabase
        .from('usuarios')
        .insert([{
          id: authData.user.id,
          ...userData
        }])

      if (profileError) throw profileError

      return { success: true, data: authData, error: null }
    } catch (error) {
      return { success: false, data: null, error }
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error }
    }
  }

  const updateProfile = async (updates) => {
    try {
      if (!user) {
        throw new Error('No hay usuario autenticado')
      }

      const { error } = await supabase
        .from('usuarios')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      return { success: true, error: null }
    } catch (error) {
      return { success: false, error }
    }
  }

  const getProfile = async () => {
    try {
      if (!user) {
        throw new Error('No hay usuario autenticado')
      }

      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      return { success: true, data, error: null }
    } catch (error) {
      return { success: false, data: null, error }
    }
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
