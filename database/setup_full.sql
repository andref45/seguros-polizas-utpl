-- =====================================================
-- FULL DATABASE SETUP SCRIPT (Schema + Sprint 1 + Financial Rules)
-- Fecha: Enero 2026
-- Descripción: Script consolidado para inicializar la base de datos desde cero.
-- Inluye: Tablas base, auth integration, reglas financieras (Gap Analysis), y seed data.
-- =====================================================

-- 1. LIMPIEZA (Solo si necesario, cuidado en producción)
DROP TABLE IF EXISTS documentos_financieros CASCADE;
DROP TABLE IF EXISTS documentos CASCADE;
DROP TABLE IF EXISTS siniestros CASCADE;
DROP TABLE IF EXISTS pagos CASCADE;
DROP TABLE IF EXISTS beneficiarios CASCADE;
DROP TABLE IF EXISTS polizas CASCADE;
DROP TABLE IF EXISTS tipos_poliza CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS vigencias CASCADE;
DROP TABLE IF EXISTS copagos_config CASCADE;
DROP TABLE IF EXISTS auditorias CASCADE;

-- 2. TABLAS BASE
-- =====================================================

-- USUARIOS
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

-- VIGENCIAS (Fiscal Years)
CREATE TABLE vigencias (
    id SERIAL PRIMARY KEY,
    anio INTEGER UNIQUE NOT NULL,
    estado VARCHAR(20) DEFAULT 'cerrado' CHECK (estado IN ('abierto', 'cerrado')),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL
);

-- COPAGOS CONFIG (Reglas Financieras)
CREATE TABLE copagos_config (
    id SERIAL PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL UNIQUE, -- Ej: '70/30', '65/35'
    porcentaje_empleado DECIMAL(5,2) NOT NULL,
    porcentaje_institucion DECIMAL(5,2) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- TIPOS POLIZA
CREATE TABLE tipos_poliza (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    cobertura_maxima DECIMAL(12, 2) NOT NULL,
    prima_mensual DECIMAL(10, 2) NOT NULL,
    porcentaje_coaseguro DECIMAL(5, 2) DEFAULT 20.00,
    deducible DECIMAL(10, 2) DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- POLIZAS
CREATE TABLE polizas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_poliza VARCHAR(20) UNIQUE NOT NULL,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo_poliza_id INTEGER NOT NULL REFERENCES tipos_poliza(id),
    vigencia_id INTEGER REFERENCES vigencias(id),
    copago_id INTEGER REFERENCES copagos_config(id),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'activa' CHECK (estado IN ('activa', 'vencida', 'cancelada', 'suspendida')),
    prima_mensual DECIMAL(10, 2) NOT NULL,
    cobertura_total DECIMAL(12, 2) NOT NULL,
    fecha_contratacion TIMESTAMP DEFAULT NOW(),
    ultima_actualizacion TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_fechas CHECK (fecha_fin > fecha_inicio)
);

-- PAGOS
CREATE TABLE pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poliza_id UUID NOT NULL REFERENCES polizas(id) ON DELETE CASCADE,
    monto DECIMAL(10, 2) NOT NULL, -- Total
    monto_empleado DECIMAL(10, 2) DEFAULT 0,
    monto_institucion DECIMAL(10, 2) DEFAULT 0,
    estado_temporalidad VARCHAR(20) DEFAULT 'ORDINARIO' CHECK (estado_temporalidad IN ('ORDINARIO', 'EXTEMPORANEO')),
    fecha_pago TIMESTAMP DEFAULT NOW(),
    fecha_vencimiento DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado', 'vencido', 'parcial')),
    metodo_pago VARCHAR(50),
    referencia_pago VARCHAR(100),
    mes_periodo INTEGER NOT NULL CHECK (mes_periodo BETWEEN 1 AND 12),
    anio_periodo INTEGER NOT NULL,
    fecha_registro TIMESTAMP DEFAULT NOW(),
    UNIQUE(poliza_id, mes_periodo, anio_periodo),
    CONSTRAINT check_montos_suma CHECK (ABS(monto - (monto_empleado + monto_institucion)) < 0.01)
);

-- SINIESTROS
CREATE TABLE siniestros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_siniestro VARCHAR(20) UNIQUE NOT NULL,
    poliza_id UUID NOT NULL REFERENCES polizas(id) ON DELETE CASCADE,
    fecha_siniestro DATE NOT NULL,
    fecha_reporte TIMESTAMP DEFAULT NOW(),
    descripcion TEXT NOT NULL,
    monto_reclamado DECIMAL(12, 2) NOT NULL,
    monto_coaseguro DECIMAL(12, 2),
    monto_aprobado DECIMAL(12, 2),
    estado VARCHAR(20) DEFAULT 'Reportado' CHECK (estado IN ('Reportado', 'En_tramite', 'Pagado')),
    evidencia_url TEXT,
    cedula_fallecido VARCHAR(10),
    fecha_defuncion DATE,
    causa VARCHAR(100),
    observaciones TEXT,
    fecha_resolucion TIMESTAMP,
    CONSTRAINT unique_siniestro_persona_fecha UNIQUE (cedula_fallecido, fecha_defuncion)
);

