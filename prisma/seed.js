const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');
  
  // Crear especialidades médicas
  const especialidades = [
    { codigo: 1, nombre: 'Medicina General' },
    { codigo: 2, nombre: 'Pediatría' },
    { codigo: 3, nombre: 'Ginecología' },
    { codigo: 4, nombre: 'Cardiología' },
    { codigo: 5, nombre: 'Dermatología' },
    { codigo: 6, nombre: 'Ortopedia' },
    { codigo: 7, nombre: 'Oftalmología' },
    { codigo: 8, nombre: 'Odontología' },
    { codigo: 9, nombre: 'Psicología' },
    { codigo: 10, nombre: 'Nutrición' }
  ];
  
  console.log('🏥 Insertando especialidades médicas...');
  
  for (const esp of especialidades) {
    await prisma.especialidad.upsert({
      where: { codigo: esp.codigo },
      update: {},
      create: {
        codigo: esp.codigo,
        nombre: esp.nombre
      }
    });
    console.log(`  ✓ ${esp.codigo} - ${esp.nombre}`);
  }
  
  console.log('✅ Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });