import supabase from '../config/supabase.config.js'

class PolizaDAO {
  static async findAll() {
    const { data, error } = await supabase
      .from('polizas')
      .select('*, tipos_poliza(*), usuarios(*), copagos_config(*)')


    if (error) throw error
    return data
  }

  static async findById(id) {
    const { createClient } = await import('@supabase/supabase-js')
    const adminSb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const { data, error } = await adminSb
      .from('polizas')
      .select('*, tipos_poliza(*), usuarios(*), copagos_config(*)')
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    return data
  }

  static async findByUsuarioId(usuarioId) {
    const { data, error } = await supabase
      .from('polizas')
      .select('*, tipos_poliza(*)')
      .eq('usuario_id', usuarioId)


    if (error) throw error
    return data
  }

  static async findByNumeroPoliza(numeroPoliza) {
    const { data, error } = await supabase
      .from('polizas')
      .select('*, tipos_poliza(*), usuarios(*)')
      .eq('numero_poliza', numeroPoliza)
      .maybeSingle()

    if (error) throw error
    return data
  }

  static async findByCedula(cedula) {
    // [FIX] Use Service Role Key to bypass RLS (Beneficiaries searching for Deceased's policies)
    const { createClient } = await import('@supabase/supabase-js')
    const adminSb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const { data, error } = await adminSb
      .from('polizas')
      .select('*, tipos_poliza(*), usuarios!inner(*)')
      .eq('usuarios.cedula', cedula)
      .eq('estado', 'activa') // Lowercase as per DB Schema Default

    if (error) throw error
    return data
  }

  static async create(polizaData) {
    // [FIX] Instantiate fresh client to guarantee Service Role Key usage for inserts (Bypass RLS)
    const { createClient } = await import('@supabase/supabase-js')
    const adminSb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const { data, error } = await adminSb
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
