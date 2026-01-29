import supabase from '../src/config/supabase.config.js'
// Use native crypto for UUIDs
const genUUID = () => crypto.randomUUID()

async function seed() {
    console.log('🌱 Starting Seed...')

    // 1. Get existing users (to assign policies to)
    const { data: users, error: uErr } = await supabase.from('usuarios').select('id, cedula, nombres, apellidos').limit(5)

    if (!users || users.length === 0) {
        console.error('❌ No users found. Please register at least one user via frontend first.')
        return
    }

    console.log(`found ${users.length} users to seed.`)
    const user = users[0] // Pick the first one for most data

    // 2. Create Polizas based on PDF Types
    const polizasData = [
        {
            numero_poliza: `POL-VIDA-${Date.now()}-1`,
            usuario_id: user.id,
            tipo_poliza_id: null, // Assuming we fetch or use raw ID
            fecha_inicio: '2025-01-01',
            fecha_fin: '2025-12-31',
            estado: 'Activa',
            prima_mensual: 25.50,
            cobertura_monto: 50000,
            beneficiarios: { "nombre": "Hijo Test", "parentesco": "Hijo" },
            copagos_config: { "esquema": "70/30", "porcentaje_usuario": 0.3 }
        },
        {
            numero_poliza: `POL-ACC-${Date.now()}-2`,
            usuario_id: user.id,
            tipo_poliza_id: null,
            fecha_inicio: '2025-01-01',
            fecha_fin: '2025-12-31',
            estado: 'Activa',
            prima_mensual: 12.00,
            cobertura_monto: 10000,
            beneficiarios: { "nombre": "Esposa Test", "parentesco": "Cónyuge" },
            copagos_config: { "esquema": "100/0", "porcentaje_usuario": 1.0 }
        }
    ]

    // Upsert Polizas
    const { data: polizas, error: pErr } = await supabase
        .from('polizas')
        .insert(polizasData)
        .select()

    if (pErr) console.error('Error inserting polizas:', pErr.message)
    else console.log(`✅ Seeded ${polizas.length} polizas.`)

    const poliza = polizas ? polizas[0] : null

    // 3. Create Siniestros
    if (poliza) {
        const siniestrosData = [
            {
                numero_siniestro: `SIN-2025-001`,
                poliza_id: poliza.id,
                cedula_fallecido: '1105872202',
                fecha_defuncion: '2025-06-15',
                causa: 'Infarto',
                descripcion: 'Muerte natural repentina',
                estado: 'Aprobado',
                fecha_reporte: new Date().toISOString(),
                monto_pagado_seguro: 25000.00, // Liquidated
                fecha_liquidacion: new Date().toISOString(),
                es_extemporaneo: false
            },
            {
                numero_siniestro: `SIN-2025-002`,
                poliza_id: poliza.id,
                cedula_fallecido: '1105872202',
                fecha_defuncion: '2025-07-20',
                causa: null, // Partial intake
                descripcion: 'Aviso inicial sin documentos',
                estado: 'Pendiente',
                fecha_reporte: new Date().toISOString(),
                es_extemporaneo: false
            }
        ]

        const { error: sErr } = await supabase.from('siniestros').insert(siniestrosData)
        if (sErr) console.error('Error inserting siniestros:', sErr.message)
        else console.log('✅ Seeded Siniestros.')
    }

    // 4. Create Facturas Primas (Global)
    const facturasData = [
        {
            numero_factura: 'FAC-2025-001',
            plan: 'Vida',
            periodo_mes: 1,
            periodo_anio: 2025,
            monto_total: 15000.00,
            fecha_emision: '2025-01-30'
        },
        {
            numero_factura: 'FAC-2025-002',
            plan: 'Vida',
            periodo_mes: 2,
            periodo_anio: 2025,
            monto_total: 15500.00,
            fecha_emision: '2025-02-28'
        }
    ]
    const { error: fErr } = await supabase.from('facturas_primas').insert(facturasData)
    if (fErr) console.error('Error inserting facturas:', fErr.message)
    else console.log('✅ Seeded Facturas Primas.')

    console.log('🌱 Seed Complete. Refresh Dashboard.')
    process.exit(0)
}

seed()
