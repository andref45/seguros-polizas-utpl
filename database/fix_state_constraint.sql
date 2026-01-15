-- FIX CONSTRAINT FOR SINIESTROS STATE
-- Run this in your Supabase SQL Editor

-- 1. Drop existing constraint (if any)
ALTER TABLE siniestros DROP CONSTRAINT IF EXISTS siniestros_estado_check;

-- 2. Add corrected constraint (Case Sensitive Match)
-- Code uses: 'Reportado', 'En_tramite', 'Pagado'
-- Adding 'Rechazado' for completeness
ALTER TABLE siniestros ADD CONSTRAINT siniestros_estado_check 
    CHECK (estado IN ('Reportado', 'En_tramite', 'Pagado', 'Rechazado'));

-- 3. Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload config';
