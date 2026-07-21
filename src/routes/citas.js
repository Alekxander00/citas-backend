const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const { obtenerEstadoModuloCitas } = require('../utils/diasHabiles');

const router = express.Router();
const prisma = new PrismaClient();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'), false);
    }
  }
});

const validarCita = [
  body('tipo_identificacion').isIn([
    'CEDULA_CIUDADANIA',
    'CEDULA_EXTRANJERIA',
    'CERTIFICADO_NACIDO_VIVO',
    'PERMISO_ESPECIAL_PERMANENCIA',
    'PERMISO_POR_PROTECCION_TEMPORAL',
    'REGISTRO_CIVIL',
    'TARJETA_IDENTIDAD'
  ]).withMessage('Tipo de identificacion invalido'),

  body('numero_identificacion')
    .notEmpty().withMessage('El numero de identificacion es requerido')
    .matches(/^\d+$/).withMessage('Solo se permiten numeros')
    .isLength({ min: 5, max: 20 }).withMessage('Debe tener entre 5 y 20 digitos'),

  body('telefono')
    .notEmpty().withMessage('El telefono es requerido')
    .matches(/^\d+$/).withMessage('Solo se permiten numeros')
    .isLength({ min: 7, max: 15 }).withMessage('Debe tener entre 7 y 15 digitos'),

  body('especialidad_codigo')
    .notEmpty().withMessage('La especialidad es requerida')
    .isInt().withMessage('Codigo de especialidad invalido'),

  body('motivo_consulta')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 1000 }).withMessage('El motivo de la consulta debe tener maximo 1000 caracteres'),

  body('dia_semana')
    .isIn(['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'])
    .withMessage('Dia de la semana invalido'),

  body('jornada')
    .isIn(['MANANA', 'TARDE'])
    .withMessage('Jornada invalida')
];

router.post('/', upload.single('orden_pdf'), validarCita, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Errores de validacion',
        details: errors.array()
      });
    }

    const estadoModulo = await obtenerEstadoModuloCitas(prisma);

    if (!estadoModulo.habilitado) {
      return res.status(403).json({
        error: estadoModulo.mensaje,
        data: estadoModulo
      });
    }

    let pdfBuffer = Buffer.alloc(0);
    if (req.file) {
      if (req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({
          error: 'Solo se permiten archivos PDF'
        });
      }
      pdfBuffer = req.file.buffer;
    }

    const especialidad = await prisma.especialidad.findUnique({
      where: { codigo: parseInt(req.body.especialidad_codigo, 10) }
    });

    if (!especialidad) {
      return res.status(400).json({
        error: 'La especialidad seleccionada no existe'
      });
    }

    const diaHabil = await prisma.diaHabil.findUnique({
      where: { dia_semana: req.body.dia_semana }
    });

    if (!diaHabil || !diaHabil.habilitado) {
      return res.status(400).json({
        error: diaHabil?.mensaje_inhabil || 'El dia seleccionado no esta habilitado para citas'
      });
    }

    const cita = await prisma.cita.create({
      data: {
        tipo_identificacion: req.body.tipo_identificacion,
        numero_identificacion: req.body.numero_identificacion,
        telefono: req.body.telefono,
        especialidad_codigo: parseInt(req.body.especialidad_codigo, 10),
        motivo_consulta: req.body.motivo_consulta?.trim() || null,
        dia_semana: req.body.dia_semana,
        jornada: req.body.jornada,
        orden_pdf: pdfBuffer
      },
      select: {
        codigo_cita: true,
        tipo_identificacion: true,
        numero_identificacion: true,
        telefono: true,
        especialidad_codigo: true,
        motivo_consulta: true,
        dia_semana: true,
        jornada: true,
        created_at: true
      }
    });

    const fechaColombiaStr = cita.created_at
      ? new Date(cita.created_at).toLocaleString('es-CO', { timeZone: 'America/Bogota' })
      : null;

    res.status(201).json({
      success: true,
      message: 'Su solicitud de cita ha sido registrada correctamente. En los proximos dias sera contactado telefonicamente para confirmar la fecha y hora exactas de su cita.',
      data: {
        codigo_cita: cita.codigo_cita,
        tipo_identificacion: cita.tipo_identificacion,
        numero_identificacion: cita.numero_identificacion,
        telefono: cita.telefono,
        especialidad_codigo: cita.especialidad_codigo,
        motivo_consulta: cita.motivo_consulta,
        dia_semana: cita.dia_semana,
        jornada: cita.jornada,
        fecha_solicitud: cita.created_at,
        fecha_solicitud_colombia: fechaColombiaStr
      }
    });
  } catch (error) {
    console.error('Error creando cita:', error);
    res.status(500).json({
      error: 'Error interno del servidor al procesar la cita',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/:codigo_cita/orden', async (req, res) => {
  try {
    const { codigo_cita } = req.params;

    const cita = await prisma.cita.findUnique({
      where: { codigo_cita },
      select: { orden_pdf: true }
    });

    if (!cita || !cita.orden_pdf || cita.orden_pdf.length === 0) {
      return res.status(404).json({
        error: 'Cita no encontrada o fue agendada sin adjuntar una orden medica en PDF'
      });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="orden_cita_${codigo_cita}.pdf"`);
    res.setHeader('Content-Length', cita.orden_pdf.length);

    res.send(cita.orden_pdf);
  } catch (error) {
    console.error('Error descargando PDF:', error);
    res.status(500).json({
      error: 'Error al descargar el archivo PDF'
    });
  }
});

module.exports = router;
