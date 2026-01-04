-- =====================================================
-- SISTEMA DE GESTIÓN DE PÓLIZAS DE SEGUROS - UTPL
-- Script de Creación de Base de Datos
-- VERSIÓN: Supabase Auth (SIN JWT personalizado)
-- Fecha: Diciembre 2025
-- =====================================================

-- Eliminar tablas si existen (solo para desarrollo)
DROP TABLE IF EXISTS siniestros CASCADE;
DROP TABLE IF EXISTS pagos CASCADE;
DROP TABLE IF EXISTS beneficiarios CASCADE;
DROP TABLE IF EXISTS polizas CASCADE;
DROP TABLE IF EXISTS tipos_poliza CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- =====================================================
-- TABLA: usuarios
-- Descripción: Datos extendidos de usuarios (auth.users lo maneja Supabase)
-- Relación: user_id → auth.users.id
-- =====================================================
CREATE TABLE usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    cedula VARCHAR(10) UNIQUE NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    telefono VARCHAR(15),
    tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('empleado', 'estudiante')),
    fecha_nacimiento DATE NOT NULL,
    direccion TEXT,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
    fecha_registro TIMESTAMP DEFAULT NOW(),
    ultima_actualizacion TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE usuarios IS 'Datos extendidos de usuarios. Email y password se manejan en auth.users';
COMMENT ON COLUMN usuarios.id IS 'Referencia a auth.users.id de Supabase Auth';

-- =====================================================
-- TABLA: tipos_poliza
-- Descripción: Catálogo de tipos de pólizas disponibles
-- =====================================================
CREATE TABLE tipos_poliza (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    cobertura_maxima DECIMAL(12, 2) NOT NULL,
    prima_mensual DECIMAL(10, 2) NOT NULL,
    porcentaje_coaseguro DECIMAL(5, 2) DEFAULT 20.00,
    deducible DECIMAL(10, 2) DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
    fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABLA: polizas
-- Descripción: Pólizas contratadas por usuarios
-- =====================================================
CREATE TABLE polizas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_poliza VARCHAR(20) UNIQUE NOT NULL,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo_poliza_id INTEGER NOT NULL REFERENCES tipos_poliza(id),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'activa' CHECK (estado IN ('activa', 'vencida', 'cancelada', 'suspendida')),
    prima_mensual DECIMAL(10, 2) NOT NULL,
    cobertura_total DECIMAL(12, 2) NOT NULL,
    fecha_contratacion TIMESTAMP DEFAULT NOW(),
    ultima_actualizacion TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_fechas CHECK (fecha_fin > fecha_inicio)
);

-- =====================================================
-- TABLA: pagos
-- Descripción: Registro de pagos mensuales de pólizas
-- =====================================================
CREATE TABLE pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poliza_id UUID NOT NULL REFERENCES polizas(id) ON DELETE CASCADE,
    monto DECIMAL(10, 2) NOT NULL,
    fecha_pago TIMESTAMP DEFAULT NOW(),
    fecha_vencimiento DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado', 'vencido', 'parcial')),
    metodo_pago VARCHAR(50),
    referencia_pago VARCHAR(100),
    mes_periodo INTEGER NOT NULL CHECK (mes_periodo BETWEEN 1 AND 12),
    anio_periodo INTEGER NOT NULL,
    fecha_registro TIMESTAMP DEFAULT NOW(),
    UNIQUE(poliza_id, mes_periodo, anio_periodo)
);

-- =====================================================
-- TABLA: beneficiarios
-- Descripción: Beneficiarios designados en cada póliza
-- =====================================================
CREATE TABLE beneficiarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poliza_id UUID NOT NULL REFERENCES polizas(id) ON DELETE CASCADE,
    cedula VARCHAR(10) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    parentesco VARCHAR(50) NOT NULL,
    porcentaje_beneficio DECIMAL(5, 2) NOT NULL CHECK (porcentaje_beneficio > 0 AND porcentaje_beneficio <= 100),
    telefono VARCHAR(15),
    email VARCHAR(100),
    fecha_registro TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABLA: siniestros
