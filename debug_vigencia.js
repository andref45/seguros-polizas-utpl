
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load env from backend/.env
dotenv.config({ path: './backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in backend/.env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVigencias() {
    console.log('--- Checking Vigencias ---');
    const { data, error } = await supabase
        .from('vigencias')
        .select('*');

    if (error) {
        console.error('Error fetching vigencias:', error);
    } else {
        console.table(data);
    }

    // Check query logic
    const today = new Date().toISOString().split('T')[0];
    console.log(`\n--- Testing findActive Query for today: ${today} ---`);

    const { data: active, error: activeError } = await supabase
        .from('vigencias')
        .select('*')
        .eq('estado', 'abierto')
        .lte('fecha_inicio', today)
        .gte('fecha_fin', today);

    if (activeError) {
        console.error('Error in findActive query:', activeError);
    } else {
        console.log('Active Vigencia found:', active);
    }
}

checkVigencias();
