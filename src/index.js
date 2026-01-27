require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '16mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'citas-medicas-backend'
  });
});

// Routes
app.use('/api/especialidades', require('./routes/especialidades'));
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