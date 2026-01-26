const express = require('express');
const router = express.Router();
const especialidadController = require('../controllers/especialidadController');

// Ruta para obtener todas las especialidades
router.get(
  '/',
  especialidadController.obtenerEspecialidades
);

module.exports = router;