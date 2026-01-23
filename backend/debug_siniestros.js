
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: './.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugSiniestros() {
    console.log('--- Debugging Siniestros Count ---');

    const { count, error } = await supabase
        .from('siniestros')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error counting siniestros:', error);
    } else {
        console.log(`Total Siniestros in DB: ${count}`);
    }
    console.log('-----------------------------');
}

debugSiniestros();
