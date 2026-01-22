import { Router } from 'express'
import ReglasController from '../controllers/ReglasController.js'
import { verifyToken, requireRole } from '../middleware/auth.middleware.js'

const router = Router()

router.use(verifyToken)
router.use(requireRole('admin'))

router.get('/', ReglasController.getConfigs)
router.put('/vigencias/:id', ReglasController.updateVigencia)
router.put('/copagos/:id', ReglasController.updateCopago)

export default router
