
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUser() {
    // 1. Get user by email from Auth
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
        console.error('Auth Error:', authError)
        return
    }

    const targetEmail = 'villajean83@gmail.com'
    const user = users.find(u => u.email === targetEmail)

    if (!user) {
        console.log(`User ${targetEmail} not found in Auth!`)
        return
    }

    console.log(`User found in Auth: ${user.id}`)

    // 2. Check public.usuarios
    const { data: profile, error: profileError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single()

    if (profileError) {
        console.error('Profile Error (public.usuarios):', profileError)
    } else {
        console.log('Profile found:', profile)
    }
}

checkUser()
