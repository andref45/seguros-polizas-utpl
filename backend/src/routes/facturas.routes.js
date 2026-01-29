import { Router } from 'express'
import FacturasController from '../controllers/FacturasController.js'
import { verifyToken, requireRole } from '../middleware/auth.middleware.js'
import { ROLES } from '../constants/roles.js'

const router = Router()

// Admin only routes
router.post('/', verifyToken, requireRole(ROLES.ADMIN), FacturasController.createFactura)
router.get('/', verifyToken, requireRole(ROLES.ADMIN), FacturasController.getFacturas)

export default router