-- Descripción: Reportes de siniestros/reclamaciones
-- =====================================================
CREATE TABLE siniestros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_siniestro VARCHAR(20) UNIQUE NOT NULL,
    poliza_id UUID NOT NULL REFERENCES polizas(id) ON DELETE CASCADE,
    fecha_siniestro DATE NOT NULL,
    descripcion TEXT NOT NULL,
    monto_reclamado DECIMAL(12, 2) NOT NULL,
    monto_coaseguro DECIMAL(12, 2),
    monto_aprobado DECIMAL(12, 2),
    estado VARCHAR(20) DEFAULT 'reportado' CHECK (estado IN ('reportado', 'en_revision', 'aprobado', 'rechazado', 'pagado')),
    evidencia_url TEXT,
    observaciones TEXT,
    fecha_reporte TIMESTAMP DEFAULT NOW(),
    fecha_resolucion TIMESTAMP,
    ultima_actualizacion TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES para optimizar consultas
-- =====================================================
CREATE INDEX idx_usuarios_cedula ON usuarios(cedula);
CREATE INDEX idx_usuarios_tipo ON usuarios(tipo_usuario);
CREATE INDEX idx_polizas_usuario ON polizas(usuario_id);
CREATE INDEX idx_polizas_estado ON polizas(estado);
CREATE INDEX idx_polizas_numero ON polizas(numero_poliza);
CREATE INDEX idx_pagos_poliza ON pagos(poliza_id);
CREATE INDEX idx_pagos_estado ON pagos(estado);
CREATE INDEX idx_siniestros_poliza ON siniestros(poliza_id);
CREATE INDEX idx_siniestros_estado ON siniestros(estado);

-- =====================================================
-- FUNCIÓN: Actualizar timestamp de última actualización
-- =====================================================
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ultima_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_usuarios_timestamp
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_polizas_timestamp
    BEFORE UPDATE ON polizas
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_siniestros_timestamp
    BEFORE UPDATE ON siniestros
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp();

-- =====================================================
-- FUNCIÓN: Generar número de póliza automático
-- =====================================================
CREATE OR REPLACE FUNCTION generar_numero_poliza()
RETURNS TRIGGER AS $$
BEGIN
    NEW.numero_poliza = 'POL-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('seq_poliza')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE seq_poliza START 1;

CREATE TRIGGER trigger_generar_numero_poliza
    BEFORE INSERT ON polizas
    FOR EACH ROW
    WHEN (NEW.numero_poliza IS NULL)
    EXECUTE FUNCTION generar_numero_poliza();

-- =====================================================
-- FUNCIÓN: Generar número de siniestro automático
-- =====================================================
CREATE OR REPLACE FUNCTION generar_numero_siniestro()
RETURNS TRIGGER AS $$
BEGIN
    NEW.numero_siniestro = 'SIN-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('seq_siniestro')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE seq_siniestro START 1;

CREATE TRIGGER trigger_generar_numero_siniestro
    BEFORE INSERT ON siniestros
    FOR EACH ROW
    WHEN (NEW.numero_siniestro IS NULL)
    EXECUTE FUNCTION generar_numero_siniestro();

-- =====================================================
-- FUNCIÓN: Calcular monto de coaseguro
-- =====================================================
CREATE OR REPLACE FUNCTION calcular_coaseguro()
RETURNS TRIGGER AS $$
DECLARE
    porcentaje_coaseguro DECIMAL(5,2);
BEGIN
    SELECT tp.porcentaje_coaseguro INTO porcentaje_coaseguro
    FROM polizas p
    JOIN tipos_poliza tp ON p.tipo_poliza_id = tp.id
    WHERE p.id = NEW.poliza_id;
    
    NEW.monto_coaseguro = NEW.monto_reclamado * (porcentaje_coaseguro / 100);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calcular_coaseguro
    BEFORE INSERT OR UPDATE ON siniestros
    FOR EACH ROW
    EXECUTE FUNCTION calcular_coaseguro();

