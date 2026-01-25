import supabase from '../src/config/supabase.config.js'

async function diagnose() {
    console.log('--- DIAGNOSTICO DE REPORTES ---')

    // 1. Check Polizas
    const { data: polizas, error } = await supabase
        .from('polizas')
        .select('id, estado, fecha_fin, fecha_inicio, prima_mensual')

    if (error) {
        console.error('Error fetching polizas:', error)
        return
    }

    console.log(`Total Polizas found: ${polizas.length}`)
    polizas.forEach(p => {
        console.log(`ID: ${p.id} | Estado: '${p.estado}' (Len: ${p.estado.length}) | Fin: ${p.fecha_fin}`)
    })

    // 2. Check Siniestros dates
    const { data: claims } = await supabase.from('siniestros').select('id, fecha_reporte, estado, monto_pagado_seguro')
    console.log(`Total Siniestros: ${claims.length}`)
    claims.forEach(c => {
        console.log(`ID: ${c.id} | Reporte: ${c.fecha_reporte} | Estado: ${c.estado} | Pagado: ${c.monto_pagado_seguro}`)
    })

    // 3. Check Nomina Query manually
    console.log('--- Checking Nomina Query Matches ---')
    const { data: nominaRaw, error: nErr } = await supabase
        .from('polizas')
        .select('id, usuarios!inner(id)')
        .eq('estado', 'Activa')

    if (nErr) console.error('Nomina Query Error:', nErr)
    else console.log(`Nomina Query returned ${nominaRaw.length} rows.`)

    process.exit(0)
}

diagnose()
