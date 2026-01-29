import supabase from '../config/supabase.config.js'

class FacturasDAO {
    static async create(facturaData) {
        const { data, error } = await supabase
            .from('facturas_primas')
            .insert([facturaData])
            .select()
            .single()

        if (error) throw error
        return data
    }

    static async findAll() {
        const { data, error } = await supabase
            .from('facturas_primas')
            .select('*')
            .order('periodo_anio', { ascending: false })
            .order('periodo_mes', { ascending: false })

        if (error) throw error
        return data
    }

    static async sumTotalByPeriod(anio, mesInicio, mesFin) {
        let query = supabase
            .from('facturas_primas')
            .select('monto_total')
            .eq('periodo_anio', anio)

        if (mesInicio) query = query.gte('periodo_mes', mesInicio)
        if (mesFin) query = query.lte('periodo_mes', mesFin)

        const { data, error } = await query

        if (error) throw error

        // Sum manually since Supabase doesn't support aggregate functions easily via JS client without RPC sometimes
        // But we can check if there's a better way. For now, client-side sum is fine for reasonable volume.
        return data.reduce((sum, f) => sum + parseFloat(f.monto_total || 0), 0)
    }

    static async findByNumero(numero_factura) {
        const { data, error } = await supabase
            .from('facturas_primas')
            .select('*')
            .eq('numero_factura', numero_factura)
            .single()

        // Allow null (not found)
        if (error && error.code === 'PGRST116') return null
        if (error) throw error
        return data
    }
}

export default FacturasDAO
