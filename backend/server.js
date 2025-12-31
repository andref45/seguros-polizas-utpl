import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Middleware
import errorHandler from './src/middleware/errorHandler.js'

// Routes
import polizasRoutes from './src/routes/polizas.routes.js'
import pagosRoutes from './src/routes/pagos.routes.js'
import siniestrosRoutes from './src/routes/siniestros.routes.js'

// Cargar variables de entorno
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Sistema de Gestión de Pólizas - API funcionando correctamente',
    timestamp: new Date().toISOString()
  })
})

// API Routes
app.use('/api/polizas', polizasRoutes)
app.use('/api/pagos', pagosRoutes)
app.use('/api/siniestros', siniestrosRoutes)

// Ruta 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada'
  })
})

// Error handler (debe ir al final)
app.use(errorHandler)

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
  console.log(`📡 Health check: http://localhost:${PORT}/health`)
  console.log(`🌍 CORS habilitado para: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`)
  console.log(`🔐 Usando Supabase Auth`)
})

export default app
