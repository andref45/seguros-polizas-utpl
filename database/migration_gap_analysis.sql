-- =====================================================
-- MIGRATION: GAP ANALYSIS (Final with Guardrails)
-- Fecha: Enero 2026
-- Descripción: Ajustes para lógica financiera, copagos dinámicos y validaciones estrictas.
-- =====================================================

-- 1. Nueva tabla 'copagos_config' (Para evitar hardcoding)
-- =====================================================
CREATE TABLE IF NOT EXISTS copagos_config (
    id SERIAL PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL UNIQUE, -- Ej: '70/30', '65/35'
    porcentaje_empleado DECIMAL(5,2) NOT NULL,
    porcentaje_institucion DECIMAL(5,2) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- SEED DATA (Guardrails)
INSERT INTO copagos_config (descripcion, porcentaje_empleado, porcentaje_institucion)
VALUES 
    ('70/30', 30.00, 70.00),
    ('65/35', 35.00, 65.00),
    ('100/0', 0.00, 100.00), -- UTPL paga todo
    ('50/50', 50.00, 50.00)
ON CONFLICT (descripcion) DO NOTHING;

-- 2. Modificar tabla 'polizas'
-- =====================================================
-- FK a copagos_config en lugar de string check
ALTER TABLE polizas 
ADD COLUMN IF NOT EXISTS vigencia_id INTEGER REFERENCES vigencias(id),
ADD COLUMN IF NOT EXISTS copago_id INTEGER REFERENCES copagos_config(id);

-- Opcional: Migrar datos si existía tipo_copago como string (no aplica si es tabla nueva, pero por seguridad)
-- UPDATE polizas SET copago_id = (SELECT id FROM copagos_config WHERE descripcion = polizas.tipo_copago);

CREATE INDEX IF NOT EXISTS idx_polizas_vigencia ON polizas(vigencia_id);

-- 3. Modificar tabla 'pagos'
-- =====================================================
ALTER TABLE pagos
ADD COLUMN IF NOT EXISTS monto_empleado DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS monto_institucion DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS estado_temporalidad VARCHAR(20) DEFAULT 'ORDINARIO';

-- CONSTRAINT: Suma exacta
-- Nota: Usamos una función trigger o check si la DB lo permite. Postgres CHECK funciona bien.
ALTER TABLE pagos 
ADD CONSTRAINT check_montos_suma 
CHECK (ABS(monto - (monto_empleado + monto_institucion)) < 0.01);

-- CONSTRAINT: Temporalidad ENUM
ALTER TABLE pagos
ADD CONSTRAINT check_temporalidad_enum
CHECK (estado_temporalidad IN ('ORDINARIO', 'EXTEMPORANEO'));

COMMENT ON COLUMN pagos.monto IS 'Monto total del pago (suma de empleado + institución)';

-- 4. Modificar tabla 'siniestros' (Guardrail Operativo)
-- =====================================================
-- Evitar duplicados de la misma persona fallecida en la misma fecha
ALTER TABLE siniestros
ADD CONSTRAINT unique_siniestro_persona_fecha 
UNIQUE (cedula_fallecido, fecha_defuncion);

CREATE INDEX IF NOT EXISTS idx_siniestros_cedula ON siniestros(cedula_fallecido);

-- 5. Nueva tabla 'documentos_financieros'
-- =====================================================
CREATE TABLE IF NOT EXISTS documentos_financieros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pago_id UUID NOT NULL REFERENCES pagos(id) ON DELETE CASCADE,
    codigo_factura VARCHAR(50) NOT NULL,
    codigo_contable VARCHAR(50) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT NOW(),
    url_factura TEXT,
    creado_por UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_docs_financieros_pago ON documentos_financieros(pago_id);
CREATE INDEX IF NOT EXISTS idx_docs_financieros_factura ON documentos_financieros(codigo_factura);

-- RLS
ALTER TABLE documentos_financieros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven sus propios documentos financieros"
ON documentos_financieros FOR SELECT
USING (
    pago_id IN (
        SELECT id FROM pagos 
        WHERE poliza_id IN (SELECT id FROM polizas WHERE usuario_id = auth.uid())
    )
);
