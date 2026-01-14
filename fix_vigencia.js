
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: './backend/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function fixVigencia() {
    console.log('--- Fixing Vigencia 2026 ---');

    // 1. Check if it exists to avoid duplicates (though constraint should handle it)
    const { data: existing } = await supabase
        .from('vigencias')
        .select('*')
        .eq('anio', 2026)
        .single();

    if (existing) {
        console.log('Vigencia 2026 already exists, updating to active...');
        const { error } = await supabase
            .from('vigencias')
            .update({ estado: 'abierto', fecha_inicio: '2026-01-01', fecha_fin: '2026-12-31' })
            .eq('id', existing.id);

        if (error) console.error('Update failed:', error);
        else console.log('Update success.');
    } else {
        console.log('Creating Vigencia 2026...');
        const { error } = await supabase
            .from('vigencias')
            .insert([{
                anio: 2026,
                estado: 'abierto',
                fecha_inicio: '2026-01-01',
                fecha_fin: '2026-12-31'
            }]);

        if (error) console.error('Insert failed:', error);
        else console.log('Insert success.');
    }
}

fixVigencia();
