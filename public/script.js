'use strict';

// Inicializar la conexión con Journey Builder
const connection = new Postmonger.Session();
let payload = {};
let steps = [{ "key": "step1", "label": "Configure Email" }];
let currentStep = steps[0].key;

document.addEventListener('DOMContentLoaded', function () {
    // Evento que se dispara cuando Journey Builder carga la actividad
    connection.on('initActivity', initialize);

    // Evento que se dispara cuando el usuario hace clic en "Done" o avanza
    connection.on('clickedNext', save);
    
    // Notificar a Journey Builder que estamos listos
    connection.trigger('ready');
});

function initialize(data) {
    if (data) {
        payload = data;
    }

    const hasInArguments = payload['arguments'] && payload['arguments'].execute && payload['arguments'].execute.inArguments && payload['arguments'].execute.inArguments.length > 0;

    if (hasInArguments) {
        const metaData = payload['metaData'] || {};
        document.getElementById('subject').value = metaData.subject || '';
        document.getElementById('prompt').value = metaData.promptTemplate || '';
    }

    // Informar a Journey Builder sobre el estado de la UI
    connection.trigger('updateButton', { button: 'next', text: 'Done', visible: true });
}

function save() {
    const subject = document.getElementById('subject').value;
    const promptTemplate = document.getElementById('prompt').value;

    // Estructuramos el payload que se guardará en la definición del Journey
    payload['metaData'] = {
        subject: subject,
        promptTemplate: promptTemplate
    };

    // Los 'inArguments' ya están definidos en config.json, nos aseguramos de que se mantengan
    payload['arguments'] = payload['arguments'] || {};
    payload['arguments'].execute = payload['arguments'].execute || {};
    
    // Esto es clave: le decimos a Journey Builder que la configuración es válida
    payload.metaData.isConfigured = true;

    // Enviamos el payload actualizado a Journey Builder
    connection.trigger('updateActivity', payload);
}
