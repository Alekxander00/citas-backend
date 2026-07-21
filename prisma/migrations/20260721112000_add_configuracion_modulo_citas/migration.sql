CREATE TABLE IF NOT EXISTS "configuracion_modulo_citas" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "mensaje_inactivo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "configuracion_modulo_citas_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "configuracion_modulo_citas_singleton_check" CHECK ("id" = 1)
);

INSERT INTO "configuracion_modulo_citas" ("id", "activo", "mensaje_inactivo")
VALUES (
    1,
    true,
    'El modulo de citas no esta disponible en este momento. Intente nuevamente mas tarde.'
)
ON CONFLICT ("id") DO NOTHING;
