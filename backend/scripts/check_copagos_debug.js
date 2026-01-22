
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

async function checkCopagos() {
    console.log("Checking copagos_config columns...")
    const { data, error } = await supabase
        .from('copagos_config')
        .select('*')
        .limit(1)

    if (error) {
        console.error('Error fetching copagos_config:', error)
        return
    }

    if (data && data.length > 0) {
        console.log('Columns found:', Object.keys(data[0]).join(', '))
        console.log('Sample row:', data[0])
    } else {
        console.log('Table empty.')
    }
}

checkCopagos()
