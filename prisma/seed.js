const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de la base de datos...');

  const especialidades = [
    { codigo: 1, nombre: 'Medicina General', icono: 'FaUserMd' },
    { codigo: 2, nombre: 'Pediatría', icono: 'FaBaby' },
    { codigo: 3, nombre: 'Ginecología', icono: 'FaVenus' },
    { codigo: 4, nombre: 'Cardiología', icono: 'FaHeartbeat' },
    { codigo: 5, nombre: 'Dermatología', icono: 'FaStethoscope' },
    { codigo: 6, nombre: 'Ortopedia', icono: 'FaBone' },
    { codigo: 7, nombre: 'Oftalmología', icono: 'FaEye' },
    { codigo: 8, nombre: 'Odontología', icono: 'FaTooth' },
    { codigo: 9, nombre: 'Psicología', icono: 'FaBrain' },
    { codigo: 10, nombre: 'Nutrición', icono: 'FaAppleAlt' }
  ];

  console.log('Insertando especialidades medicas...');

  for (const esp of especialidades) {
    await prisma.especialidad.upsert({
      where: { codigo: esp.codigo },
      update: {},
      create: {
        codigo: esp.codigo,
        nombre: esp.nombre,
        icono: esp.icono
      }
    });
    console.log(`  - ${esp.codigo} - ${esp.nombre} (${esp.icono})`);
  }

  const diasHabiles = [
    { dia_semana: 'LUNES', habilitado: true },
    { dia_semana: 'MARTES', habilitado: true },
    { dia_semana: 'MIERCOLES', habilitado: true },
    { dia_semana: 'JUEVES', habilitado: true },
    { dia_semana: 'VIERNES', habilitado: true },
    { dia_semana: 'SABADO', habilitado: true },
    {
      dia_semana: 'DOMINGO',
      habilitado: false,
      mensaje_inhabil: 'El modulo de citas no esta habilitado los domingos. Intente nuevamente en un dia habil.'
    }
  ];

  console.log('Configurando dias habiles...');

  for (const dia of diasHabiles) {
    await prisma.diaHabil.upsert({
      where: { dia_semana: dia.dia_semana },
      update: {},
      create: {
        dia_semana: dia.dia_semana,
        habilitado: dia.habilitado,
        mensaje_inhabil: dia.mensaje_inhabil || null
      }
    });
    console.log(`  - ${dia.dia_semana} - ${dia.habilitado ? 'habilitado' : 'inhabilitado'}`);
  }

  console.log('Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
