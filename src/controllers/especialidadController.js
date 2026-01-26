const especialidadService = require('../services/especialidadService');

const especialidadController = {
  obtenerEspecialidades: async (req, res) => {
    try {
      const especialidades = await especialidadService.obtenerTodas();
      
      res.json({
        success: true,
        cantidad: especialidades.length,
        especialidades: especialidades
      });
      
    } catch (error) {
      console.error('Error en obtenerEspecialidades:', error);
      res.status(500).json({ 
        error: 'Error al obtener las especialidades médicas' 
      });
    }
  }
};

module.exports = especialidadController;