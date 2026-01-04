import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import polizaRoutes from './src/routes/polizas.routes.js'
import pagoRoutes from './src/routes/pagos.routes.js'
import siniestroRoutes from './src/routes/siniestros.routes.js'
import authRoutes from './src/routes/auth.routes.js'
import vigenciaRoutes from './src/routes/vigencias.routes.js'
import supabase from './src/config/supabase.config.js'
import logger from './src/config/logger.js'
import limiter from './src/middleware/rateLimiter.js'
import { verifyToken } from './src/middleware/auth.middleware.js'
import errorHandler from './src/middleware/errorHandler.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

// Security & Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(limiter)
app.use(express.json())
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }))

// Health Check
app.get('/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'OK',
    checks: {
      db: 'UNKNOWN',
      storage: 'UNKNOWN'
    }
  }

  try {
    const { error: dbError } = await supabase.from('tipos_poliza').select('id').limit(1)
    health.checks.db = dbError ? 'ERROR' : 'OK'
  } catch (e) { health.checks.db = 'ERROR' }

  try {
    const { error: storageError } = await supabase.storage.listBuckets()
    health.checks.storage = storageError ? 'ERROR' : 'OK'
  } catch (e) { health.checks.storage = 'ERROR' }

  if (health.checks.db !== 'OK' || health.checks.storage !== 'OK') {
    health.status = 'DEGRADED'
    res.status(503)
  }

  res.json(health)
})


// Public Routes
app.use('/api/auth', authRoutes)
app.use('/api/vigencias', vigenciaRoutes) // Public or Protected? User didn't specify, but safer to be public-read for active status check? Or protected? Let's verify requirements. 
// "GET /vigencias/activa" needed for guard clause, which runs on POST /aviso (Authenticated). So likely protected or public. 
// Given it blocks creation, public info is fine. But sticking to general protection if feasible.
// For now, let's make it public so frontend can check before showing form.

// Protected Routes
app.use('/api/polizas', verifyToken, polizaRoutes)
app.use('/api/pagos', verifyToken, pagoRoutes)
app.use('/api/siniestros', verifyToken, siniestroRoutes)

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
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    logger.info(`🚀 Servidor corriendo en puerto ${port}`)
    logger.info(`📡 Health check: http://localhost:${port}/health`)
    logger.info(`🌍 CORS habilitado para: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`)
    logger.info(`🔐 Usando Supabase Auth con JWT Verification`)
  })
}

export default app
