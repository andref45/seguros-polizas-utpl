import { Router } from 'express'
import multer from 'multer'
import SiniestroController from '../controllers/SiniestroController.js'
import { verifyToken, requireRole } from '../middleware/auth.middleware.js'
import { ROLES } from '../constants/roles.js'
import { authLimiter } from '../middleware/rateLimiter.js'

const router = Router()

// Configurar Multer (Memoria para calcular Hash antes de subir)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true)
        } else {
            cb(new Error('Solo PDFs son permitidos'))
        }
    }
})

// Rutas
router.get('/todos', verifyToken, requireRole(ROLES.ADMIN), SiniestroController.getAllSiniestros) // [NEW] Admin Only

// Rutas Admin
router.get('/', verifyToken, requireRole(ROLES.ADMIN), SiniestroController.getAllSiniestros) // [NEW] Admin: Get All
router.get('/:id', verifyToken, requireRole(ROLES.ADMIN), SiniestroController.getById) // [NEW] Admin: Detail
router.put('/:id/estado', verifyToken, requireRole(ROLES.ADMIN), SiniestroController.actualizarEstado)
router.put('/:id/liquidacion', verifyToken, requireRole(ROLES.ADMIN), SiniestroController.registrarLiquidacion) // [NEW] Liquidacion endpoint

// Rutas Cliente
router.get('/mis-siniestros', verifyToken, SiniestroController.getMisSiniestros)
router.post('/aviso', authLimiter, verifyToken, SiniestroController.registrarAviso) // Public/User intake with rate limit
router.post('/:id/docs', verifyToken, upload.single('file'), SiniestroController.subirDocumento)
router.patch('/:id', verifyToken, requireRole(ROLES.ADMIN), SiniestroController.actualizarEstado) // Solo Admin cambia estado manualmente por ahora

export default router
