import supabase from '../config/supabase.config.js'
import logger from '../config/logger.js'

class ReportesController {

    // GET /api/reportes/general
    static async getResumenGeneral(req, res, next) {
        try {
            // [FIX] Use Service Role Key to bypass RLS for Reports
            const { createClient } = await import('@supabase/supabase-js')
            const adminSb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
                auth: { autoRefreshToken: false, persistSession: false }
            })

            // 1. Total Polizas Activas
            const { count: activePolicies, error: polError } = await adminSb
                .from('polizas')
                .select('*', { count: 'exact', head: true })
                .eq('estado', 'activa')

            if (polError) throw polError

            // 2. Total Siniestros del Mes
            const startOfMonth = new Date()
            startOfMonth.setDate(1)
            startOfMonth.setHours(0, 0, 0, 0)

            const { count: monthlyClaims, error: claimError } = await adminSb
                .from('siniestros')
                .select('*', { count: 'exact', head: true })
                .gte('fecha_reporte', startOfMonth.toISOString())

            if (claimError) throw claimError

            // 3. Total Usuarios Registrados
            const { count: totalUsers, error: userError } = await adminSb
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
            // [FIX] Use Service Role Key
            const { createClient } = await import('@supabase/supabase-js')
            const adminSb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
                auth: { autoRefreshToken: false, persistSession: false }
            })

            const { data: polizas, error } = await adminSb
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
                .eq('estado', 'activa')

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
            res.status(500).json({ success: false, error: 'Error al generar nómina' })
        }
    }

    // GET /api/reportes/siniestralidad
    static async getSiniestralidad(req, res, next) {
        try {
            const { anio, mesInicio, mesFin } = req.query

            if (!anio) {
                return res.status(400).json({ success: false, error: 'Año es requerido' })
            }

            // 1. Get Denominator: Total Facturas Real (Global Invoices)
            // Import dynamically or assume it's available via import at top (need to add import)
            const FacturasDAO = (await import('../dao/FacturasDAO.js')).default

            const totalPrimas = await FacturasDAO.sumTotalByPeriod(anio, mesInicio, mesFin)

            // 2. Get Numerator: Total Siniestros Pagados
            // [FIX] Use Service Role Key
            const { createClient } = await import('@supabase/supabase-js')
            const adminSb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
                auth: { autoRefreshToken: false, persistSession: false }
            })

            let query = adminSb
                .from('siniestros')
                .select('monto_pagado_seguro')
                .eq('estado', 'Aprobado')
                .not('monto_pagado_seguro', 'is', null) // Only liquidated ones

            // Filter by liquidation date similar to period
            // Complex date filtering in strings... simplified approach:
            const startDate = new Date(anio, (mesInicio || 1) - 1, 1).toISOString()
            const endDate = new Date(anio, (mesFin || 12), 0, 23, 59, 59).toISOString()

            query = query.gte('fecha_liquidacion', startDate).lte('fecha_liquidacion', endDate)

            const { data: siniestros, error: sinError } = await query
            if (sinError) throw sinError

            const totalSiniestros = siniestros.reduce((sum, s) => sum + (s.monto_pagado_seguro || 0), 0)

            // 3. Calculate Ratio
            const ratio = totalPrimas > 0 ? ((totalSiniestros / totalPrimas) * 100).toFixed(2) : 0

            res.status(200).json({
                success: true,
                data: {
                    anio,
                    periodo: `${mesInicio || 1} - ${mesFin || 12}`,
                    totalPrimasPagadas: totalPrimas,
                    totalSiniestrosRecuperados: totalSiniestros,
                    siniestralidad: parseFloat(ratio) // Percentage
                }
            })

        } catch (error) {
            next(error)
        }
    }
}

export default ReportesController
