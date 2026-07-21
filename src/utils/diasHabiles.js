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

const WEEKDAY_TO_DIA_SEMANA = {
  Monday: 'LUNES',
  Tuesday: 'MARTES',
  Wednesday: 'MIERCOLES',
  Thursday: 'JUEVES',
  Friday: 'VIERNES',
  Saturday: 'SABADO',
  Sunday: 'DOMINGO'
};

const DEFAULT_TIME_ZONE = process.env.APP_TIME_ZONE || 'America/Bogota';

function getDiaSemanaActual(fecha = new Date(), timeZone = DEFAULT_TIME_ZONE) {
  const weekday = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone
  }).format(fecha);

  return WEEKDAY_TO_DIA_SEMANA[weekday];
}

function getMensajeInhabil(diaSemana, mensajeInhabil) {
  return (
    mensajeInhabil ||
    `El modulo de citas no esta habilitado hoy ${DIA_LABELS[diaSemana]}. Intente nuevamente en un dia habil.`
  );
}

async function obtenerEstadoModuloCitas(prisma, fecha = new Date()) {
  const diaSemana = getDiaSemanaActual(fecha);

  const diaHabil = await prisma.diaHabil.findUnique({
    where: { dia_semana: diaSemana }
  });

  if (!diaHabil) {
    return {
      dia_semana: diaSemana,
      nombre_dia: DIA_LABELS[diaSemana],
      habilitado: false,
      mensaje: getMensajeInhabil(diaSemana)
    };
  }

  return {
    dia_semana: diaHabil.dia_semana,
    nombre_dia: DIA_LABELS[diaHabil.dia_semana],
    habilitado: diaHabil.habilitado,
    mensaje: diaHabil.habilitado
      ? 'El modulo de citas esta habilitado.'
      : getMensajeInhabil(diaHabil.dia_semana, diaHabil.mensaje_inhabil),
    updated_at: diaHabil.updated_at
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
  getDiaSemanaActual,
  obtenerEstadoModuloCitas,
  formatearDiaHabil
};
