
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env') })

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

async function checkDocs() {
    console.log("Checking documentos columns...")
    const { data, error } = await supabase
        .from('documentos')
        .select('*')
        .limit(1)

    if (error) {
        console.error('Error fetching documentos:', error)
        return
    }

    if (data && data.length > 0) {
        console.log('Columns found:', Object.keys(data[0]).join(', '))
    } else {
        console.log('Documentos table empty.')
    }
}

checkDocs()
