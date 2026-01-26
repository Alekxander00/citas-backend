// Tipos de identificación permitidos
const TIPOS_IDENTIFICACION = {
  CEDULA_CIUDADANIA: 'Cédula de Ciudadanía',
  CEDULA_EXTRANJERIA: 'Cédula de Extranjería',
  CERTIFICADO_NACIDO_VIVO: 'Certificado de Nacido Vivo',
  PERMISO_ESPECIAL_PERMANENCIA: 'Permiso Especial de Permanencia',
  PERMISO_POR_PROTECCION_TEMPORAL: 'Permiso por Protección Temporal',
  REGISTRO_CIVIL: 'Registro Civil',
  TARJETA_IDENTIDAD: 'Tarjeta de Identidad'
};

// Días de la semana
const DIAS_SEMANA = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sábado'
};

// Jornadas
const JORNADAS = {
  MANANA: 'Mañana',
  TARDE: 'Tarde'
};

// Configuración de archivos
const FILE_CONFIG = {
  MAX_FILE_SIZE: 15 * 1024 * 1024, // 15 MB en bytes
  ALLOWED_MIME_TYPES: ['application/pdf']
};

module.exports = {
  TIPOS_IDENTIFICACION,
  DIAS_SEMANA,
  JORNADAS,
  FILE_CONFIG
};