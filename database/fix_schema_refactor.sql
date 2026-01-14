-- Refactorización Tabla Siniestros (Consolidado Nancy-Only)
-- Idempotent script using IF EXISTS / IF NOT EXISTS where possible

BEGIN;

-- 1. Agregar tipo ENUM 'source' si no existe
DO $$ BEGIN
    CREATE TYPE source_enum AS ENUM ('web', 'email', 'manual');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Limpieza de Columnas Antiguas (80/20)
ALTER TABLE siniestros DROP COLUMN IF EXISTS monto_coaseguro_20 CASCADE;
ALTER TABLE siniestros DROP COLUMN IF EXISTS monto_cobertura_80 CASCADE;

-- 3. Nuevas Columnas (Autorización y Pago)
ALTER TABLE siniestros ADD COLUMN IF NOT EXISTS monto_autorizado DECIMAL(12,2) DEFAULT NULL;
ALTER TABLE siniestros ADD COLUMN IF NOT EXISTS monto_pagado DECIMAL(12,2) DEFAULT NULL;
ALTER TABLE siniestros ADD COLUMN IF NOT EXISTS source source_enum DEFAULT 'web';

-- 4. Constraints de Montos Positivos
ALTER TABLE siniestros DROP CONSTRAINT IF EXISTS check_monto_autorizado_positivo;
ALTER TABLE siniestros ADD CONSTRAINT check_monto_autorizado_positivo CHECK (monto_autorizado >= 0);

ALTER TABLE siniestros DROP CONSTRAINT IF EXISTS check_monto_pagado_positivo;
ALTER TABLE siniestros ADD CONSTRAINT check_monto_pagado_positivo CHECK (monto_pagado >= 0);

-- 5. Constraint UNIQUE para evitar duplicados (Cedula + Fecha Defunción)
ALTER TABLE siniestros DROP CONSTRAINT IF EXISTS unique_siniestro_evento;
ALTER TABLE siniestros ADD CONSTRAINT unique_siniestro_evento UNIQUE (cedula_fallecido, fecha_defuncion);

-- 6. Indices para Búsqueda
CREATE INDEX IF NOT EXISTS idx_siniestros_cedula_search ON siniestros(cedula_fallecido);
CREATE INDEX IF NOT EXISTS idx_siniestros_fecha_search ON siniestros(fecha_defuncion);
CREATE INDEX IF NOT EXISTS idx_siniestros_estado ON siniestros(estado);

-- 7. Verificar Columna 'causa' (Por si acaso)
ALTER TABLE siniestros ADD COLUMN IF NOT EXISTS causa VARCHAR(255);

COMMIT;
