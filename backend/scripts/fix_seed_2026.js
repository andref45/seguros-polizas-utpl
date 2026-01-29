import supabase from '../src/config/supabase.config.js'

// Use native crypto for UUIDs
const genUUID = () => crypto.randomUUID()

async function seedCurrentYear() {
    const CURRENT_YEAR = new Date().getFullYear()
    console.log(`🌱 Seeding for Year: ${CURRENT_YEAR}`)

    // 1. Get existing users
    const { data: users } = await supabase.from('usuarios').select('id, cedula').limit(1)

    if (!users || users.length === 0) {
        console.error('❌ No users found.')
        return
    }
    const user = users[0]

    // 2. Create Active Polizas (Valid for Current Year)
    const polizasData = [
        {
            numero_poliza: `POL-VIDA-${CURRENT_YEAR}-${Date.now()}`,
            usuario_id: user.id,
            tipo_poliza_id: null,
            fecha_inicio: `${CURRENT_YEAR}-01-01`,
            fecha_fin: `${CURRENT_YEAR}-12-31`,
            estado: 'Activa',
            prima_mensual: 50.00,
            cobertura_monto: 100000,
            beneficiarios: { "nombre": "Beneficiario 2026", "parentesco": "Hijo" },
            copagos_config: { "esquema": "70/30", "porcentaje_usuario": 0.3 }
        }
    ]

    const { data: polizas, error: pErr } = await supabase
        .from('polizas')
        .insert(polizasData)
        .select()

    if (pErr) console.error('Error inserting polizas:', pErr.message)
    else console.log(`✅ Seeded Poliza for ${CURRENT_YEAR}`)

    // 3. Create Facturas Primas (Global) for Current Year
    const facturasData = [
        {
            numero_factura: `FAC-${CURRENT_YEAR}-001`,
            plan: 'Vida',
            periodo_mes: 1, // Jan
            periodo_anio: CURRENT_YEAR,
            monto_total: 20000.00,
            fecha_emision: `${CURRENT_YEAR}-01-15`
        }
    ]
    const { error: fErr } = await supabase.from('facturas_primas').insert(facturasData)
    if (fErr) console.error('Error inserting facturas:', fErr.message)
    else console.log(`✅ Seeded Facturas for ${CURRENT_YEAR}`)

    // 4. Create Liquidated Siniestro for KPI
    // Needs to be approved and have payment
    if (polizas && polizas.length > 0) {
        const polizaId = polizas[0].id
        const siniestro = {
            numero_siniestro: `SIN-${CURRENT_YEAR}-001`,
            poliza_id: polizaId,
            cedula_fallecido: '0999999999',
            fecha_defuncion: `${CURRENT_YEAR}-01-10`,
            causa: 'Prueba KPI',
            estado: 'Aprobado',
            fecha_reporte: new Date().toISOString(),
            monto_pagado_seguro: 10000.00, // 50% of 20k premium -> 50% KPI
            fecha_liquidacion: new Date().toISOString(),
            es_extemporaneo: false
        }

        const { error: sErr } = await supabase.from('siniestros').insert([siniestro])
        if (sErr) console.error('Error inserting siniestro:', sErr.message)
        else console.log(`✅ Seeded Siniestro for KPI`)
    }

    console.log('🌱 Fix Complete.')
    process.exit(0)
}

seedCurrentYear()
