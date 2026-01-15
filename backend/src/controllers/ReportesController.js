import FinancialService from '../services/FinancialService.js'
import logger from '../config/logger.js'

class ReportesController {

    static async getReporteNomina(req, res, next) {
        try {
            const { mes, anio } = req.query
            const userRole = req.user.role || req.user.app_metadata?.role

            if (!mes || !anio) {
                return res.status(400).json({ success: false, error: 'Mes y año son requeridos' })
            }

            const rawReport = await FinancialService.generatePayrollReport(mes, anio)

            // RN009: Data Masking
            // Si no es admin, ocultar datos sensibles si los hubiera (ej. saldos detallados, cuentas)
            // En este MVP, asumimos que el reporte devuelve objetos con { usuario: { cedula, ... }, monto }

            const sanitizedReport = rawReport.map(item => {
                if (userRole !== 'admin') {
                    // MASKING: Ocultar cédula completa, solo mostrar últimos 4 dígitos
                    if (item.polizas?.usuarios?.cedula) {
                        const cedula = item.polizas.usuarios.cedula
                        item.polizas.usuarios.cedula = '******' + cedula.slice(-4)
                    }
                    // MASKING: Ocultar detalles médicos si existieran en futuras versiones
                }
                return item
            })

            res.json({
                success: true,
                data: sanitizedReport,
                meta: {
                    corte: 'Día 15',
                    masked: userRole !== 'admin'
                }
            })

        } catch (error) {
            next(error)
        }
    }
}

export default ReportesController
