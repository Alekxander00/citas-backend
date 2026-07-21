const DIA_LABELS = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miercoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sabado',
  DOMINGO: 'Domingo'
};

const DIAS_ORDEN = [
  'LUNES',
  'MARTES',
  'MIERCOLES',
  'JUEVES',
  'VIERNES',
  'SABADO',
  'DOMINGO'
];

function getMensajeModuloInactivo(mensajeInactivo) {
  return (
    mensajeInactivo ||
    'El modulo de citas no esta disponible en este momento. Intente nuevamente mas tarde.'
  );
}

async function obtenerEstadoModuloCitas(prisma) {
  const configuracion = await prisma.configuracionModuloCitas.findUnique({
    where: { id: 1 }
  });

  if (!configuracion) {
    return {
      habilitado: true,
      mensaje: 'El modulo de citas esta habilitado.',
      updated_at: null
    };
  }

  return {
    habilitado: configuracion.activo,
    activo: configuracion.activo,
    mensaje: configuracion.activo
      ? 'El modulo de citas esta habilitado.'
      : getMensajeModuloInactivo(configuracion.mensaje_inactivo),
    updated_at: configuracion.updated_at
  };
}

function formatearDiaHabil(diaHabil) {
  return {
    dia_semana: diaHabil.dia_semana,
    nombre_dia: DIA_LABELS[diaHabil.dia_semana],
    habilitado: diaHabil.habilitado,
    mensaje_inhabil: diaHabil.mensaje_inhabil,
    updated_at: diaHabil.updated_at
  };
}

module.exports = {
  DIA_LABELS,
  DIAS_ORDEN,
  obtenerEstadoModuloCitas,
  formatearDiaHabil
};
