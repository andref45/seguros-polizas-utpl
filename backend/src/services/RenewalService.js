import supabase from '../config/supabase.config.js';
import PolizaDAO from '../dao/PolizaDAO.js';

class RenewalService {

    /**
     * Procesa la renovación anual de pólizas.
     * Cierra las pólizas de la vigencia anterior y crea nuevas copias para la nueva vigencia.
     * @param {number} anioAnterior - Año de la vigencia que termina.
     * @param {number} anioNuevo - Año de la nueva vigencia.
     */
    static async processYearlyRenewal(anioAnterior, anioNuevo) {
        try {
            // 1. Obtener vigencias
            const { data: vigenciaAnt, error: errAnt } = await supabase
                .from('vigencias').select('id').eq('anio', anioAnterior).single();

            const { data: vigenciaNueva, error: errNew } = await supabase
                .from('vigencias').select('id').eq('anio', anioNuevo).single();

            if (errAnt || errNew) throw new Error("No se encontraron las vigencias especificadas.");

            // 2. Obtener todas las pólizas activas del año anterior
            // Nota: PolizaDAO necesitaría un método findByVigencia, usamos consulta directa por flexibilidad aquí
            const { data: polizasActivas, error: errPol } = await supabase
                .from('polizas')
                .select('*')
                .eq('vigencia_id', vigenciaAnt.id)
                .eq('estado', 'activa');

            if (errPol) throw errPol;

            const resultados = { renovadas: 0, errores: 0, detalles: [] };

            // 3. Iterar y renovar
            for (const poliza of polizasActivas) {
                try {
                    // a. Crear nueva póliza
                    const nuevaPoliza = {
                        usuario_id: poliza.usuario_id,
                        tipo_poliza_id: poliza.tipo_poliza_id,
                        numero_poliza: `REN-${anioNuevo}-${poliza.numero_poliza.split('-').pop()}`, // Lógica simple de renombrado
                        fecha_inicio: `${anioNuevo}-01-01`,
                        fecha_fin: `${anioNuevo}-12-31`,
                        estado: 'activa',
                        prima_mensual: poliza.prima_mensual,
                        cobertura_total: poliza.cobertura_total,
                        vigencia_id: vigenciaNueva.id,
                        tipo_copago: poliza.tipo_copago // Hereda el tipo de copago
                    };

                    await PolizaDAO.create(nuevaPoliza);

                    // b. Cerrar póliza anterior (opcional, o dejarla como 'vencida' por fecha)
                    await PolizaDAO.update(poliza.id, { estado: 'vencida' });

                    resultados.renovadas++;
                } catch (e) {
                    resultados.errores++;
                    resultados.detalles.push({ poliza: poliza.numero_poliza, error: e.message });
                }
            }

            return resultados;

        } catch (error) {
            console.error("Error en processYearlyRenewal:", error);
            throw error;
        }
    }
}

export default RenewalService;
