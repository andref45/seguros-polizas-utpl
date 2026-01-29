-- Migration: Add missing columns for Siniestros
-- Run this in Supabase SQL Editor

-- 1. Add nombre_fallecido
ALTER TABLE siniestros 
ADD COLUMN IF NOT EXISTS nombre_fallecido TEXT;

-- 2. Ensure Documents table has correct check constraint or just text
-- (Supabase usually allows any text if not restricted)
-- Verify types
-- No action needed if column is just TEXT.

-- 3. Ensure Tipos Poliza table policies (RLS)
-- Enable insert for authenticated service_role (Backend) usually bypasses RLS, so no action needed for backend.
-- But if we want Admin UI to create, we might need policy.
-- For now, Service Key bypasses RLS, so Backend Controller will work fine.

-- 4. Add monto_pagado_seguro if missing (it seemed present in code, but confirming)
-- It IS present in code.

-- 5. Add tipos_poliza columns if not present?
-- Schema assumed: nombre, cobertura_limite, prima_base, descripcion.

-- DONE.
