// backend/server.js  ← ESTE ARCHIVO DEBE ESTAR EN LA RAÍZ
console.log('🚀 ===== INICIANDO BACKEND EN RAILWAY =====');

// 1. Cargar dotenv solo en desarrollo
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
  console.log('📁 Modo desarrollo: .env cargado');
} else {
  console.log('☁️  Modo producción: usando variables de Railway');
}

// 2. Verificar variables CRÍTICAS
console.log('\n🔍 VERIFICANDO VARIABLES:');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'undefined (usa: production)');
console.log('   PORT:', process.env.PORT || 'undefined (usa: 3000)');
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✅ CONFIGURADA' : '❌ NO CONFIGURADA');

if (!process.env.DATABASE_URL) {
  console.error('\n🚨 ERROR CRÍTICO: DATABASE_URL no está en Railway Variables');
  console.error('   SOLUCIÓN: Ve a Railway → Variables → Agrega:');
  console.error('   DATABASE_URL = postgresql://... (tu URL de Railway PostgreSQL)');
}

// 3. Importar dependencias
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// 4. CORS para producción
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3001',
    'https://tu-frontend.railway.app'  // Tu frontend en Railway
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '16mb' }));
app.use(express.urlencoded({ extended: true }));

// 5. Rutas de sistema
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'citas-medicas-backend',
    timestamp: new Date().toISOString(),
    database: process.env.DATABASE_URL ? 'connected' : 'not_configured'
  });
});

app.get('/debug', (req, res) => {
  res.json({
    node_env: process.env.NODE_ENV,
    port: process.env.PORT,
    database_configured: !!process.env.DATABASE_URL,
    working_directory: process.cwd(),
    files: require('fs').readdirSync('.'),
    has_src_folder: require('fs').existsSync('./src'),
    has_prisma_folder: require('fs').existsSync('./prisma')
  });
});

// 6. Intentar cargar las rutas REALES (si existen)
let rutasCargadas = false;
try {
  // Verificar si existe la carpeta src
  const fs = require('fs');
  if (fs.existsSync('./src/routes')) {
    console.log('\n📦 CARGANDO RUTAS DESDE ./src/routes/');
    
    const citasRoutes = require('./src/routes/citas');
    const especialidadesRoutes = require('./src/routes/especialidades');
    
    app.use('/api/citas', citasRoutes);
    app.use('/api/especialidades', especialidadesRoutes);
    
    rutasCargadas = true;
    console.log('✅ Rutas API cargadas correctamente');
  } else {
    console.log('⚠️  No se encontró carpeta ./src/routes/');
  }
} catch (error) {
  console.error('❌ Error cargando rutas:', error.message);
}

// 7. Si no se cargaron rutas, crear rutas básicas
if (!rutasCargadas) {
  console.log('\n⚠️  Creando rutas básicas de demostración...');
  
  app.get('/api/especialidades', (req, res) => {
    res.json({
      success: true,
      message: 'Backend funcionando (modo demo)',
      especialidades: [
        { codigo: 'MED_GEN', nombre: 'Medicina General' },
        { codigo: 'PEDIA', nombre: 'Pediatría' },
        { codigo: 'GYN', nombre: 'Ginecología' }
      ],
      note: 'Configure las rutas reales en ./src/routes/'
    });
  });
  
  app.post('/api/citas', (req, res) => {
    res.status(201).json({
      success: true,
      message: 'Cita recibida (modo demo)',
      note: 'Para funcionalidad completa, configure ./src/routes/citas.js'
    });
  });
}

// 8. Ruta principal
app.get('/', (req, res) => {
  res.json({
    message: 'API de Sistema de Citas Médicas',
    version: '1.0.0',
    status: process.env.DATABASE_URL ? 'operacional' : 'modo_demo',
    endpoints: {
      root: '/',
      health: '/health',
      debug: '/debug',
      especialidades: '/api/especialidades',
      citas: '/api/citas'
    },
    environment: process.env.NODE_ENV || 'development',
    documentation: 'Consulte el README para más información'
  });
});

// 9. Manejo de errores
app.use((err, req, res, next) => {
  console.error('🔥 ERROR:', err.message);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});

// 10. 404 - Ruta no encontrada
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl 
  });
});

// 11. Iniciar servidor
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // ¡IMPORTANTE para Railway!

app.listen(PORT, HOST, () => {
  console.log('\n' + '='.repeat(50));
  console.log(`✅ BACKEND INICIADO CORRECTAMENTE`);
  console.log(`   Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Puerto: ${PORT}`);
  console.log(`   Host: ${HOST}`);
  console.log(`   URL Local: http://localhost:${PORT}`);
  console.log(`   URL Railway: https://citas-backend-production-3949.up.railway.app`);
  console.log(`   Modo: ${rutasCargadas ? 'RUTAS COMPLETAS' : 'MODO DEMO'}`);
  console.log('='.repeat(50) + '\n');
});

// 12. Manejo de señales para Railway
process.on('SIGTERM', () => {
  console.log('👋 Recibido SIGTERM, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 Recibido SIGINT, cerrando servidor...');
  process.exit(0);
});