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

  static async getAllPolizas(req, res, next) {
    try {
      const polizas = await PolizaService.getAllPolizas()
      res.status(200).json({ success: true, data: polizas })
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

  static async buscarPorCedula(req, res, next) {
    try {
      const { cedula } = req.query

      if (!cedula) {
        return res.status(400).json({
          success: false,
          error: 'Cédula es requerida'
        })
      }

      const polizas = await PolizaService.buscarPolizasPorCedula(cedula)

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

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(id)) {
        return res.status(400).json({ success: false, error: 'ID de póliza inválido' })
      }

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
      const { tipo_poliza_id, usuario_id } = req.body
      let targetUserId = req.user.id

      // Si es Admin y envía usuario_id, usar ese ID. Si no, usa el suyo.
      const isAdmin = req.user.role === 'admin' || req.user.app_metadata?.role === 'admin' // handle both cases securely

      if (isAdmin && usuario_id) {
        targetUserId = usuario_id
      }

      if (!tipo_poliza_id) {
        return res.status(400).json({
          success: false,
          error: 'El tipo de póliza es requerido'
        })
      }

      const poliza = await PolizaService.contratarPoliza(targetUserId, tipo_poliza_id)

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


  static async updatePoliza(req, res, next) {
    try {
      const { id } = req.params
      const { estado, fecha_fin, prima_mensual } = req.body

      const updates = {}
      if (estado) updates.estado = estado
      if (fecha_fin) updates.fecha_fin = fecha_fin
      if (prima_mensual) updates.prima_mensual = prima_mensual

      const { data, error } = await supabase
        .from('polizas')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      res.status(200).json({ success: true, data, message: 'Póliza actualizada' })
    } catch (error) {
      next(error)
    }
  }

  static async deletePoliza(req, res, next) {
    try {
      const { id } = req.params

      // Physical delete requested by Nancy
      const { error } = await supabase
        .from('polizas')
        .delete()
        .eq('id', id)

      if (error) throw error

      res.status(200).json({ success: true, message: 'Póliza eliminada correctamente' })
    } catch (error) {
      next(error)
    }
  }
}

export default PolizaController
