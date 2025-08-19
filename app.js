const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config(); // Carga las claves secretas del archivo .env

const activityRoutes = require('./routes/activity');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/activity', activityRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
