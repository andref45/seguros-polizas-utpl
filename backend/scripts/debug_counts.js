import supabase from '../src/config/supabase.config.js'

async function checkCounts() {
    console.log('--- DB COUNT DEBUG ---')

    const { count: users, error: uErr } = await supabase.from('usuarios').select('*', { count: 'exact', head: true })
    console.log(`Users Count: ${users} (Error: ${uErr?.message})`)

    const { count: polizas, error: pErr } = await supabase.from('polizas').select('*', { count: 'exact', head: true })
    console.log(`Polizas Count: ${polizas} (Error: ${pErr?.message})`)

    const { count: siniestros, error: sErr } = await supabase.from('siniestros').select('*', { count: 'exact', head: true })
    console.log(`Siniestros Count: ${siniestros} (Error: ${sErr?.message})`)

    // Check active policies specifically as per report
    const { count: activePol, error: apErr } = await supabase.from('polizas').select('*', { count: 'exact', head: true }).eq('estado', 'Activa')
    console.log(`Active Polizas Count: ${activePol} (Error: ${apErr?.message})`)

    process.exit(0)
}

checkCounts()
