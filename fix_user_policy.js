
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: './backend/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function fixUserPolicy() {
    console.log('--- Fixing User Policy ---');

    // 1. Get first user
    const { data: users, error: userError } = await supabase
        .from('usuarios')
        .select('id, nombres, apellidos')
        .limit(1);

    if (userError || !users || users.length === 0) {
        console.error('No users found in public.usuarios. Please register/login first.', userError);
        return;
    }

    const user = users[0];
    console.log(`Found user: ${user.nombres} ${user.apellidos} (${user.id})`);

    // 2. Get Tipo Poliza
    const { data: tipo } = await supabase.from('tipos_poliza').select('id').eq('nombre', 'Premium').single();
    if (!tipo) { console.log("Tipo 'Premium' not found."); return; }

    // 3. Get Vigencia
    const { data: vigencia } = await supabase.from('vigencias').select('id').eq('anio', 2026).single();

    // 4. Get Copago Config
    const { data: copago } = await supabase.from('copagos_config').select('id').eq('descripcion', '70/30').single();

    // 5. Check if policy exists
    const { data: existing } = await supabase.from('polizas').select('*').eq('usuario_id', user.id);

    if (existing && existing.length > 0) {
        console.log('User already has policies:', existing.length);
    } else {
        console.log('Creating policy for user...');
        const { error: insertError } = await supabase.from('polizas').insert([{
            usuario_id: user.id,
            tipo_poliza_id: tipo.id,
            vigencia_id: vigencia?.id,
            copago_id: copago?.id,
            fecha_inicio: '2026-01-01',
            fecha_fin: '2026-12-31',
            prima_mensual: 75.00,
            cobertura_total: 200000.00,
            estado: 'activa'
        }]);

        if (insertError) console.error('Error creating policy:', insertError);
        else console.log('Policy created successfully.');
    }
}

fixUserPolicy();
