const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const router = express.Router();
const prisma = new PrismaClient();

// Configurar multer para manejar archivos en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024 // 15 MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'), false);
    }
  }
});

// Validaciones
const validarCita = [
  body('tipo_identificacion').isIn([
    'CEDULA_CIUDADANIA',
    'CEDULA_EXTRANJERIA',
    'CERTIFICADO_NACIDO_VIVO',
    'PERMISO_ESPECIAL_PERMANENCIA',
    'PERMISO_POR_PROTECCION_TEMPORAL',
    'REGISTRO_CIVIL',
    'TARJETA_IDENTIDAD'
  ]).withMessage('Tipo de identificación inválido'),
  
  body('numero_identificacion')
    .notEmpty().withMessage('El número de identificación es requerido')
    .matches(/^\d+$/).withMessage('Solo se permiten números')
    .isLength({ min: 5, max: 20 }).withMessage('Debe tener entre 5 y 20 dígitos'),
    
  body('telefono')
    .notEmpty().withMessage('El teléfono es requerido')
    .matches(/^\d+$/).withMessage('Solo se permiten números')
    .isLength({ min: 7, max: 15 }).withMessage('Debe tener entre 7 y 15 dígitos'),
    
  body('especialidad_codigo')
    .notEmpty().withMessage('La especialidad es requerida')
    .isInt().withMessage('Código de especialidad inválido'),
    
  body('dia_semana')
    .isIn(['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'])
    .withMessage('Día de la semana inválido'),
    
  body('jornada')
    .isIn(['MANANA', 'TARDE'])
    .withMessage('Jornada inválida')
];

// Crear nueva cita
router.post('/', upload.single('orden_pdf'), validarCita, async (req, res) => {
  try {
    // Validar errores
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Errores de validación',
        details: errors.array() 
      });
    }
    
    // Validar archivo si es proporcionado
    let pdfBuffer = Buffer.alloc(0);
    if (req.file) {
      if (req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ 
          error: 'Solo se permiten archivos PDF' 
        });
      }
      pdfBuffer = req.file.buffer;
    }
    
    // Verificar que la especialidad existe
    const especialidad = await prisma.especialidad.findUnique({
      where: { codigo: parseInt(req.body.especialidad_codigo) }
    });
    
    if (!especialidad) {
      return res.status(400).json({ 
        error: 'La especialidad seleccionada no existe' 
      });
    }
    
    // Crear la cita
    const cita = await prisma.cita.create({
      data: {
        tipo_identificacion: req.body.tipo_identificacion,
        numero_identificacion: req.body.numero_identificacion,
        telefono: req.body.telefono,
        especialidad_codigo: parseInt(req.body.especialidad_codigo),
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
        dia_semana: true,
        jornada: true,
        created_at: true
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Su solicitud de cita ha sido registrada correctamente. En los próximos días será contactado telefónicamente para confirmar la fecha y hora exactas de su cita.',
      data: {
        codigo_cita: cita.codigo_cita,
        tipo_identificacion: cita.tipo_identificacion,
        numero_identificacion: cita.numero_identificacion,
        telefono: cita.telefono,
        especialidad_codigo: cita.especialidad_codigo,
        dia_semana: cita.dia_semana,
        jornada: cita.jornada,
        fecha_solicitud: cita.created_at
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

// Descargar PDF de una cita
router.get('/:codigo_cita/orden', async (req, res) => {
  try {
    const { codigo_cita } = req.params;
    
    const cita = await prisma.cita.findUnique({
      where: { codigo_cita },
      select: { orden_pdf: true }
    });
    
    if (!cita || !cita.orden_pdf || cita.orden_pdf.length === 0) {
      return res.status(404).json({ 
        error: 'Cita no encontrada o fue agendada sin adjuntar una orden médica en PDF' 
      });
    }
    
    // Configurar headers para descarga
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