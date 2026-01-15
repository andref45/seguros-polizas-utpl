import supabase from '../config/supabase.config.js'

class FinancialService {

    /**
     * Calcula los montos correspondientes al empleado y a la institución
     * basado en la configuración de copago dinámica.
     * @param {number} montoTotal - El monto total del pago.
     * @param {Object} config - Objeto de configuración { porcentaje_empleado, porcentaje_institucion }.
     * @returns {Object} { montoEmpleado, montoInstitucion }
     */
    static calculateCopago(montoTotal, config) {
        let porcentajeInstitucion = 0;
        let porcentajeEmpleado = 100;

        if (config) {
            porcentajeInstitucion = Number(config.porcentaje_institucion) || 0;
            porcentajeEmpleado = Number(config.porcentaje_empleado) || 0;
        }

        const montoInstitucion = Number(((montoTotal * porcentajeInstitucion) / 100).toFixed(2));
        // Force the sum to match exactly by calculating the remainder
        const montoEmpleado = Number((montoTotal - montoInstitucion).toFixed(2));

        return {
            montoInstitucion,
            montoEmpleado
        };
    }

    /**
     * Determina si un pago es extemporáneo (realizado después del día 15).
     * @param {string|Date} fechaPago - Fecha en que se realiza el pago.
     * @returns {boolean} true si es extemporáneo, false si es ordinario.
     */
    static isExtemporaneous(fechaPago = new Date()) {
        const fecha = new Date(fechaPago);
        const dia = fecha.getDate();
        // RN005: Fecha límite es el día 5. A partir del 6 ya es extemporáneo.
        return dia > 5;
    }

    /**
     * Genera el reporte de nómina para el corte del día 15.
     * (Placeholder para implementación futura de reporte completo)
     */
    static async generatePayrollReport(mes = null, anio = null) {
        // RN008: Reporte de Nómina con corte al día 15.
        // Incluye pólizas activas.

        try {
            const { data, error } = await supabase
                .from('view_reporte_nomina') // [TODO] Crear vista SQL o hacer query compleja
                .select('*')

            if (error) {
                // Fallback: Query manual si view no existe
                // Por MVP: Simular reporte filtrando pagos del mes
                const { data: pagos, error: pagosError } = await supabase
                    .from('pagos')
                    .select(`
                        id,
                        monto,
                        fecha_pago,
                        polizas (
                            numero_poliza,
                            usuarios (cedula, apellidos, nombres)
                        )
                    `)
                    .gte('fecha_pago', `${anio}-${mes}-01`)
                    .lte('fecha_pago', `${anio}-${mes}-15`) // Corte día 15

                if (pagosError) throw pagosError
                return pagos
            }

            return data
        } catch (err) {
            console.error('Error generating payroll report:', err)
            throw new Error('Error generando reporte de nómina')
        }
    }
}

export default FinancialService;
