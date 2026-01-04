import supabase from '../config/supabase.config.js'

class VigenciaDAO {
    static async findActive() {
        const today = new Date().toISOString().split('T')[0]

        // Buscar vigencia que cubra la fecha actual y esté abierta
        const { data, error } = await supabase
            .from('vigencias')
            .select('*')
            .eq('estado', 'abierto')
            .lte('fecha_inicio', today)
            .gte('fecha_fin', today)
            .maybeSingle() // Puede retornar null si no hay

        if (error) throw error
        return data
    }

    static async findByYear(year) {
        const { data, error } = await supabase
            .from('vigencias')
            .select('*')
            .eq('anio', year)
            .single()

        if (error && error.code !== 'PGRST116') throw error // Ignore not found
        return data
    }
}

export default VigenciaDAO
