import supabase from '../config/supabase.config.js'
import logger from '../config/logger.js'

class ReglasController {

    static async getConfigs(req, res, next) {
        try {
            // 1. Get Vigencias
            const { data: vigencias, error: vigError } = await supabase
                .from('vigencias')
                .select('*')
                .order('anio', { ascending: false })

            if (vigError) throw vigError

            // 2. Get Copagos Config
            const { data: copagos, error: copError } = await supabase
                .from('copagos_config')
                .select('*')
                .order('id', { ascending: true })

            if (copError) throw copError

            res.status(200).json({
                success: true,
                data: {
                    vigencias,
                    copagos
                }
            })
        } catch (error) {
            logger.error('Error fetching business rules:', error)
            res.status(500).json({ success: false, error: 'Error al obtener reglas de negocio' })
        }
    }

    static async updateVigencia(req, res, next) {
        try {
            const { id } = req.params
            const { estado } = req.body // 'abierto', 'cerrado'

            const { data, error } = await supabase
                .from('vigencias')
                .update({ estado })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error

            res.status(200).json({ success: true, data, message: 'Vigencia actualizada' })

        } catch (error) {
            logger.error('Error updating vigencia:', error)
            res.status(500).json({ success: false, error: 'Error al actualizar vigencia' })
        }
    }

    static async updateCopago(req, res, next) {
        try {
            const { id } = req.params
            // RN003: Allow updating percentages
            // We expect numerical inputs for percentages if schema supports it, 
            // otherwise we update description strictly or mapping columns.
            // Assuming we added columns or rely on 'descripcion' for now but will prepare for values.
            const { porcentaje_usuario, porcentaje_institucion } = req.body

            const updates = {}
            if (porcentaje_usuario !== undefined) updates.porcentaje_usuario = porcentaje_usuario
            if (porcentaje_institucion !== undefined) updates.porcentaje_institucion = porcentaje_institucion

            const { data, error } = await supabase
                .from('copagos_config')
                .update(updates)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error

            res.status(200).json({ success: true, data, message: 'Configuración de copago actualizada' })

        } catch (error) {
            logger.error('Error updating copago:', error)
            res.status(500).json({ success: false, error: 'Error al actualizar copago' })
        }
    }
}

export default ReglasController
