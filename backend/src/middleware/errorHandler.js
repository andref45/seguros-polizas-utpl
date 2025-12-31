const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)

  // Error de Supabase
  if (err.code) {
    return res.status(400).json({
      success: false,
      error: err.message || 'Error en la base de datos',
      code: err.code
    })
  }

  // Error de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: err.message,
      details: err.details || []
    })
  }

  // Error de negocio personalizado
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    })
  }

  // Error genérico
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development'
      ? err.message
      : 'Error interno del servidor'
  })
}

export default errorHandler
