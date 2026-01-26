const citaService = require('../services/citaService');
const { validationResult } = require('express-validator');

const citaController = {
  crearCita: async (req, res) => {
    try {
      // Validar errores de express-validator
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Errores de validación',
          detalles: errors.array()
        });
      }

      // Verificar que se subió un archivo
      if (!req.file) {
        return res.status(400).json({ 
          error: 'El archivo PDF de orden/autorización es obligatorio' 
        });
      }

      // Preparar datos de la cita
      const citaData = {
        tipo_identificacion: req.body.tipo_identificacion,
        numero_identificacion: req.body.numero_identificacion,
        telefono: req.body.telefono,
        especialidad_codigo: req.body.especialidad_codigo,
        dia_semana: req.body.dia_semana,
        jornada: req.body.jornada,
        orden_pdf: req.file.buffer // PDF en formato Buffer
      };

      // Crear la cita
      const nuevaCita = await citaService.crearCita(citaData);

      // Respuesta exitosa
      res.status(201).json({
        success: true,
        mensaje: 'Su solicitud de cita ha sido registrada correctamente. En los próximos días será contactado telefónicamente para confirmar la fecha y hora exactas de su cita.',
        codigo_cita: nuevaCita.codigo_cita,
        datos: {
          tipo_identificacion: nuevaCita.tipo_identificacion,
          numero_identificacion: nuevaCita.numero_identificacion,
          telefono: nuevaCita.telefono,
          especialidad: nuevaCita.especialidad_codigo,
          dia_semana: nuevaCita.dia_semana,
          jornada: nuevaCita.jornada,
          fecha_solicitud: nuevaCita.created_at
        }
      });

    } catch (error) {
      console.error('Error en crearCita:', error);
      
      // Manejar errores específicos
      if (error.message.includes('especialidad')) {
        return res.status(400).json({ 
          error: 'La especialidad seleccionada no existe' 
        });
      }

      res.status(500).json({ 
        error: 'Error interno del servidor al procesar la cita',
        detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  descargarOrden: async (req, res) => {
    try {
      const { codigo_cita } = req.params;
      
      const pdfData = await citaService.obtenerOrdenPDF(codigo_cita);

      if (!pdfData) {
        return res.status(404).json({ 
          error: 'Cita no encontrada o sin archivo PDF' 
        });
      }

      // Configurar headers para descarga de PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="orden_cita_${codigo_cita}.pdf"`);
      res.setHeader('Content-Length', pdfData.length);

      // Enviar el PDF
      res.send(pdfData);

    } catch (error) {
      console.error('Error en descargarOrden:', error);
      res.status(500).json({ 
        error: 'Error al descargar el archivo PDF' 
      });
    }
  }
};

module.exports = citaController;