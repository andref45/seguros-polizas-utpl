import supabase from '../config/supabase.config.js'

class SiniestroDAO {
    static async create(data) {
        const { data: siniestro, error } = await supabase
            .from('siniestros')
            .insert(data)
            .select()
            .single()

        if (error) throw error
        return siniestro
    }

    static async findById(id) {
        const { data, error } = await supabase
            .from('siniestros')
            .select('*, documentos(*)')
            .eq('id', id)
            .single()

        if (error) throw error
        if (error) throw error
        return data
    }

    static async findByUserId(userId) {
        const { data, error } = await supabase
            .from('siniestros')
            .select('*, polizas!inner(*), documentos(*)')
            .eq('polizas.usuario_id', userId)
            .order('fecha_siniestro', { ascending: false })

        if (error) throw error
        return data
    }

    static async addDocument(docData) {
        const { data, error } = await supabase
            .from('documentos')
            .insert(docData)
            .select()
            .single()

        if (error) throw error
        return data
    }

    static async update(id, updates) {
        const { data, error } = await supabase
            .from('siniestros')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    }
}

export default SiniestroDAO
