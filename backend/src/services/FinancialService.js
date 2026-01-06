
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

        const montoInstitucion = (montoTotal * porcentajeInstitucion) / 100;
        const montoEmpleado = (montoTotal * porcentajeEmpleado) / 100;

        return {
            montoInstitucion: Number(montoInstitucion.toFixed(2)),
            montoEmpleado: Number(montoEmpleado.toFixed(2))
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
        // RN004: Si el pago se registra después del día 15, es fuera de plazo.
        return dia > 15;
    }

    /**
     * Genera el reporte de nómina para el corte del día 15.
     * (Placeholder para implementación futura de reporte completo)
     */
    static async generatePayrollReport(mes, anio) {
        // Lógica para consultar DAOs y armar el reporte
        // Se implementará en conjunto con el endpoint de reportes
        return { message: "Not implemented yet" };
    }
}

export default FinancialService;
