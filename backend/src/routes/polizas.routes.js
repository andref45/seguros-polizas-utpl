import express from 'express'
import PolizaController from '../controllers/PolizaController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(authMiddleware)

// Obtener tipos de pólizas disponibles
router.get('/tipos', PolizaController.getTiposPoliza)

// Obtener mis pólizas
router.get('/mis-polizas', PolizaController.getMisPolizas)

// Obtener póliza por ID
router.get('/:id', PolizaController.getPolizaById)

// Contratar nueva póliza
router.post('/contratar', PolizaController.contratarPoliza)

// Cancelar póliza
router.put('/:id/cancelar', PolizaController.cancelarPoliza)

// Verificar vigencia de póliza
router.get('/:id/vigencia', PolizaController.verificarVigencia)

// Obtener beneficiarios de una póliza
router.get('/:id/beneficiarios', PolizaController.getBeneficiarios)

export default router
