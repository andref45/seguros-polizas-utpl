
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
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Mock userId from previous check (villajean83@gmail.com)
// from check_user_debug.js output (I need to find the ID from output or fetch it again)
// Since I couldn't read the full output, I'll fetch it again here.

async function testDAO() {
    console.log("Fetching user...")
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const user = users.find(u => u.email === 'villajean83@gmail.com')

    if (!user) {
        console.error("User not found")
        return
    }

    const userId = user.id
    console.log("User ID:", userId)

    // Simulate Controller logic
    const { data: usuario, error: userError } = await supabase
        .from('usuarios')
        .select('cedula')
        .eq('id', userId)
        .single()

    if (userError) {
        console.error("Error fetching user profile:", userError)
        return
    }
    console.log("User Profile:", usuario)

    // Simulate DAO logic
    console.log("Testing DAO query 1 (byOwner)...")
    const { data: byOwner, error: err1 } = await supabase
        .from('siniestros')
        .select('*, documentos(*), polizas!inner(*)')
        .eq('polizas.usuario_id', userId) // This assumes polizas has usuario_id

    if (err1) {
        console.error("DAO Error 1:", err1)
    } else {
        console.log("DAO Query 1 result count:", byOwner.length)
    }
}

testDAO()
