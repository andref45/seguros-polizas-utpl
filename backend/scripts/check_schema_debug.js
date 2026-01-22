
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
    // 1. Check polizas columns (simulated by selecting one row)
    const { data, error } = await supabase
        .from('polizas')
        .select('*')
        .limit(1)

    if (error) {
        console.error('Error fetching polizas:', error)
    } else {
        if (data.length > 0) {
            console.log('Polizas columns:', Object.keys(data[0]))
        } else {
            console.log('Polizas table is empty, cannot infer columns from data easily without admin API.')
            // Try inserting/selecting specific known columns to fail if wrong?
        }
    }
}

checkSchema()
