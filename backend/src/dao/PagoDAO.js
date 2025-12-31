import supabase from '../config/supabase.config.js'

class PagoDAO {
  static async findAll() {
    const { data, error } = await supabase
      .from('pagos')
      .select('*, polizas(*, tipos_poliza(*))')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('pagos')
      .select('*, polizas(*, tipos_poliza(*))')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async findByPolizaId(polizaId) {
    const { data, error } = await supabase
      .from('pagos')
      .select('*')
      .eq('poliza_id', polizaId)
      .order('fecha_pago', { ascending: false })

    if (error) throw error
    return data
  }

  static async findByUsuarioId(usuarioId) {
    const { data, error } = await supabase
      .from('pagos')
      .select('*, polizas!inner(*, tipos_poliza(*))')
      .eq('polizas.usuario_id', usuarioId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  static async findPendientesByUsuarioId(usuarioId) {
    const { data, error } = await supabase
      .from('pagos')
      .select('*, polizas!inner(*, tipos_poliza(*))')
      .eq('polizas.usuario_id', usuarioId)
      .eq('estado', 'pendiente')
      .order('mes_periodo', { ascending: true })

    if (error) throw error
    return data
  }

  static async create(pagoData) {
    const { data, error } = await supabase
      .from('pagos')
      .insert([pagoData])
      .select('*, polizas(*, tipos_poliza(*))')
      .single()

    if (error) throw error
    return data
  }

  static async update(id, updates) {
    const { data, error } = await supabase
      .from('pagos')
      .update(updates)
      .eq('id', id)
      .select('*, polizas(*, tipos_poliza(*))')
      .single()

    if (error) throw error
    return data
  }

  static async delete(id) {
    const { error } = await supabase
      .from('pagos')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  }

  static async verificarPagoExistente(polizaId, mesPeriodo, anioPeriodo) {
    const { data, error } = await supabase
      .from('pagos')
      .select('*')
      .eq('poliza_id', polizaId)
      .eq('mes_periodo', mesPeriodo)
      .eq('anio_periodo', anioPeriodo)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }
}

export default PagoDAO
