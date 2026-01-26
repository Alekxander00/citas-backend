const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');
const citaValidator = require('../validators/citaValidator');
const upload = require('../middleware/upload');

// Ruta para crear una nueva cita
router.post(
  '/',
  upload.single('orden_pdf'), // Middleware para subir archivo PDF
  citaValidator, // Middleware de validación
  citaController.crearCita
);

// Ruta para descargar la orden PDF de una cita
router.get(
  '/:codigo_cita/orden',
  citaController.descargarOrden
);

module.exports = router;