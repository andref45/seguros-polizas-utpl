import PolizaService from '../services/PolizaService.js'
import supabase from '../config/supabase.config.js'

class PolizaController {
  static async getTiposPoliza(req, res, next) {
    try {
      const tipos = await PolizaService.getTiposPoliza()

      res.status(200).json({
        success: true,
        data: tipos
      })
    } catch (error) {
      next(error)
    }
  }

  static async getMisPolizas(req, res, next) {
    try {
      const usuarioId = req.user.id

      const polizas = await PolizaService.getMisPolizas(usuarioId)

      res.status(200).json({
        success: true,
        data: polizas
      })
    } catch (error) {
      next(error)
    }
  }

  static async getPolizaById(req, res, next) {
    try {
      const { id } = req.params

      const poliza = await PolizaService.getPolizaById(id)

      if (!poliza) {
        return res.status(404).json({
          success: false,
          error: 'Póliza no encontrada'
        })
      }

      // Verificar que la póliza pertenece al usuario
      if (poliza.usuario_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permiso para ver esta póliza'
        })
      }

      res.status(200).json({
        success: true,
        data: poliza
      })
    } catch (error) {
      next(error)
    }
  }

  static async contratarPoliza(req, res, next) {
    try {
      const { tipo_poliza_id } = req.body
      const usuarioId = req.user.id

      if (!tipo_poliza_id) {
        return res.status(400).json({
          success: false,
          error: 'El tipo de póliza es requerido'
        })
      }

      const poliza = await PolizaService.contratarPoliza(usuarioId, tipo_poliza_id)

      res.status(201).json({
        success: true,
        data: poliza,
        message: 'Póliza contratada exitosamente'
      })
    } catch (error) {
      next(error)
    }
  }

  static async cancelarPoliza(req, res, next) {
    try {
      const { id } = req.params
      const usuarioId = req.user.id

      const poliza = await PolizaService.cancelarPoliza(id, usuarioId)

      res.status(200).json({
        success: true,
        data: poliza,
        message: 'Póliza cancelada exitosamente'
      })
    } catch (error) {
      next(error)
    }
  }

  static async verificarVigencia(req, res, next) {
    try {
      const { id } = req.params

      const vigente = await PolizaService.verificarVigencia(id)

      res.status(200).json({
        success: true,
        data: {
          vigente
        }
      })
    } catch (error) {
      next(error)
    }
  }

  static async getBeneficiarios(req, res, next) {
    try {
      const { id } = req.params
      // Idealmente mover a Service/DAO, pero por MVP "implementalo ahora":
      const { data, error } = await supabase
        .from('beneficiarios')
        .select('*')
        .eq('poliza_id', id)

      if (error) throw error

      res.status(200).json({ success: true, data })
    } catch (error) {
      next(error)
    }
  }
}

export default PolizaController
