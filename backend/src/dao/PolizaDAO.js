import supabase from '../config/supabase.config.js'

class PolizaDAO {
  static async findAll() {
    const { data, error } = await supabase
      .from('polizas')
      .select('*, tipos_poliza(*), usuarios(*), copagos_config(*)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('polizas')
      .select('*, tipos_poliza(*), usuarios(*), copagos_config(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async findByUsuarioId(usuarioId) {
    const { data, error } = await supabase
      .from('polizas')
      .select('*, tipos_poliza(*)')
      .eq('usuario_id', usuarioId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  static async findByNumeroPoliza(numeroPoliza) {
    const { data, error } = await supabase
      .from('polizas')
      .select('*, tipos_poliza(*), usuarios(*)')
      .eq('numero_poliza', numeroPoliza)
      .single()

    if (error) throw error
    return data
  }

  static async create(polizaData) {
    const { data, error } = await supabase
      .from('polizas')
      .insert([polizaData])
      .select('*, tipos_poliza(*)')
      .single()

    if (error) throw error
    return data
  }

  static async update(id, updates) {
    const { data, error } = await supabase
      .from('polizas')
      .update(updates)
      .eq('id', id)
      .select('*, tipos_poliza(*)')
      .single()

    if (error) throw error
    return data
  }

  static async delete(id) {
    const { error } = await supabase
      .from('polizas')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  }

  static async getTiposPoliza() {
    const { data, error } = await supabase
      .from('tipos_poliza')
      .select('*')
      .order('nombre', { ascending: true })

    if (error) throw error
    return data
  }

  static async getTipoPolizaById(id) {
    const { data, error } = await supabase
      .from('tipos_poliza')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async countPolizasActivas(usuarioId) {
    const { count, error } = await supabase
      .from('polizas')
      .select('*', { count: 'exact', head: true })
      .eq('usuario_id', usuarioId)
      .eq('estado', 'activa')

    if (error) throw error
    return count
  }
}

export default PolizaDAO
