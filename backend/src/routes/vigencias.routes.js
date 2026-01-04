import { Router } from 'express'
import VigenciaDAO from '../dao/VigenciaDAO.js'
import logger from '../config/logger.js'

const router = Router()

router.get('/activa', async (req, res) => {
    try {
        const vigencia = await VigenciaDAO.findActive()
        if (!vigencia) {
            return res.status(404).json({ success: false, message: 'No hay vigencia activa para la fecha actual.' })
        }
        res.json({ success: true, data: vigencia })
    } catch (error) {
        logger.error('Error getting active vigencia', error)
        res.status(500).json({ success: false, error: error.message })
    }
})

export default router
