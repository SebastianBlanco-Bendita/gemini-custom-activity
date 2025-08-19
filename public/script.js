'use strict';

const connection = new Postmonger.Session();
let payload = {};

document.addEventListener('DOMContentLoaded', function () {
    connection.on('initActivity', initialize);
    connection.on('clickedNext', save);
    connection.trigger('ready');
});

function initialize(data) {
    if (data) {
        payload = data;
    }

    const subject = getMetaDataValue('subject', '');
    const promptTemplate = getMetaDataValue('promptTemplate', '');

    document.getElementById('subject').value = subject;
    document.getElementById('prompt').value = promptTemplate;

    connection.trigger('updateButton', { button: 'next', text: 'Done', visible: true });
}

function save() {
    const subject = document.getElementById('subject').value.trim();
    const promptTemplate = document.getElementById('prompt').value.trim();

    if (!subject || !promptTemplate) {
        alert('Por favor, completa el asunto y la plantilla del prompt.');
        connection.trigger('ready'); // Vuelve a habilitar el botón "Done"
        return;
    }

    payload['metaData'] = {
        subject: subject,
        promptTemplate: promptTemplate
    };
    
    payload.metaData.isConfigured = true;

    connection.trigger('updateActivity', payload);
}

function getMetaDataValue(key, defaultValue) {
    return payload.metaData && payload.metaData[key] ? payload.metaData[key] : defaultValue;
}