-- DOCUMENTOS (Evidencias Siniestros)
CREATE TABLE documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    siniestro_id UUID NOT NULL REFERENCES siniestros(id) ON DELETE RESTRICT,
    tipo VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    hash VARCHAR(64) NOT NULL,
    estado_doc VARCHAR(20) DEFAULT 'Pendiente',
    version INTEGER DEFAULT 1,
    creado_en TIMESTAMP DEFAULT NOW()
);

-- DOCUMENTOS FINANCIEROS (Facturas Pagos)
CREATE TABLE documentos_financieros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pago_id UUID NOT NULL REFERENCES pagos(id) ON DELETE CASCADE,
    codigo_factura VARCHAR(50) NOT NULL,
    codigo_contable VARCHAR(50) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT NOW(),
    url_factura TEXT,
    creado_por UUID REFERENCES auth.users(id)
);

-- AUDITORIAS
CREATE TABLE auditorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES auth.users(id),
    entidad VARCHAR(50) NOT NULL,
    entidad_id UUID NOT NULL,
    accion VARCHAR(50) NOT NULL,
    detalle JSONB,
    creado_en TIMESTAMP DEFAULT NOW()
);

-- 3. FUNCIONES Y TRIGGERS (Automations)
-- =====================================================

-- Generar Numero Poliza
CREATE SEQUENCE IF NOT EXISTS seq_poliza START 1;
CREATE OR REPLACE FUNCTION generar_numero_poliza() RETURNS TRIGGER AS $$
BEGIN
    NEW.numero_poliza = 'POL-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('seq_poliza')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generar_numero_poliza
BEFORE INSERT ON polizas FOR EACH ROW WHEN (NEW.numero_poliza IS NULL)
EXECUTE FUNCTION generar_numero_poliza();

-- Generar Numero Siniestro
CREATE SEQUENCE IF NOT EXISTS seq_siniestro START 1;
CREATE OR REPLACE FUNCTION generar_numero_siniestro() RETURNS TRIGGER AS $$
BEGIN
    NEW.numero_siniestro = 'SIN-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('seq_siniestro')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generar_numero_siniestro
BEFORE INSERT ON siniestros FOR EACH ROW WHEN (NEW.numero_siniestro IS NULL)
EXECUTE FUNCTION generar_numero_siniestro();

-- Auditoría Automática
CREATE OR REPLACE FUNCTION auditar_accion() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO auditorias (actor_id, entidad, entidad_id, accion, detalle)
    VALUES (auth.uid(), TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_auditoria_siniestros
AFTER INSERT OR UPDATE ON siniestros FOR EACH ROW EXECUTE FUNCTION auditar_accion();

-- 4. SEED DATA (Datos Iniciales)
-- =====================================================

-- Copagos
INSERT INTO copagos_config (descripcion, porcentaje_empleado, porcentaje_institucion) VALUES 
('70/30', 30.00, 70.00),
('65/35', 35.00, 65.00),
('100/0', 0.00, 100.00),
('50/50', 50.00, 50.00)
ON CONFLICT (descripcion) DO NOTHING;

-- Tipos Póliza
INSERT INTO tipos_poliza (nombre, descripcion, cobertura_maxima, prima_mensual, porcentaje_coaseguro, deducible) VALUES
('Básica', 'Cobertura básica', 50000.00, 25.00, 20.00, 100.00),
('Premium', 'Cobertura completa', 200000.00, 75.00, 10.00, 200.00);

-- Vigencia Actual
INSERT INTO vigencias (anio, estado, fecha_inicio, fecha_fin) VALUES
(2026, 'abierto', '2026-01-01', '2026-12-31')
ON CONFLICT (anio) DO NOTHING;

-- 5. RLS (Seguridad)
-- =====================================================
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE polizas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE siniestros ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_financieros ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (Authenticated users can see their own data)
CREATE POLICY "Usuarios ven sus propios datos" ON usuarios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuarios ven sus polizas" ON polizas FOR SELECT USING (usuario_id = auth.uid());
CREATE POLICY "Usuarios ven sus siniestros" ON siniestros FOR SELECT USING (poliza_id IN (SELECT id FROM polizas WHERE usuario_id = auth.uid()));
CREATE POLICY "Usuarios insertan siniestros" ON siniestros FOR INSERT WITH CHECK (poliza_id IN (SELECT id FROM polizas WHERE usuario_id = auth.uid()));

