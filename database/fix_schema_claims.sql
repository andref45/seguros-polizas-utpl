-- FIX SCHEMA FOR CLAIMS MODULE (v2 - Comprehensive)
-- Run this in your Supabase SQL Editor

-- 1. Add ALL potentially missing columns for Siniestros
DO $$
BEGIN
    -- Cédula Fallecido
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'siniestros' AND column_name = 'cedula_fallecido') THEN
        ALTER TABLE siniestros ADD COLUMN cedula_fallecido VARCHAR(255);
    END IF;

    -- Fecha Defunción
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'siniestros' AND column_name = 'fecha_defuncion') THEN
        ALTER TABLE siniestros ADD COLUMN fecha_defuncion DATE;
    END IF;

    -- Causa
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'siniestros' AND column_name = 'causa') THEN
        ALTER TABLE siniestros ADD COLUMN causa VARCHAR(255);
    END IF;

    -- Montos Financieros
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'siniestros' AND column_name = 'monto_coaseguro_20') THEN
        ALTER TABLE siniestros ADD COLUMN monto_coaseguro_20 DECIMAL(12, 2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'siniestros' AND column_name = 'monto_cobertura_80') THEN
        ALTER TABLE siniestros ADD COLUMN monto_cobertura_80 DECIMAL(12, 2) DEFAULT 0;
    END IF;

    -- Observaciones (Opcional pero útil)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'siniestros' AND column_name = 'observaciones') THEN
        ALTER TABLE siniestros ADD COLUMN observaciones TEXT;
    END IF;
END $$;

-- 2. Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload config';
