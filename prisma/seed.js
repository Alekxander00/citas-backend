const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar tablas existentes (opcional - solo para desarrollo)
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Limpiando datos existentes...');
    await prisma.cita.deleteMany({});
    await prisma.especialidad.deleteMany({});
  }

  // Crear especialidades médicas
  const especialidades = [
    { codigo: 'MED_GEN', nombre: 'Medicina General' },
    { codigo: 'PEDIA', nombre: 'Pediatría' },
    { codigo: 'GYN', nombre: 'Ginecología' },
    { codigo: 'CARD', nombre: 'Cardiología' },
    { codigo: 'DERM', nombre: 'Dermatología' },
    { codigo: 'ORTOP', nombre: 'Ortopedia' },
    { codigo: 'OFT', nombre: 'Oftalmología' },
    { codigo: 'ODON', nombre: 'Odontología' },
    { codigo: 'PSIC', nombre: 'Psicología' },
    { codigo: 'NUTRI', nombre: 'Nutrición' },
    { codigo: 'ENDOC', nombre: 'Endocrinología' },
    { codigo: 'GASTRO', nombre: 'Gastroenterología' },
    { codigo: 'NEURO', nombre: 'Neurología' },
    { codigo: 'UROL', nombre: 'Urología' },
    { codigo: 'TRAUM', nombre: 'Traumatología' }
  ];

  console.log('🏥 Insertando especialidades médicas...');
  
  for (const especialidad of especialidades) {
    await prisma.especialidad.upsert({
      where: { codigo: especialidad.codigo },
      update: {},
      create: {
        codigo: especialidad.codigo,
        nombre: especialidad.nombre
      }
    });
    console.log(`  ✓ ${especialidad.codigo} - ${especialidad.nombre}`);
  }

  console.log('✅ Seed completado exitosamente!');
}

main()
  .catch((error) => {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });