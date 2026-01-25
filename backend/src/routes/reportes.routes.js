import { Router } from 'express'
import ReportesController from '../controllers/ReportesController.js'
import { verifyToken, requireRole } from '../middleware/auth.middleware.js'

const router = Router()

// All routes require Admin role
router.use(verifyToken)
router.use(requireRole('admin'))

router.get('/general', ReportesController.getResumenGeneral)
router.get('/nomina', ReportesController.getReporteNomina)
router.get('/siniestralidad', ReportesController.getSiniestralidad) // [NEW] KPI Siniestralidad

export default router
