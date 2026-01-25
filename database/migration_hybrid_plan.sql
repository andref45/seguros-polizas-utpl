-- Migration: Hybrid Plan (PDF + Nancy Requirements)
-- Description: Updates siniestros table for flexible intake and reporting, creates facturas_primas for global reporting.

-- 1. DROP EXISTING CONSTRAINTS FIRST
-- We must drop the check constraint BEFORE updating data to new values ('Pendiente'), 
-- otherwise the old constraint (IN 'Reportado'...) will block the update.
ALTER TABLE siniestros DROP CONSTRAINT IF EXISTS siniestros_estado_check;

-- 2. Update 'siniestros' table structure
ALTER TABLE siniestros 
    ALTER COLUMN causa DROP NOT NULL; -- Allow partial intake

ALTER TABLE siniestros
    ADD COLUMN IF NOT EXISTS monto_pagado_seguro DECIMAL(12, 2), -- For liquidation reporting
    ADD COLUMN IF NOT EXISTS fecha_liquidacion TIMESTAMP,
    ADD COLUMN IF NOT EXISTS doc_liquidacion_url TEXT,
    ADD COLUMN IF NOT EXISTS es_extemporaneo BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS beneficiarios_info JSONB;

-- 3. Migrate existing data to permitted states (Pendiente, Aprobado, Rechazado)
-- Now we can safely update because the constraint is gone.

-- Map 'Reportado' and 'En_tramite' to 'Pendiente'
UPDATE siniestros SET estado = 'Pendiente' WHERE estado IN ('Reportado', 'En_tramite');

-- Map 'Pagado' to 'Aprobado' and ensure amount is migrated (if column existed or mapping logic applies)
-- Note: 'monto_pagado_seguro' is new, so we map 'monto_aprobado' to it if meaningful, or leave blank to be filled.
-- Assuming 'monto_aprobado' was the final amount in previous version.
UPDATE siniestros SET monto_pagado_seguro = monto_aprobado WHERE estado = 'Pagado' AND monto_pagado_seguro IS NULL;
UPDATE siniestros SET estado = 'Aprobado' WHERE estado = 'Pagado';

-- Default fallback for any other weird state
UPDATE siniestros SET estado = 'Pendiente' WHERE estado NOT IN ('Pendiente', 'Aprobado', 'Rechazado');

-- 4. Re-apply strict Constraint and Set Default
ALTER TABLE siniestros ADD CONSTRAINT siniestros_estado_check 
    CHECK (estado IN ('Pendiente', 'Aprobado', 'Rechazado'));

ALTER TABLE siniestros ALTER COLUMN estado SET DEFAULT 'Pendiente';


-- 5. Create 'facturas_primas' table (Admin-only for Global Reporting)
CREATE TABLE IF NOT EXISTS facturas_primas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_factura VARCHAR(50) NOT NULL UNIQUE,
    plan VARCHAR(50) NOT NULL, -- 'Vida', 'Accidentes', etc.
    periodo_mes INTEGER NOT NULL CHECK (periodo_mes BETWEEN 1 AND 12),
    periodo_anio INTEGER NOT NULL,
    monto_total DECIMAL(12, 2) NOT NULL,
    fecha_emision DATE NOT NULL,
    archivo_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. RLS Policies for new table
ALTER TABLE facturas_primas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read facturas" ON facturas_primas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert facturas" ON facturas_primas FOR INSERT TO authenticated WITH CHECK (true);
