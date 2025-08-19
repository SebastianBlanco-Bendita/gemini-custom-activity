'use strict';
const connection = new Postmonger.Session();
let payload = {};

document.addEventListener('DOMContentLoaded', () => {
    connection.on('initActivity', initialize);
    connection.on('clickedNext', save);
    connection.trigger('ready');
});

function initialize(data) {
    if (data) payload = data;
    document.getElementById('subject').value = getMetaData('subject', '');
    document.getElementById('prompt').value = getMetaData('promptTemplate', '');
    connection.trigger('updateButton', { button: 'next', text: 'Done', visible: true });
}

function save() {
    payload['metaData'] = {
        subject: document.getElementById('subject').value,
        promptTemplate: document.getElementById('prompt').value
    };
    payload.metaData.isConfigured = true;
    connection.trigger('updateActivity', payload);
}

function getMetaData(key, def) {
    return payload.metaData && payload.metaData[key] ? payload.metaData[key] : def;
}
