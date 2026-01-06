-- =====================================================
-- MIGRATION: GAP ANALYSIS (Propuesta B1 Alignment)
-- Fecha: Enero 2026
-- Descripción: Ajustes para lógica financiera, copagos y validaciones estrictas.
-- =====================================================

-- 1. Modificar tabla 'polizas'
-- =====================================================
-- Agregar relación con vigencias y definición de copago
ALTER TABLE polizas 
ADD COLUMN IF NOT EXISTS vigencia_id INTEGER REFERENCES vigencias(id),
ADD COLUMN IF NOT EXISTS tipo_copago VARCHAR(20) CHECK (tipo_copago IN ('70/30', '65/35', '100/0', '50/50'));

-- Crear índice para vigencia
CREATE INDEX IF NOT EXISTS idx_polizas_vigencia ON polizas(vigencia_id);

-- 2. Modificar tabla 'pagos'
-- =====================================================
-- Agregar desglose de montos y reglas financieras
ALTER TABLE pagos
ADD COLUMN IF NOT EXISTS monto_empleado DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS monto_institucion DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS regla_copago VARCHAR(20),
ADD COLUMN IF NOT EXISTS estado_temporalidad VARCHAR(20) DEFAULT 'ORDINARIO' CHECK (estado_temporalidad IN ('ORDINARIO', 'EXTEMPORANEO'));

-- Comentario: 'monto' original sigue siendo el total.
COMMENT ON COLUMN pagos.monto IS 'Monto total del pago (suma de empleado + institución)';
COMMENT ON COLUMN pagos.estado_temporalidad IS 'Indica si el pago fue realizado dentro de plazo (antes del 15) o fuera (EXTEMPORANEO)';

-- 3. Nueva tabla 'documentos_financieros'
-- =====================================================
-- Para vincular pagos con facturas y códigos contables (RN005)
CREATE TABLE IF NOT EXISTS documentos_financieros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pago_id UUID NOT NULL REFERENCES pagos(id) ON DELETE CASCADE,
    codigo_factura VARCHAR(50) NOT NULL,
    codigo_contable VARCHAR(50) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT NOW(),
    url_factura TEXT, -- Opcional: enlace al PDF de la factura
    creado_por UUID REFERENCES auth.users(id)
);

-- Índices para documentos financieros
CREATE INDEX IF NOT EXISTS idx_docs_financieros_pago ON documentos_financieros(pago_id);
CREATE INDEX IF NOT EXISTS idx_docs_financieros_factura ON documentos_financieros(codigo_factura);

-- 4. Actualizar Policies (RLS) para usuario financiero
-- =====================================================
-- Nota: Se asume que existe un rol o claim en auth.users, pero aquí definimos políticas genéricas
-- Permitir al rol 'financiero' (si se implementa vía RLS compleja) ver pagos y documentos.

-- Por ahora, aseguramos que RLS esté activo en la nueva tabla
ALTER TABLE documentos_financieros ENABLE ROW LEVEL SECURITY;

-- Política de lectura para usuarios propios (mismo que pagos)
CREATE POLICY "Usuarios ven sus propios documentos financieros"
ON documentos_financieros FOR SELECT
USING (
    pago_id IN (
        SELECT id FROM pagos 
        WHERE poliza_id IN (SELECT id FROM polizas WHERE usuario_id = auth.uid())
    )
);

-- =====================================================
-- FIN MIGRATION SCRIPT
-- =====================================================
