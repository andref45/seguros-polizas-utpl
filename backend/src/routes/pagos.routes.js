import express from 'express'
import PagoController from '../controllers/PagoController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(authMiddleware)

// Obtener mis pagos
router.get('/mis-pagos', PagoController.getMisPagos)

// Obtener pagos pendientes
router.get('/pendientes', PagoController.getPagosPendientes)

// Obtener TODOS los pagos (Dashboard Financiero)
router.get('/todos', PagoController.getAllPagos)


// Obtener pagos de una póliza específica
router.get('/poliza/:polizaId', PagoController.getPagosByPoliza)

// Registrar nuevo pago
router.post('/registrar', PagoController.registrarPago)

// Calcular coaseguro
router.post('/calcular-coaseguro', PagoController.calcularCoaseguro)

// Reporte Nómina (RN004) - Solo Rol Financiero (o Admin)
router.get('/reporte-nomina', PagoController.generarReporteNomina)

// Generar pagos pendientes para una póliza
router.post('/poliza/:polizaId/generar-pendientes', PagoController.generarPagosPendientes)

export default router
