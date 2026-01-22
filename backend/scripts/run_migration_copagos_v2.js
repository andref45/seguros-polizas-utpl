
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Manually defining dirname logic for ES modules
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const sql = `
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'copagos_config' AND column_name = 'porcentaje_usuario') THEN
        ALTER TABLE copagos_config ADD COLUMN porcentaje_usuario NUMERIC(5,2) DEFAULT 0.30;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'copagos_config' AND column_name = 'porcentaje_institucion') THEN
        ALTER TABLE copagos_config ADD COLUMN porcentaje_institucion NUMERIC(5,2) DEFAULT 0.70;
    END IF;
END $$;

UPDATE copagos_config SET porcentaje_usuario = 0.30, porcentaje_institucion = 0.70 WHERE esquema = '70/30' OR descripcion = '70/30';
UPDATE copagos_config SET porcentaje_usuario = 0.35, porcentaje_institucion = 0.65 WHERE esquema = '65/35' OR descripcion = '65/35';
`

async function runSql() {
    console.log("Running SQL migration...")
    // Try to use a common RPC name if one exists, otherwise we might be stuck without direct SQL access
    // Usually 'exec' or 'exec_sql' or 'query'
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
        console.error("RPC exec_sql failed:", error.message)
        console.log("Trying alternative: If you don't have an RPC for SQL, please run this manually in TablePlus or Supabase Dashboard:")
        console.log(sql)
    } else {
        console.log("Migration successful!")
    }
}

runSql()
