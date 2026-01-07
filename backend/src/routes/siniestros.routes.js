import { Router } from 'express'
import multer from 'multer'
import SiniestroController from '../controllers/SiniestroController.js'
import { verifyToken, requireRole } from '../middleware/auth.middleware.js'

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
router.get('/mis-siniestros', verifyToken, SiniestroController.getMisSiniestros)
router.post('/aviso', verifyToken, SiniestroController.registrarAviso)
router.post('/:id/docs', verifyToken, upload.single('file'), SiniestroController.subirDocumento)
router.patch('/:id', verifyToken, requireRole('admin'), SiniestroController.actualizarEstado) // Solo Admin cambia estado manualmente por ahora

export default router
