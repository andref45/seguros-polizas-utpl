
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'copagos_config' AND column_name = 'porcentaje_usuario') THEN
        ALTER TABLE copagos_config ADD COLUMN porcentaje_usuario NUMERIC(5,2) DEFAULT 0.30;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'copagos_config' AND column_name = 'porcentaje_institucion') THEN
        ALTER TABLE copagos_config ADD COLUMN porcentaje_institucion NUMERIC(5,2) DEFAULT 0.70;
    END IF;
END $$;

-- Update existing rows based on description (one-time fix)
UPDATE copagos_config SET porcentaje_usuario = 0.30, porcentaje_institucion = 0.70 WHERE esquema = '70/30' OR descripcion = '70/30';
UPDATE copagos_config SET porcentaje_usuario = 0.35, porcentaje_institucion = 0.65 WHERE esquema = '65/35' OR descripcion = '65/35';
