-- CreateEnum
CREATE TYPE "TipoIdentificacion" AS ENUM ('CEDULA_CIUDADANIA', 'CEDULA_EXTRANJERIA', 'CERTIFICADO_NACIDO_VIVO', 'PERMISO_ESPECIAL_PERMANENCIA', 'PERMISO_POR_PROTECCION_TEMPORAL', 'REGISTRO_CIVIL', 'TARJETA_IDENTIDAD');

-- CreateEnum
CREATE TYPE "DiaSemana" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO');

-- CreateEnum
CREATE TYPE "Jornada" AS ENUM ('MANANA', 'TARDE');

-- CreateTable
CREATE TABLE "especialidades" (
    "codigo" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "especialidades_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "citas" (
    "codigo_cita" UUID NOT NULL,
    "tipo_identificacion" "TipoIdentificacion" NOT NULL,
    "numero_identificacion" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "especialidad_codigo" INTEGER NOT NULL,
    "dia_semana" "DiaSemana" NOT NULL,
    "jornada" "Jornada" NOT NULL,
    "orden_pdf" BYTEA NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "citas_pkey" PRIMARY KEY ("codigo_cita")
);

-- CreateIndex
CREATE UNIQUE INDEX "especialidades_codigo_key" ON "especialidades"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "especialidades_nombre_key" ON "especialidades"("nombre");

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_especialidad_codigo_fkey" FOREIGN KEY ("especialidad_codigo") REFERENCES "especialidades"("codigo") ON DELETE CASCADE ON UPDATE CASCADE;
