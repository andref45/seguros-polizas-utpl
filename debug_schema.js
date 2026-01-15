
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: './backend/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function checkSchema() {
    console.log('--- Checking Siniestros Table Schema ---');

    // Attempt to insert a dummy row to trigger an error that might reveal columns, 
    // or better, just select and check structure if possible with Supabase helpers or raw SQL if enabled.
    // Since we don't have direct SQL access easily without Rpc, let's try to inspect via an error or a limited select.

    // Strategy 1: Select one row and print keys
    const { data, error } = await supabase.from('siniestros').select('*').limit(1);

    if (error) {
        console.error('Error selecting:', error);
    } else if (data && data.length > 0) {
        console.log('Columns found in existing row:', Object.keys(data[0]));
        if (Object.keys(data[0]).includes('causa')) {
            console.log('SUCCESS: Column "causa" EXISTS.');
        } else {
            console.log('FAILURE: Column "causa" is MISSING.');
        }
    } else {
        console.log('Table is empty, cannot infer columns from data. Trying to insert to check schema error...');
        // Strategy 2: Try to insert with 'causa' and see if it fails specifically on that
        const { error: insertError } = await supabase.from('siniestros').insert([{
            // Minimal required fields to trigger schema validation
            poliza_id: '00000000-0000-0000-0000-000000000000', // Invalid UUID likely to fail FK, but schema check happens first usually?
            causa: 'Test'
        }]);

        console.log('Insert attempt error:', insertError);
    }
}

checkSchema();
