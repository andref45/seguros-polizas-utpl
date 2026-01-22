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

    static async findByUserIdOrCedula(userId, userCedula) {
        // Find claims where:
        // 1. User is the policy holder (polizas.usuario_id = userId)
        // 2. OR User is the reporter (cedula_declarante = userCedula)

        // Note: Using !inner on polizas forces only claims with valid policies, 
        // but we need to be careful with the OR logic. 
        // Supabase/PostgREST 'or' syntax: 'column.eq.value,other.eq.other'

        // Since we need to join polizas to check usuario_id, but also check cedula_declarante on the main table...
        // The embedded resource filter (polizas.usuario_id) combined with top-level OR is tricky in simple SDK.
        // Easiest way: Select all linked to policies, then filter? No, RLS might block.
        // Ideally we use the OR syntax on top level columns, but polizas.usuario_id is nested.

        // Let's try explicit OR string including the joined column reference if supported, 
        // or just fetch by cedula_declarante first, then fetch by policy owner, and merge?
        // Merging is safer/easier to debug.

        const { data: byOwner, error: err1 } = await supabase
            .from('siniestros')
            .select('*, documentos(*), polizas!inner(*)')
            .eq('polizas.usuario_id', userId)

        if (err1) throw err1

        let combined = [...byOwner]

        // Legacy support for cedula_declarante removed as column no longer exists.
        // If we need to support third-party reporters, we need a new schema approach (e.g. reporter_id).
        // For now, we only return claims where the user is the policy holder.

        if (userCedula) {
            // Logic removed: column 'cedula_declarante' dropped from DB.
        }


        // Sort desc
        combined.sort((a, b) => new Date(b.fecha_siniestro) - new Date(a.fecha_siniestro))

        return combined
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
