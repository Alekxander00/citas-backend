-- Agregar domingo al enum usado por citas y disponibilidad.
ALTER TYPE "DiaSemana" ADD VALUE IF NOT EXISTS 'DOMINGO';

-- Permitir que cada especialidad defina el icono por nombre de react-icons/fa.
ALTER TABLE "especialidades"
ADD COLUMN IF NOT EXISTS "icono" TEXT NOT NULL DEFAULT 'FaStethoscope';

UPDATE "especialidades"
SET "icono" = CASE "codigo"
    WHEN 1 THEN 'FaUserMd'
    WHEN 2 THEN 'FaBaby'
    WHEN 3 THEN 'FaVenus'
    WHEN 4 THEN 'FaHeartbeat'
    WHEN 5 THEN 'FaStethoscope'
    WHEN 6 THEN 'FaBone'
    WHEN 7 THEN 'FaEye'
    WHEN 8 THEN 'FaTooth'
    WHEN 9 THEN 'FaBrain'
    WHEN 10 THEN 'FaAppleAlt'
    ELSE "icono"
END;

-- Registrar el motivo de consulta en cada solicitud de cita.
ALTER TABLE "citas"
ADD COLUMN IF NOT EXISTS "motivo_consulta" TEXT;

-- Tabla editable desde base de datos para habilitar o deshabilitar dias.
CREATE TABLE IF NOT EXISTS "dias_habiles" (
    "dia_semana" "DiaSemana" NOT NULL,
    "habilitado" BOOLEAN NOT NULL DEFAULT true,
    "mensaje_inhabil" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dias_habiles_pkey" PRIMARY KEY ("dia_semana")
);

INSERT INTO "dias_habiles" ("dia_semana", "habilitado", "mensaje_inhabil")
VALUES
    ('LUNES', true, NULL),
    ('MARTES', true, NULL),
    ('MIERCOLES', true, NULL),
    ('JUEVES', true, NULL),
    ('VIERNES', true, NULL),
    ('SABADO', true, NULL),
    ('DOMINGO', false, 'El modulo de citas no esta habilitado los domingos. Intente nuevamente en un dia habil.')
ON CONFLICT ("dia_semana") DO NOTHING;
