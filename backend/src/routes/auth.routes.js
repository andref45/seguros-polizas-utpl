import { Router } from 'express'
import AuthController from '../controllers/AuthController.js'
import { authLimiter } from '../middleware/rateLimiter.js'
import { verifyToken } from '../middleware/auth.middleware.js'

const router = Router()

router.post('/login', authLimiter, AuthController.login)
router.post('/register', authLimiter, AuthController.register)
router.post('/logout', AuthController.logout)
router.get('/me', verifyToken, AuthController.getMe)
router.put('/profile', verifyToken, AuthController.updateProfile)

export default router
