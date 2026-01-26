const prisma = require('../prisma/client');

const citaService = {
  crearCita: async (citaData) => {
    try {
      // Verificar que la especialidad exista
      const especialidadExistente = await prisma.especialidad.findUnique({
        where: { codigo: citaData.especialidad_codigo }
      });

      if (!especialidadExistente) {
        throw new Error('La especialidad no existe');
      }

      // Crear la cita en la base de datos
      const cita = await prisma.cita.create({
        data: {
          tipo_identificacion: citaData.tipo_identificacion,
          numero_identificacion: citaData.numero_identificacion,
          telefono: citaData.telefono,
          especialidad_codigo: citaData.especialidad_codigo,
          dia_semana: citaData.dia_semana,
          jornada: citaData.jornada,
          orden_pdf: citaData.orden_pdf
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

      return cita;

    } catch (error) {
      console.error('Error en crearCita (service):', error);
      throw error;
    }
  },

  obtenerOrdenPDF: async (codigoCita) => {
    try {
      const cita = await prisma.cita.findUnique({
        where: { codigo_cita: codigoCita },
        select: { orden_pdf: true }
      });

      return cita ? cita.orden_pdf : null;

    } catch (error) {
      console.error('Error en obtenerOrdenPDF:', error);
      throw error;
    }
  }
};

module.exports = citaService;