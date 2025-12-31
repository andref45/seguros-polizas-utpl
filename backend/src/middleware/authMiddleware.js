import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Token no proporcionado'
      })
    }

    // Extraer token del header "Bearer TOKEN"
    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido'
      })
    }

    // Validar token con Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido o expirado'
      })
    }

    // Adjuntar usuario al request
    req.user = user
    next()
  } catch (error) {
    console.error('Error en authMiddleware:', error)
    return res.status(500).json({
      success: false,
      error: 'Error de autenticación'
    })
  }
}

export default authMiddleware
