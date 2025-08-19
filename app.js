const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const activityRoutes = require('./routes/activity');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Servir archivos estáticos (html, js, etc.)

// Rutas para la lógica de la actividad
app.use('/activity', activityRoutes);

// Ruta principal para servir la UI (aunque se define en config.json)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'configModal.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Custom Activity endpoint: https://geminicustom.netlify.app/activity`);
    console.log(`UI endpoint: https://geminicustom.netlify.app/configModal.html`);
});
