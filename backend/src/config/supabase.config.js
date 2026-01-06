import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log(
  'SUPABASE_SERVICE_KEY:',
  process.env.SUPABASE_SERVICE_KEY ? '*** definida ***' : 'NO definida'
);

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('SUPABASE_URL y SUPABASE_SERVICE_KEY son requeridos en .env')
}

// Cliente con Service Role Key para operaciones de backend
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export default supabase

