
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
    console.log("Checking polizas columns...")
    const { data, error } = await supabase
        .from('polizas')
        .select('*')
        .limit(1)

    if (error) {
        console.error('Error fetching polizas:', error)
        return
    }

    if (data && data.length > 0) {
        const columns = Object.keys(data[0])
        console.log('Columns found:', columns.join(', '))

        if (columns.includes('usuario_id')) {
            console.log('✅ usuario_id exists')
        } else {
            console.log('❌ usuario_id MISSING!')
        }
    } else {
        console.log('Table empty. attempting to describe via RPC if available or fail safely.')
    }
}

checkSchema()
