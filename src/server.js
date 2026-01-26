const express = require('express');
const cors = require('cors');
const citasRoutes = require('./routes/citas');
const especialidadesRoutes = require('./routes/especialidades');

const app = express();
const PORT = process.env.PORT || 3000;
require('dotenv').config();

const corsOptions = {
  origin: [
    'http://localhost:3001',
    'http://localhost:5173',  // Puerto default de Vite
    'https://citas-backend-production-3949.up.railway.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'citas-medicas-api'
  });
});


// Middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Permite frontend y backend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas API
app.use('/api/citas', citasRoutes);
app.use('/api/especialidades', especialidadesRoutes);

// Ruta de prueba y documentación
app.get('/', (req, res) => {
  res.json({ 
    mensaje: 'API del Sistema de Agendamiento de Citas Médicas',
    version: '1.0.0',
    endpoints: {
      citas: {
        crear: 'POST /api/citas',
        descargarOrden: 'GET /api/citas/:codigo_cita/orden'
      },
      especialidades: {
        listar: 'GET /api/especialidades'
      }
    },
    documentacion: 'Consulte la documentación completa para más detalles'
  });
});

// Middleware para manejar rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method
  });
});

// Middleware para manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error global:', err.stack);
  
  // Manejo específico para errores de multer (tamaño de archivo)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ 
      error: 'El archivo PDF es demasiado grande',
      maxSize: '15 MB'
    });
  }

  // Manejo específico para errores de multer (tipo de archivo)
  if (err.message && err.message.includes('Solo se permiten archivos PDF')) {
    return res.status(400).json({ 
      error: 'Tipo de archivo no permitido',
      permitido: 'Solo archivos PDF'
    });
  }

  res.status(500).json({ 
    error: 'Error interno del servidor',
    detalle: process.env.NODE_ENV === 'development' ? err.message : 'Contacte al administrador'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en: http://localhost:${PORT}`);
  console.log(`📁 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📚 API disponible en: http://localhost:${PORT}/api`);
});