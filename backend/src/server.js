const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const db = require('./config/db');
const swaggerDocs = require('./config/swagger');

const authRoutes = require('./routes/authRoutes');
const horariosRoutes = require('./routes/horariosRoutes');
const reservasRoutes = require('./routes/reservasRoutes');

const app = express();

const corsOptions = {
origin: ['http://localhost:5173', 'http://localhost:8080', 'http://127.0.0.1:5500', 'http://localhost:5500'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middlewares globales (el orden importa)
app.use(helmet());
app.use(cors(corsOptions)); // solo una vez, con configuración
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/slots', horariosRoutes);
app.use('/api/bookings', reservasRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Servidor funcionando' });
});

// Manejador de Errores
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler); 

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    swaggerDocs(app, PORT);
});