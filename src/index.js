require('dotenv').config();
process.env.TZ = 'America/Bogota';

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Permite solicitudes sin origen (como mobile apps o curl)
    if (!origin) return callback(null, true);
    
    // Lista de orígenes permitidos
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173', // Vite
      'https://citas-frontend-production.up.railway.app', // Tu frontend en producción
      // Agrega aquí cualquier otro origen que necesites
    ];
    
    if (allowedOrigins.includes(origin) || origin.includes('localhost')) {
      return callback(null, true);
    }
    
    return callback(new Error('Origen no permitido por CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Health check
app.get('/health', (req, res) => {
  const fechaActual = new Date();
  const horaColombia = fechaActual.toLocaleString('es-CO', { timeZone: 'America/Bogota' });

  res.json({ 
    status: 'OK', 
    timestamp: fechaActual.toISOString(),
    hora_colombia: horaColombia,
    zona_horaria: 'America/Bogota (Tunja, Boyacá)',
    service: 'citas-medicas-backend'
  });
});

// Routes
app.use('/api/especialidades', require('./routes/especialidades'));
app.use('/api/disponibilidad', require('./routes/disponibilidad'));
app.use('/api/citas', require('./routes/citas'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Algo salió mal en el servidor',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// Start server
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`
  🚀 Servidor iniciado
  📍 Puerto: ${PORT}
  🔗 URL: http://localhost:${PORT}
  📊 Health check: http://localhost:${PORT}/health
  `);
  
  // Probar conexión a la base de datos
  prisma.$connect()
    .then(() => console.log('✅ Conectado a la base de datos'))
    .catch(err => console.error('❌ Error conectando a la base de datos:', err.message));
});
