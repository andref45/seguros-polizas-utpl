import { Router } from 'express'
import AuthController from '../controllers/AuthController.js'
import { authLimiter } from '../middleware/rateLimiter.js'
import { verifyToken, requireRole } from '../middleware/auth.middleware.js'

const router = Router()

router.post('/login', authLimiter, AuthController.login)
router.post('/register', authLimiter, AuthController.register) // Re-enabled for client onboarding, but role forced to USER in controller
router.post('/logout', AuthController.logout)
router.get('/me', verifyToken, AuthController.getMe)
router.get('/users', verifyToken, requireRole('admin'), AuthController.getAllUsers) // [NEW] For Admin dropdown
router.put('/profile', verifyToken, AuthController.updateProfile)

export default router
