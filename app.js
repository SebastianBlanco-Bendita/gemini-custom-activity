const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config(); // Carga las variables de entorno del archivo .env

const activityRoutes = require('./routes/activity');

const app = express();

// Middleware
app.use(bodyParser.json());

// Servir archivos estáticos (html, js, css, etc.) desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal para la lógica de la actividad
app.use('/activity', activityRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
