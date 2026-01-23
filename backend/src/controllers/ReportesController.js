import supabase from '../config/supabase.config.js'
import logger from '../config/logger.js'

class ReportesController {

    // GET /api/reportes/general
    static async getResumenGeneral(req, res, next) {
        try {
            // 1. Total Polizas Activas
            const { count: activePolicies, error: polError } = await supabase
                .from('polizas')
                .select('*', { count: 'exact', head: true })
                .eq('estado', 'Activa')

            if (polError) throw polError

            // 2. Total Siniestros del Mes
            const startOfMonth = new Date()
            startOfMonth.setDate(1)
            startOfMonth.setHours(0, 0, 0, 0)

            const { count: monthlyClaims, error: claimError } = await supabase
                .from('siniestros')
                .select('*', { count: 'exact', head: true })
                .gte('fecha_reporte', startOfMonth.toISOString())

            if (claimError) throw claimError

            // 3. Total Usuarios Registrados
            const { count: totalUsers, error: userError } = await supabase
                .from('usuarios')
                .select('*', { count: 'exact', head: true })

            if (userError) throw userError

            console.log('--- REPORT DEBUG ---')
            console.log('Active Policies:', activePolicies)
            console.log('Monthly Claims:', monthlyClaims)
            console.log('Total Users:', totalUsers)
            console.log('--------------------')

            res.status(200).json({
                success: true,
                data: {
                    activePolicies: activePolicies || 0,
                    monthlyClaims: monthlyClaims || 0,
                    totalUsers: totalUsers || 0
                }
            })
        } catch (error) {
            logger.error('Error fetching general reports:', error)
            res.status(500).json({ success: false, error: 'Error al generar reporte general' })
        }
    }

    // GET /api/reportes/nomina
    static async getReporteNomina(req, res, next) {
        try {
            // RN008: Only active policies
            // RN005: Cutoff logic (simulated for report generation)

            const { data: polizas, error } = await supabase
                .from('polizas')
                .select(`
                    id,
                    numero_poliza,
                    prima_mensual,
                    usuarios!inner (
                        id,
                        nombres,
                        apellidos,
                        cedula,
                        tipo_usuario
                    ),
                    copagos_config (
                        esquema,
                        porcentaje_usuario
                    )
                `)
                .eq('estado', 'Activa')

            if (error) throw error

            const reporte = polizas.map(p => {
                // Default split logic if not defined in DB config
                // [REFACTOR] Now using DB value directly (RN003)
                // Fallback to 0.30 if null
                const porcentajeUsuario = p.copagos_config?.porcentaje_usuario ?? 0.30

                // RN003: Calculation
                // Assuming prima_mensual is the TOTAL premium. 
                // If prima_mensual is what the user PAYS, then no calculation needed.
                // Usually 'prima' is total.

                const montoDescuento = (p.prima_mensual * porcentajeUsuario).toFixed(2)
                const aporteInstitucion = (p.prima_mensual * (1 - porcentajeUsuario)).toFixed(2)

                return {
                    id: p.id,
                    empleado: `${p.usuarios.nombres} ${p.usuarios.apellidos}`,
                    cedula: p.usuarios.cedula,
                    tipo: p.usuarios.tipo_usuario,
                    total_prima: p.prima_mensual,
                    descuento_rol: montoDescuento,
                    aporte_utpl: aporteInstitucion,
                    detalle: `Seguro de Vida - ${p.copagos_config?.esquema || 'Estándar'}`
                }
            })

            res.status(200).json({
                success: true,
                data: reporte,
                generated_at: new Date()
            })

        } catch (error) {
            logger.error('Error fetching nomina report:', error)
            import('fs').then(fs => {
                fs.writeFileSync('error_reportes_2.json', JSON.stringify(error, null, 2))
            })
            res.status(500).json({ success: false, error: 'Error al generar nómina' })
        }
    }
}

export default ReportesController
