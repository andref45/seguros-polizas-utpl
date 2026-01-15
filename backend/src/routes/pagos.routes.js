import { Router } from 'express'
import PagoController from '../controllers/PagoController.js'
import ReportesController from '../controllers/ReportesController.js' // [NEW]
import { verifyToken, requireRole } from '../middleware/auth.middleware.js'
import { ROLES } from '../constants/roles.js'

const router = Router()

router.post('/registrar', verifyToken, requireRole(ROLES.ADMIN), PagoController.registrarPago)
router.get('/todos', verifyToken, requireRole(ROLES.ADMIN), PagoController.getAllPagos)
router.get('/pendientes', verifyToken, PagoController.getPagosPendientes)
router.get('/mis-pagos', verifyToken, PagoController.getMisPagos)
router.get('/reporte-nomina', verifyToken, ReportesController.getReporteNomina) // [NEW] RN008 & RN009

// router.post('/calc-coaseguro') // REMOVED

export default router
