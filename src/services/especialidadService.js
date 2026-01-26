const prisma = require('../prisma/client');

const especialidadService = {
  obtenerTodas: async () => {
    try {
      const especialidades = await prisma.especialidad.findMany({
        orderBy: {
          nombre: 'asc'
        },
        select: {
          codigo: true,
          nombre: true
        }
      });

      return especialidades;

    } catch (error) {
      console.error('Error en obtenerTodas:', error);
      throw error;
    }
  },

  crearEspecialidad: async (codigo, nombre) => {
    try {
      const especialidad = await prisma.especialidad.create({
        data: {
          codigo: codigo,
          nombre: nombre
        }
      });

      return especialidad;

    } catch (error) {
      console.error('Error en crearEspecialidad:', error);
      throw error;
    }
  }
};

module.exports = especialidadService;