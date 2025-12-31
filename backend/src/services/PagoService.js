import PagoDAO from '../dao/PagoDAO.js'
import PolizaDAO from '../dao/PolizaDAO.js'
import BusinessRules from './BusinessRules.js'

class PagoService {
  static async getMisPagos(usuarioId) {
    return await PagoDAO.findByUsuarioId(usuarioId)
  }

  static async getPagosPendientes(usuarioId) {
    return await PagoDAO.findPendientesByUsuarioId(usuarioId)
  }

  static async getPagosByPoliza(polizaId, usuarioId) {
    const poliza = await PolizaDAO.findById(polizaId)

    if (!poliza) {
      throw new Error('Póliza no encontrada')
    }

    if (poliza.usuario_id !== usuarioId) {
      throw new Error('No tienes permiso para ver los pagos de esta póliza')
    }

    return await PagoDAO.findByPolizaId(polizaId)
  }

  static async registrarPago(usuarioId, pagoData) {
    const { poliza_id, monto, mes_periodo, anio_periodo } = pagoData

    // Verificar que la póliza existe y pertenece al usuario
    const poliza = await PolizaDAO.findById(poliza_id)

    if (!poliza) {
      throw new Error('Póliza no encontrada')
    }

    if (poliza.usuario_id !== usuarioId) {
      throw new Error('No tienes permiso para registrar pagos en esta póliza')
    }

    // Verificar que la póliza esté activa
    if (poliza.estado !== BusinessRules.ESTADOS_POLIZA.ACTIVA) {
      throw new Error('No se pueden registrar pagos en una póliza que no está activa')
    }

    // Verificar que no exista un pago para el mismo periodo
    const pagoExistente = await PagoDAO.verificarPagoExistente(
      poliza_id,
      mes_periodo,
      anio_periodo
    )

    if (pagoExistente) {
      throw new Error('Ya existe un pago registrado para este periodo')
    }

    // Verificar que el monto sea correcto
    if (monto !== poliza.prima_mensual) {
      throw new Error(`El monto debe ser igual a la prima mensual: $${poliza.prima_mensual}`)
    }

    // Crear el pago
    const nuevoPago = {
      poliza_id,
      monto,
      fecha_pago: new Date().toISOString(),
      estado: BusinessRules.ESTADOS_PAGO.PAGADO,
      mes_periodo,
      anio_periodo
    }

    return await PagoDAO.create(nuevoPago)
  }

  static async generarPagosPendientes(polizaId) {
    const poliza = await PolizaDAO.findById(polizaId)

    if (!poliza) {
      throw new Error('Póliza no encontrada')
    }

    if (poliza.estado !== BusinessRules.ESTADOS_POLIZA.ACTIVA) {
      return []
    }

    const pagosGenerados = []
    const fechaInicio = new Date(poliza.fecha_inicio)
    const fechaFin = new Date(poliza.fecha_fin)
    const hoy = new Date()

    let fecha = new Date(fechaInicio)

    while (fecha <= fechaFin && fecha <= hoy) {
      const mes = fecha.getMonth() + 1
      const anio = fecha.getFullYear()

      // Verificar si ya existe el pago
      const pagoExistente = await PagoDAO.verificarPagoExistente(
        polizaId,
        mes,
        anio
      )

      if (!pagoExistente) {
        const nuevoPago = {
          poliza_id: polizaId,
          monto: poliza.prima_mensual,
          fecha_pago: null,
          estado: BusinessRules.ESTADOS_PAGO.PENDIENTE,
          mes_periodo: mes,
          anio_periodo: anio
        }

        const pago = await PagoDAO.create(nuevoPago)
        pagosGenerados.push(pago)
      }

      // Avanzar al siguiente mes
      fecha.setMonth(fecha.getMonth() + 1)
    }

    return pagosGenerados
  }

  static calcularCoaseguro(montoSiniestro) {
    const porcentaje = BusinessRules.COASEGURO_PORCENTAJE
    const montoCoaseguro = (montoSiniestro * porcentaje) / 100
    const montoCubierto = montoSiniestro - montoCoaseguro

    return {
      monto_total: montoSiniestro,
      porcentaje_coaseguro: porcentaje,
      monto_coaseguro: montoCoaseguro,
      monto_cubierto: montoCubierto
    }
  }

  static verificarEstadoPago(fechaPago, estado) {
    if (estado === BusinessRules.ESTADOS_PAGO.PAGADO) {
      return BusinessRules.ESTADOS_PAGO.PAGADO
    }

    const hoy = new Date()
    const diaVencimiento = BusinessRules.PAGO_DIA_VENCIMIENTO

    const fechaVencimiento = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      diaVencimiento
    )

    if (hoy > fechaVencimiento) {
      return BusinessRules.ESTADOS_PAGO.VENCIDO
    }

    return BusinessRules.ESTADOS_PAGO.PENDIENTE
  }
}

export default PagoService
