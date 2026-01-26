// server.js - Coloca esto en la RAÍZ del backend
require('dotenv').config();

console.log('🚀 ===== INICIANDO BACKEND EN RAILWAY =====');

// Verificación EXTENSA de variables
console.log('\n🔍 VERIFICANDO VARIABLES:');
console.log('NODE_ENV:', process.env.NODE_ENV || '❌ NO DEFINIDO');
console.log('PORT:', process.env.PORT || '3000 (default)');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ DEFINIDA' : '❌ NO DEFINIDA - ESTE ES EL PROBLEMA');

if (process.env.DATABASE_URL) {
  // Mostrar URL segura (sin contraseña)
  const url = process.env.DATABASE_URL;
  const safeUrl = url.replace(/:[^:@]+@/, ':****@');
  console.log('   URL (segura):', safeUrl);
  
  // Verificar formato
  if (!url.startsWith('postgresql://')) {
    console.error('❌ ERROR: DATABASE_URL debe empezar con postgresql://');
  }
} else {
  console.error('\n🚨 ERROR CRÍTICO: DATABASE_URL NO ESTÁ DEFINIDA');
  console.error('Por favor, en Railway:');
  console.error('1. Ve a tu proyecto → Variables');
  console.error('2. Agrega: DATABASE_URL = postgresql://usuario:contraseña@servidor:puerto/basededatos');
  console.error('3. Haz un nuevo deploy');
}

// Iniciar Express aunque no haya DATABASE_URL (para debugging)
const express = require('express');
const cors = require('cors');
const app = express();

// CORS permisivo temporalmente
app.use(cors());

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Health check (IMPORTANTE)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    database: process.env.DATABASE_URL ? 'configured' : 'missing',
    timestamp: new Date().toISOString()
  });
});

// Ruta de diagnóstico
app.get('/debug', (req, res) => {
  res.json({
    node_env: process.env.NODE_ENV,
    port: process.env.PORT,
    database_url_configured: !!process.env.DATABASE_URL,
    all_env_vars: Object.keys(process.env).filter(k => 
      k.includes('DATABASE') || k.includes('RAILWAY') || k.includes('NODE')
    ),
    working_directory: process.cwd(),
    files_in_root: require('fs').readdirSync('.').slice(0, 10)
  });
});

// Si hay DATABASE_URL, cargar las rutas reales
if (process.env.DATABASE_URL) {
  try {
    console.log('\n📦 CARGANDO PRISMA Y RUTAS...');
    const citasRoutes = require('./src/routes/citas');
    const especialidadesRoutes = require('./src/routes/especialidades');
    
    app.use('/api/citas', citasRoutes);
    app.use('/api/especialidades', especialidadesRoutes);
    
    console.log('✅ Rutas cargadas correctamente');
  } catch (error) {
    console.error('❌ Error cargando rutas:', error.message);
    app.use('/api/*', (req, res) => {
      res.status(500).json({ 
        error: 'Backend en mantenimiento',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    });
  }
} else {
  // Rutas de prueba si no hay DATABASE_URL
  console.log('\n⚠️  USANDO RUTAS DE PRUEBA (sin base de datos)');
  
  app.get('/api/especialidades', (req, res) => {
    res.json({
      success: true,
      cantidad: 5,
      especialidades: [
        { codigo: 'MED_GEN', nombre: 'Medicina General (demo)' },
        { codigo: 'PEDIA', nombre: 'Pediatría (demo)' },
        { codigo: 'GYN', nombre: 'Ginecología (demo)' },
        { codigo: 'CARD', nombre: 'Cardiología (demo)' },
        { codigo: 'DERM', nombre: 'Dermatología (demo)' }
      ],
      note: 'Base de datos no configurada. Configure DATABASE_URL en Railway Variables.'
    });
  });
  
  app.post('/api/citas', (req, res) => {
    res.status(201).json({
      success: true,
      message: 'Cita recibida (modo demo)',
      note: 'Configure DATABASE_URL en Railway para persistencia real.'
    });
  });
}

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    message: 'API de Citas Médicas',
    status: process.env.DATABASE_URL ? 'operational' : 'demo_mode',
    endpoints: ['/', '/health', '/debug', '/api/especialidades', '/api/citas'],
    note: process.env.DATABASE_URL ? undefined : 'Configure DATABASE_URL en Railway Variables'
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('🔥 ERROR:', err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Contacte al administrador'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // ¡IMPORTANTE para Railway/Docker!

app.listen(PORT, HOST, () => {
  console.log(`\n✅ SERVIDOR INICIADO CORRECTAMENTE`);
  console.log(`   Local: http://localhost:${PORT}`);
  console.log(`   Network: http://${HOST}:${PORT}`);
  console.log(`   External: https://citas-backend-production-3949.up.railway.app`);
  console.log(`\n📊 ESTADO: ${process.env.DATABASE_URL ? 'CONECTADO A BD' : 'MODO DEMO (sin BD)'}`);
  console.log('===========================================');
});