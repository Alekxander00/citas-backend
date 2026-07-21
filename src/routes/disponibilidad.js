const express = require('express');
const { PrismaClient } = require('@prisma/client');
const {
  DIAS_ORDEN,
  formatearDiaHabil,
  obtenerEstadoModuloCitas
} = require('../utils/diasHabiles');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/modulo-citas', async (req, res) => {
  try {
    const estado = await obtenerEstadoModuloCitas(prisma);

    res.json({
      success: true,
      data: estado
    });
  } catch (error) {
    console.error('Error obteniendo estado del modulo de citas:', error);
    res.status(500).json({
      error: 'Error al obtener el estado del modulo de citas',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/dias-habiles', async (req, res) => {
  try {
    const diasHabiles = await prisma.diaHabil.findMany();
    const diasPorCodigo = new Map(diasHabiles.map((dia) => [dia.dia_semana, dia]));

    const data = DIAS_ORDEN.map((diaSemana) => {
      const diaHabil = diasPorCodigo.get(diaSemana);

      if (diaHabil) {
        return formatearDiaHabil(diaHabil);
      }

      return {
        dia_semana: diaSemana,
        nombre_dia: diaSemana.charAt(0) + diaSemana.slice(1).toLowerCase(),
        habilitado: false,
        mensaje_inhabil: 'Dia no configurado en la base de datos.',
        updated_at: null
      };
    });

    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.error('Error obteniendo dias habiles:', error);
    res.status(500).json({
      error: 'Error al obtener los dias habiles',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
