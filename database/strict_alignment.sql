-- =====================================================
-- MIGRACIÓN DE ALINEACIÓN ARQUITECTÓNICA (STRICT 3-TIER)
-- FECHA: Ene 2026
-- OBJETIVO: Sincronizar BD con Backend v2.0
-- =====================================================

-- 1. CONFIGURACIÓN DE COPAGOS (Obligatoria para reglas de negocio)
-- =====================================================
CREATE TABLE IF NOT EXISTS copagos_config (
    id SERIAL PRIMARY KEY,
    esquema VARCHAR(50) NOT NULL UNIQUE, -- Ej: '70/30'
    porcentaje_institucion DECIMAL(5,2) NOT NULL,
    porcentaje_empleado DECIMAL(5,2) NOT NULL,
    activo BOOLEAN DEFAULT true
);

-- Datos semilla seguros
INSERT INTO copagos_config (esquema, porcentaje_institucion, porcentaje_empleado)
VALUES 
    ('70/30', 70.00, 30.00),
    ('65/35', 65.00, 35.00),
    ('100/0', 100.00, 0.00),
    ('50/50', 50.00, 50.00)
ON CONFLICT (esquema) DO NOTHING;

-- 2. TABLA VIGENCIAS (Para control de periodos)
-- =====================================================
CREATE TABLE IF NOT EXISTS vigencias (
    id SERIAL PRIMARY KEY,
    anio INTEGER UNIQUE NOT NULL,
    estado VARCHAR(20) DEFAULT 'cerrado',
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL
);

-- 3. ACTUALIZACIÓN DE PÓLIZAS (Relación con Copagos)
-- =====================================================
-- Agregamos copago_id nullable primero
ALTER TABLE polizas 
ADD COLUMN IF NOT EXISTS copago_id INTEGER REFERENCES copagos_config(id),
ADD COLUMN IF NOT EXISTS vigencia_id INTEGER REFERENCES vigencias(id);

-- Asignar copago por defecto (100/0) a pólizas existentes para evitar NULLs
UPDATE polizas 
SET copago_id = (SELECT id FROM copagos_config WHERE esquema = '100/0')
WHERE copago_id IS NULL;

-- 4. ACTUALIZACIÓN DE PAGOS (Desglose de montos y reglas)
-- =====================================================
ALTER TABLE pagos
ADD COLUMN IF NOT EXISTS monto_empleado DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS monto_institucion DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS estado_temporalidad VARCHAR(20) DEFAULT 'ORDINARIO',
ADD COLUMN IF NOT EXISTS regla_copago VARCHAR(20);

-- DATA FIX: Actualizar pagos existentes para que cuadren (Asumir 100% empleado)
-- Esto evita el error de constraint check_montos_suma en datos legacy
UPDATE pagos 
SET monto_empleado = monto, 
    monto_institucion = 0,
    regla_copago = '100/0'
WHERE (monto_empleado = 0 AND monto_institucion = 0);

-- Constraints para asegurar integridad financiera
DO $$ BEGIN
    ALTER TABLE pagos ADD CONSTRAINT check_montos_suma 
    CHECK (ABS(monto - (monto_empleado + monto_institucion)) < 0.01);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 5. TABLA DOCUMENTOS (Para Siniestros)
-- =====================================================
CREATE TABLE IF NOT EXISTS documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    siniestro_id UUID NOT NULL REFERENCES siniestros(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    hash VARCHAR(64),
    estado_doc VARCHAR(20) DEFAULT 'Pendiente',
    creado_en TIMESTAMP DEFAULT NOW()
);

-- RLS para Documentos
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven sus documentos" ON documentos
FOR SELECT USING (
    siniestro_id IN (SELECT id FROM siniestros WHERE poliza_id IN (SELECT id FROM polizas WHERE usuario_id = auth.uid()))
);

CREATE POLICY "Usuarios suben documentos" ON documentos
FOR INSERT WITH CHECK (
    siniestro_id IN (SELECT id FROM siniestros WHERE poliza_id IN (SELECT id FROM polizas WHERE usuario_id = auth.uid()))
);
