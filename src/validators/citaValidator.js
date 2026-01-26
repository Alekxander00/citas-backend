const { body } = require('express-validator');

const citaValidator = [
  body('tipo_identificacion')
    .isIn([
      'CEDULA_CIUDADANIA',
      'CEDULA_EXTRANJERIA', 
      'CERTIFICADO_NACIDO_VIVO',
      'PERMISO_ESPECIAL_PERMANENCIA',
      'PERMISO_POR_PROTECCION_TEMPORAL',
      'REGISTRO_CIVIL',
      'TARJETA_IDENTIDAD'
    ])
    .withMessage('Tipo de identificación inválido'),

  body('numero_identificacion')
    .notEmpty().withMessage('El número de identificación es requerido')
    .matches(/^[0-9]+$/).withMessage('Solo se permiten números')
    .isLength({ min: 5, max: 20 }).withMessage('Debe tener entre 5 y 20 dígitos'),

  body('telefono')
    .notEmpty().withMessage('El teléfono es requerido')
    .matches(/^[0-9]+$/).withMessage('Solo se permiten números')
    .isLength({ min: 7, max: 15 }).withMessage('Debe tener entre 7 y 15 dígitos'),

  body('especialidad_codigo')
    .notEmpty().withMessage('La especialidad es requerida'),

  body('dia_semana')
    .isIn(['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'])
    .withMessage('Día de la semana inválido'),

  body('jornada')
    .isIn(['MANANA', 'TARDE'])
    .withMessage('Jornada inválida')
];

module.exports = citaValidator;