import express from 'express'
import PolizaController from '../controllers/PolizaController.js'
import { verifyToken, requireRole } from '../middleware/auth.middleware.js'
import { ROLES } from '../constants/roles.js'

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(verifyToken)

// Obtener tipos de pólizas disponibles
router.get('/tipos', PolizaController.getTiposPoliza)

// Obtener TODAS las pólizas (Admin)
router.get('/', requireRole(ROLES.ADMIN), PolizaController.getAllPolizas)

// Obtener mis pólizas - USER allowed
router.get('/mis-polizas', PolizaController.getMisPolizas)

// Buscar pólizas por cédula - USER allowed (for claims)
router.get('/buscar', PolizaController.buscarPorCedula)

// Obtener póliza por ID
router.get('/:id', PolizaController.getPolizaById)

// Contratar nueva póliza - ADMIN ONLY
router.post('/contratar', requireRole(ROLES.ADMIN), PolizaController.contratarPoliza)

// Cancelar póliza - ADMIN ONLY
router.put('/:id/cancelar', requireRole(ROLES.ADMIN), PolizaController.cancelarPoliza)

// Editar Póliza (General) - ADMIN ONLY
router.put('/:id', requireRole(ROLES.ADMIN), PolizaController.updatePoliza)

// Eliminar póliza - ADMIN ONLY
router.delete('/:id', requireRole(ROLES.ADMIN), PolizaController.deletePoliza)

// Verificar vigencia de póliza
router.get('/:id/vigencia', PolizaController.verificarVigencia)

// Obtener beneficiarios de una póliza
router.get('/:id/beneficiarios', PolizaController.getBeneficiarios)

export default router
