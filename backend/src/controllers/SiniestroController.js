import SiniestroService from '../services/SiniestroService.js'
import logger from '../config/logger.js'

class SiniestroController {

  // Paso 0: Obtener mis siniestros
  static async getMisSiniestros(req, res) {
    try {
      const userId = req.user.id
      const siniestros = await SiniestroService.getMisSiniestros(userId)

      res.status(200).json({
        success: true,
        data: siniestros
      })
    } catch (error) {
      logger.error('Error getMisSiniestros', error)
      res.status(500).json({ success: false, error: error.message })
    }
  }

  // Paso 1: Aviso de Siniestro
  static async registrarAviso(req, res) {
    try {
      const avisoData = req.body
      const userId = req.user.id

      const siniestro = await SiniestroService.registrarAviso(userId, avisoData)

      res.status(201).json({
        success: true,
        data: { id: siniestro.id, estado: siniestro.estado },
        message: 'Aviso registrado correctamente. Proceda a subir documentos.'
      })

    } catch (error) {
      logger.error('Error registrarAviso', error)
      if (error.message.includes('BLOQUEO_MOROSIDAD') || error.message.includes('Vigencia Cerrada')) {
        return res.status(409).json({ success: false, error: error.message })
      }
      if (error.code === '23505') { // Unique violation logic handled or propagated from Service? Service usually propagates DB errors.
        return res.status(409).json({ success: false, error: 'Ya existe un siniestro reportado para esta persona y fecha.' })
      }
      res.status(500).json({ success: false, error: error.message })
    }
  }

  // Paso 2: Subida de Documentos
  static async subirDocumento(req, res) {
    try {
      const { id } = req.params
      const file = req.file // Multer file
      const tipo = req.body.tipo

      const documento = await SiniestroService.subirDocumento(id, file, tipo)

      res.status(201).json({
        success: true,
        data: documento,
        message: 'Documento subido y validado exitosamente'
      })

    } catch (error) {
      logger.error('Error subirDocumento', error)
      res.status(500).json({ success: false, error: error.message })
    }
  }

  // Paso 3: Cambio de Estado (FSM Estricta)
  static async actualizarEstado(req, res) {
    try {
      const { id } = req.params
      const { estado } = req.body

      const updated = await SiniestroService.actualizarEstado(id, estado)

      res.status(200).json({
        success: true,
        data: updated,
        message: `Estado actualizado a ${estado}`
      })

    } catch (error) {
      logger.error('Error actualizarEstado', error)
      res.status(500).json({ success: false, error: error.message })
    }
  }
}

export default SiniestroController
