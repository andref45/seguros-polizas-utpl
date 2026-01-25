import supabase from '../src/config/supabase.config.js'

async function debugQuery() {
    console.log('--- DEBUGGING SINIESTRO QUERY ---')

    // 1. Get an ID first
    const { data: list } = await supabase.from('siniestros').select('id').limit(1)
    if (!list || list.length === 0) {
        console.log('No siniestros to test.')
        return
    }
    const id = list[0].id
    console.log(`Testing with ID: ${id}`)

    // 2. Run the suspect query
    try {
        const { data, error } = await supabase
            .from('siniestros')
            .select(`
        *,
        documentos (*),
        polizas (
          id,
          numero_poliza,
          usuarios (
            id,
            nombres,
            apellidos,
            cedula,
            telefono,
            email
          )
        )
      `)
            .eq('id', id)
            .single()

        if (error) {
            console.error('❌ Query Failed:', JSON.stringify(error, null, 2))
        } else {
            console.log('✅ Query Success!')
            // console.log(JSON.stringify(data, null, 2))
        }

    } catch (e) {
        console.error('❌ Exception:', e)
    }
    process.exit(0)
}

debugQuery()
