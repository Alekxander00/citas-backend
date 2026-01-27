const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Obtener todas las especialidades
router.get('/', async (req, res) => {
  try {
    const especialidades = await prisma.especialidad.findMany({
      orderBy: { nombre: 'asc' }
    });
    
    res.json({
      success: true,
      count: especialidades.length,
      data: especialidades
    });
  } catch (error) {
    console.error('Error obteniendo especialidades:', error);
    res.status(500).json({ 
      error: 'Error al obtener las especialidades',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;