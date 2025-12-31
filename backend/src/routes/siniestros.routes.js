import express from 'express'
import SiniestroController from '../controllers/SiniestroController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(authMiddleware)

// Placeholder routes para Sprint 2
router.get('/mis-siniestros', SiniestroController.getMisSiniestros)
router.get('/:id', SiniestroController.getSiniestroById)
router.post('/registrar', SiniestroController.registrarSiniestro)
router.put('/:id/estado', SiniestroController.actualizarEstado)

export default router
