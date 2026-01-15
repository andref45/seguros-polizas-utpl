import PolizaDAO from '../dao/PolizaDAO.js'
import VigenciaDAO from '../dao/VigenciaDAO.js'
import PolizaRules from '../rules/PolizaRules.js'
import BusinessRules from './BusinessRules.js'

class PolizaService {
  static async getTiposPoliza() {
    return await PolizaDAO.getTiposPoliza()
  }

  static async getMisPolizas(usuarioId) {
    return await PolizaDAO.findByUsuarioId(usuarioId)
  }

  static async getPolizaById(id) {
    return await PolizaDAO.findById(id)
  }

  // New method: obtenerPorUsuario
  static async obtenerPorUsuario(usuarioId) {
    return await PolizaDAO.findByUserId(usuarioId)
  }

  // New method: crear
  static async crear(datosPoliza) {
    // Regla de Negocio: Validar vigencia
    if (!PolizaRules.validarVigencia(datosPoliza.fecha_inicio, datosPoliza.fecha_fin)) {
      throw new Error('La fecha de fin debe ser posterior a la fecha de inicio')
    }
    return await PolizaDAO.create(datosPoliza)
  }

  static async contratarPoliza(usuarioId, tipoPolizaId) {
    // Obtener información del tipo de póliza
    const tipoPoliza = await PolizaDAO.getTipoPolizaById(tipoPolizaId)

    if (!tipoPoliza) {
      throw new Error('Tipo de póliza no encontrado')
    }

    // Generar número de póliza único
    const numeroPoliza = this.generarNumeroPoliza()

    // [NEW] RN002: Vigencia Activa check
    const vigencia = await VigenciaDAO.findActive()
    if (!vigencia) {
      throw new Error('NO_VIGENCIA_ACTIVA: No se pueden contratar pólizas fuera del periodo de vigencia.')
    }

    // Calcular fechas de vigencia (RN001: Must match vigencia period)
    const fechaInicio = new Date()
    // const fechaFin = new Date()
    // fechaFin.setDate(fechaFin.getDate() + BusinessRules.POLIZA_VIGENCIA_DIAS)

    // Instead of arbitrary 1 year, we clamp to Vigencia End Date (or use Business Rule).
    // Assuming standard is 1 year but capped by Vigencia.
    // For this academic model, insurance usually ends with the academic period.
    const fechaFin = new Date(vigencia.fecha_fin)

    if (fechaInicio > fechaFin) {
      throw new Error('La vigencia actual ya ha expirado.')
    }

    // Crear póliza
    const polizaData = {
      numero_poliza: numeroPoliza,
      usuario_id: usuarioId,
      tipo_poliza_id: tipoPolizaId,
      fecha_inicio: fechaInicio.toISOString(),
      fecha_fin: fechaFin.toISOString(),
      estado: BusinessRules.ESTADOS_POLIZA.ACTIVA,
      prima_mensual: tipoPoliza.prima_mensual,
      cobertura_total: tipoPoliza.cobertura_maxima
    }

    const poliza = await PolizaDAO.create(polizaData)

    return poliza
  }

  static async cancelarPoliza(id, usuarioId) {
    const poliza = await PolizaDAO.findById(id)

    if (!poliza) {
      throw new Error('Póliza no encontrada')
    }

    if (poliza.usuario_id !== usuarioId) {
      throw new Error('No tienes permiso para cancelar esta póliza')
    }

    if (poliza.estado === BusinessRules.ESTADOS_POLIZA.CANCELADA) {
      throw new Error('La póliza ya está cancelada')
    }

    return await PolizaDAO.update(id, {
      estado: BusinessRules.ESTADOS_POLIZA.CANCELADA
    })
  }

  static async verificarVigencia(polizaId) {
    const poliza = await PolizaDAO.findById(polizaId)

    if (!poliza) {
      throw new Error('Póliza no encontrada')
    }

    const hoy = new Date()
    const fechaFin = new Date(poliza.fecha_fin)

    if (hoy > fechaFin && poliza.estado === BusinessRules.ESTADOS_POLIZA.ACTIVA) {
      await PolizaDAO.update(polizaId, {
        estado: BusinessRules.ESTADOS_POLIZA.VENCIDA
      })
      return false
    }

    return poliza.estado === BusinessRules.ESTADOS_POLIZA.ACTIVA
  }

  static generarNumeroPoliza() {
    // Generate shorter ID: POL-YYMM-XXXX (e.g., POL-2601-1234) -> 13 chars
    const date = new Date()
    const year = date.getFullYear().toString().substr(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `POL-${year}${month}-${random}`
  }

  static calcularDiasRestantes(fechaFin) {
    const hoy = new Date()
    const fin = new Date(fechaFin)
    const diferencia = fin - hoy
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24))
  }
}

export default PolizaService
