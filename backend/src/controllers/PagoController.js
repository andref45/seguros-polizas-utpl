import PagoService from '../services/PagoService.js'
import PolizaDAO from '../dao/PolizaDAO.js'
import FinancialService from '../services/FinancialService.js'

class PagoController {
  static async getMisPagos(req, res, next) {
    try {
      const usuarioId = req.user.id

      const pagos = await PagoService.getMisPagos(usuarioId)

      res.status(200).json({
        success: true,
        data: pagos
      })
    } catch (error) {
      next(error)
    }
  }

  static async getPagosPendientes(req, res, next) {
    try {
      const usuarioId = req.user.id

      const pagos = await PagoService.getPagosPendientes(usuarioId)

      res.status(200).json({
        success: true,
        data: pagos
      })
    } catch (error) {
      next(error)
    }
  }

  static async getAllPagos(req, res, next) {
    try {
      // Idealmente validar rol financiero aquí
      const pagos = await PagoService.getAllPagos()
      res.status(200).json({
        success: true,
        data: pagos
      })
    } catch (error) {
      next(error)
    }
  }

  static async getPagosByPoliza(req, res, next) {
    try {
      const { polizaId } = req.params
      const usuarioId = req.user.id

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(polizaId)) {
        return res.status(400).json({ success: false, error: 'ID de póliza inválido' })
      }

      const pagos = await PagoService.getPagosByPoliza(polizaId, usuarioId)

      res.status(200).json({
        success: true,
        data: pagos
      })
    } catch (error) {
      next(error)
    }
  }

  static async registrarPago(req, res, next) {
    try {
      const usuarioId = req.user.id
      const { poliza_id, monto, mes_periodo, anio_periodo } = req.body

      if (!poliza_id || !monto || !mes_periodo || !anio_periodo) {
        return res.status(400).json({
          success: false,
          error: 'Todos los campos son requeridos'
        })
      }

      // 1. Obtener Póliza y Configuración de Copago
      const poliza = await PolizaDAO.findById(poliza_id)
      if (!poliza) {
        return res.status(404).json({ success: false, error: 'Póliza no encontrada' })
      }

      // 2. Calcular Copago Dinámico
      const copagoConfig = poliza.copagos_config
      const { montoEmpleado, montoInstitucion } = FinancialService.calculateCopago(Number(monto), copagoConfig)

      // 3. Determinar Temporalidad (Regla día 15)
      const isExtemporaneo = FinancialService.isExtemporaneous(new Date())
      const estado_temporalidad = isExtemporaneo ? 'EXTEMPORANEO' : 'ORDINARIO'

      const pagoData = {
        poliza_id,
        monto: Number(monto),
        monto_empleado: montoEmpleado,
        monto_institucion: montoInstitucion,
        estado_temporalidad,
        mes_periodo: Number(mes_periodo),
        anio_periodo: Number(anio_periodo)
      }

      const pago = await PagoService.registrarPago(usuarioId, pagoData)

      res.status(201).json({
        success: true,
        data: pago,
        message: 'Pago registrado exitosamente'
      })
    } catch (error) {
      next(error)
    }
  }

  static async calcularCoaseguro(req, res, next) {
    try {
      const { monto_siniestro } = req.body

      if (!monto_siniestro) {
        return res.status(400).json({
          success: false,
          error: 'El monto del siniestro es requerido'
        })
      }

      const calculo = PagoService.calcularCoaseguro(Number(monto_siniestro))

      res.status(200).json({
        success: true,
        data: calculo
      })
    } catch (error) {
      next(error)
    }
  }

  static async generarPagosPendientes(req, res, next) {
    try {
      const { polizaId } = req.params

      const pagos = await PagoService.generarPagosPendientes(polizaId)

      res.status(200).json({
        success: true,
        data: pagos,
        message: `${pagos.length} pagos pendientes generados`
      })
    } catch (error) {
      next(error)
    }
  }

  static async generarReporteNomina(req, res, next) {
    try {
      const { mes, anio } = req.query; // parametros opcionales
      // Llamar a servicio (Lógica de reporte)
      // Por ahora mockeamos o llamamos al método placeholder del service
      // const reporte = await FinancialService.generatePayrollReport(mes, anio);

      // Simulación de respuesta RN004
      res.status(200).json({
        success: true,
        data: {
          fecha_corte: new Date().toISOString(),
          mensaje: "Reporte de Nómina (Corte día 15) generado exitosamente",
          detalles: []
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default PagoController
