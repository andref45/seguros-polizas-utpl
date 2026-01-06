import PagoDAO from '../dao/PagoDAO.js'
import PolizaDAO from '../dao/PolizaDAO.js'

class AccessControlService {

    /**
     * Verifica si una póliza tiene deudas pendientes que impidan trámites (Siniestros).
     * @param {string} polizaId - ID de la póliza.
     * @returns {Object} { allowed: boolean, reason: string }
     */
    static async checkMorosity(polizaId) {
        // 1. Verificar estado de la póliza
        const poliza = await PolizaDAO.findById(polizaId)
        if (!poliza) {
            return { allowed: false, reason: "Póliza no encontrada." }
        }

        if (poliza.estado !== 'activa') {
            return { allowed: false, reason: `La póliza no está activa (Estado: ${poliza.estado}).` }
        }

        // 2. Verificar deudas
        const deudas = await PagoDAO.findDeudasByPolizaId(polizaId)

        if (deudas && deudas.length > 0) {
            return {
                allowed: false,
                reason: `La póliza presenta ${deudas.length} pago(s) vencido(s). Regularice su situación para continuar.`
            }
        }

        return { allowed: true }
    }
}

export default AccessControlService