-- =====================================================
-- DATOS DE PRUEBA: Tipos de Póliza
-- =====================================================
INSERT INTO tipos_poliza (nombre, descripcion, cobertura_maxima, prima_mensual, porcentaje_coaseguro, deducible) VALUES
('Básica', 'Cobertura básica para empleados y estudiantes', 50000.00, 25.00, 20.00, 100.00),
('Intermedia', 'Cobertura intermedia con mayores beneficios', 100000.00, 45.00, 15.00, 150.00),
('Premium', 'Cobertura completa con beneficios extendidos', 200000.00, 75.00, 10.00, 200.00),
('Familiar', 'Cobertura para grupo familiar', 150000.00, 90.00, 15.00, 250.00);

-- =====================================================
-- POLÍTICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS)
-- Con Supabase Auth
-- =====================================================

-- Habilitar RLS en tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE polizas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE siniestros ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiarios ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS PARA usuarios
-- =====================================================

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Usuarios pueden ver su propio perfil"
ON usuarios FOR SELECT
USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Usuarios pueden actualizar su propio perfil"
ON usuarios FOR UPDATE
USING (auth.uid() = id);

-- Los usuarios pueden insertar su propio perfil (al registrarse)
CREATE POLICY "Usuarios pueden crear su propio perfil"
ON usuarios FOR INSERT
WITH CHECK (auth.uid() = id);

-- =====================================================
-- POLÍTICAS PARA polizas
-- =====================================================

-- Los usuarios pueden ver sus propias pólizas
CREATE POLICY "Usuarios pueden ver sus propias pólizas"
ON polizas FOR SELECT
USING (usuario_id = auth.uid());

-- Los usuarios pueden crear pólizas para sí mismos
CREATE POLICY "Usuarios pueden crear sus propias pólizas"
ON polizas FOR INSERT
WITH CHECK (usuario_id = auth.uid());

-- Los usuarios pueden actualizar sus propias pólizas
CREATE POLICY "Usuarios pueden actualizar sus propias pólizas"
ON polizas FOR UPDATE
USING (usuario_id = auth.uid());

-- =====================================================
-- POLÍTICAS PARA pagos
-- =====================================================

-- Los usuarios pueden ver pagos de sus pólizas
CREATE POLICY "Usuarios pueden ver sus propios pagos"
ON pagos FOR SELECT
USING (
    poliza_id IN (
        SELECT id FROM polizas WHERE usuario_id = auth.uid()
    )
);

-- Los usuarios pueden crear pagos para sus pólizas
CREATE POLICY "Usuarios pueden crear pagos para sus pólizas"
ON pagos FOR INSERT
WITH CHECK (
    poliza_id IN (
        SELECT id FROM polizas WHERE usuario_id = auth.uid()
    )
);

-- =====================================================
-- POLÍTICAS PARA siniestros
-- =====================================================

-- Los usuarios pueden ver siniestros de sus pólizas
CREATE POLICY "Usuarios pueden ver sus propios siniestros"
ON siniestros FOR SELECT
USING (
    poliza_id IN (
        SELECT id FROM polizas WHERE usuario_id = auth.uid()
    )
);

-- Los usuarios pueden crear siniestros para sus pólizas
CREATE POLICY "Usuarios pueden crear siniestros para sus pólizas"
ON siniestros FOR INSERT
WITH CHECK (
    poliza_id IN (
        SELECT id FROM polizas WHERE usuario_id = auth.uid()
    )
);

-- =====================================================
-- POLÍTICAS PARA beneficiarios
-- =====================================================

-- Los usuarios pueden ver beneficiarios de sus pólizas
CREATE POLICY "Usuarios pueden ver beneficiarios de sus pólizas"
ON beneficiarios FOR SELECT
USING (
    poliza_id IN (
        SELECT id FROM polizas WHERE usuario_id = auth.uid()
    )
);

-- Los usuarios pueden crear beneficiarios para sus pólizas
CREATE POLICY "Usuarios pueden crear beneficiarios para sus pólizas"
ON beneficiarios FOR INSERT
WITH CHECK (
    poliza_id IN (
        SELECT id FROM polizas WHERE usuario_id = auth.uid()
    )
);

-- =====================================================
-- POLÍTICA PÚBLICA: tipos_poliza
-- Todos pueden ver los tipos de póliza disponibles
-- =====================================================

ALTER TABLE tipos_poliza ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver tipos de póliza"
ON tipos_poliza FOR SELECT
TO authenticated
USING (estado = 'activo');

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

-- Verificar creación de tablas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
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
