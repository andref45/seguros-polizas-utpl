-- =====================================================
-- SPRINT 1 SCHEMA UPDATE
-- =====================================================

-- 1. Nuevas Tablas
-- =====================================================

CREATE TABLE IF NOT EXISTS vigencias (
    id SERIAL PRIMARY KEY,
    anio INTEGER UNIQUE NOT NULL,
    estado VARCHAR(20) DEFAULT 'cerrado' CHECK (estado IN ('abierto', 'cerrado')),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    siniestro_id UUID NOT NULL REFERENCES siniestros(id) ON DELETE RESTRICT,
    tipo VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    hash VARCHAR(64) NOT NULL, -- SHA-256
    estado_doc VARCHAR(20) DEFAULT 'Pendiente' CHECK (estado_doc IN ('Pendiente', 'Observado', 'Validado')),
    version INTEGER DEFAULT 1,
    creado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS copagos_config (
    id SERIAL PRIMARY KEY,
    esquema VARCHAR(50) NOT NULL, -- '70/30', '65/35'
    porcentaje_institucion DECIMAL(5,2) NOT NULL,
    porcentaje_asegurado DECIMAL(5,2) NOT NULL,
    vigente_desde TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS copagos_tabla (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    periodo VARCHAR(7) NOT NULL, -- 'YYYY-MM'
    empleado_id UUID NOT NULL REFERENCES usuarios(id),
    monto_asegurado DECIMAL(10,2) NOT NULL,
    monto_institucion DECIMAL(10,2) NOT NULL,
    generado_el TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sesiones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id),
    token TEXT NOT NULL,
    estado VARCHAR(20) DEFAULT 'activo',
    creado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auditorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES auth.users(id),
    entidad VARCHAR(50) NOT NULL,
    entidad_id UUID NOT NULL,
    accion VARCHAR(50) NOT NULL,
    detalle JSONB,
    creado_en TIMESTAMP DEFAULT NOW()
);

-- 2. Modificaciones a Tablas Existentes
-- =====================================================

-- Actualizar Siniestros
ALTER TABLE siniestros 
    ADD COLUMN IF NOT EXISTS cedula_fallecido VARCHAR(10), 
    ADD COLUMN IF NOT EXISTS fecha_defuncion DATE,
    ADD COLUMN IF NOT EXISTS causa VARCHAR(100);

-- Constraints Siniestros
ALTER TABLE siniestros DROP CONSTRAINT IF EXISTS siniestros_estado_check;
ALTER TABLE siniestros ADD CONSTRAINT siniestros_estado_check 
    CHECK (estado IN ('Reportado', 'En_tramite', 'Pagado'));

ALTER TABLE siniestros DROP CONSTRAINT IF EXISTS unique_siniestro_caso;
ALTER TABLE siniestros ADD CONSTRAINT unique_siniestro_caso 
    UNIQUE (cedula_fallecido, fecha_defuncion);

-- Indices
CREATE INDEX IF NOT EXISTS idx_siniestros_cedula_fallecido ON siniestros(cedula_fallecido);
CREATE INDEX IF NOT EXISTS idx_siniestros_created_at ON siniestros(fecha_reporte);

-- 3. Funciones y Triggers
-- =====================================================

CREATE OR REPLACE FUNCTION auditar_accion()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO auditorias (actor_id, entidad, entidad_id, accion, detalle)
    VALUES (
        auth.uid(),
        TG_TABLE_NAME,
        NEW.id,
        TG_OP,
        row_to_json(NEW)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para Siniestros
DROP TRIGGER IF EXISTS trigger_auditoria_siniestros ON siniestros;
CREATE TRIGGER trigger_auditoria_siniestros
    AFTER INSERT OR UPDATE ON siniestros
    FOR EACH ROW EXECUTE FUNCTION auditar_accion();

-- 4. Seed Data (Admin)
-- =====================================================
-- Nota: La inserción de seed data para auth.users usualmente se hace via API o dashboard
-- aquí solo estructuras.

-- 5. Storage Policies (Comentarios)
-- =====================================================
-- Crear bucket 'pdf-evidencias'
-- Policy: INSERT permitido para authenticated
-- Policy: SELECT permitido para authenticated
-- Validar MIME type en application logic o Storage Rules
