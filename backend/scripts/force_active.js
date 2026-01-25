import supabase from '../src/config/supabase.config.js'

async function forceActive() {
    console.log('--- FORCING ACTIVE POLICIES ---')

    const { data, error } = await supabase
        .from('polizas')
        .update({ estado: 'Activa' })
        .neq('estado', 'Activa') // Update all that are NOT already active
        .select()

    if (error) {
        console.error('Error updating:', error)
    } else {
        console.log(`Updated ${data.length} policies to 'Activa'.`)
    }
    process.exit(0)
}

forceActive()
