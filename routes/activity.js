const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- CONFIGURACIÓN ---
// Carga las claves secretas desde el archivo .env
const { GEMINI_API_KEY, SFMC_CLIENT_ID, SFMC_CLIENT_SECRET, SFMC_SUBDOMAIN } = process.env;

// Construye las URLs de la API de Marketing Cloud
const SFMC_AUTH_URL = `https://${SFMC_SUBDOMAIN}.auth.marketingcloudapis.com/v2/token`;
const SFMC_REST_URL = `https://${SFMC_SUBDOMAIN}.rest.marketingcloudapis.com`;

// Inicializa el cliente de Gemini AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
let sfmcAuthToken = null;

// --- FUNCIONES AUXILIARES ---

/**
 * Obtiene un token de autenticación de SFMC.
 */
async function getSfmAuthToken() {
    if (sfmcAuthToken) return sfmcAuthToken; // Reutiliza el token si ya existe
    
    console.log("Requesting new SFMC Auth Token...");
    const response = await fetch(SFMC_AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            grant_type: 'client_credentials',
            client_id: SFMC_CLIENT_ID,
            client_secret: SFMC_CLIENT_SECRET,
        }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(`SFMC Auth failed: ${data.error_description}`);
    
    sfmcAuthToken = data.access_token;
    console.log("SFMC Auth Token obtained successfully.");
    return sfmcAuthToken;
}

/**
 * Llama a la API de Gemini para generar contenido.
 */
async function callGeminiAPI(prompt) {
    console.log("Calling Gemini API...");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

/**
 * Envía el correo usando la API Transaccional de Marketing Cloud.
 */
async function sendEmailViaSfm(contactKey, toAddress, subject, htmlBody) {
    const token = await getSfmAuthToken();
    const sendDefinitionKey = 'gemini-custom-activity-send'; // Clave de tu Definición de Envío Transaccional
    
    const payload = {
        definitionKey: sendDefinitionKey,
        recipient: {
            contactKey: contactKey,
            to: toAddress,
            attributes: { HTMLBody: htmlBody, Subject: subject }
        }
    };

    console.log(`Sending email to ${toAddress} via SFMC...`);
    const response = await fetch(`${SFMC_REST_URL}/messaging/v1/email/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to send email via SFMC: ${errorData.message}`);
    }
    
    const responseData = await response.json();
    console.log("Email successfully queued in SFMC. Request ID:", responseData.requestId);
}


// --- ENDPOINTS DE LA ACTIVIDAD ---

// Endpoint de EJECUCIÓN: Se activa para cada contacto.
router.post('/execute', async (req, res) => {
    try {
        const args = req.body.inArguments[0];
        const { subject: subjectTemplate, promptTemplate } = req.body.metaData;

        const prompt = promptTemplate
            .replace(/{{firstName}}/g, args.firstName || 'cliente')
            .replace(/{{city}}/g, args.city || 'tu ciudad')
            .replace(/{{interest}}/g, args.interest || 'tus intereses');

        const subject = subjectTemplate.replace(/{{firstName}}/g, args.firstName || 'Hola');

        const emailBody = await callGeminiAPI(prompt);
        await sendEmailViaSfm(args.contactKey, args.emailAddress, subject, emailBody);
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Execution failed:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoints del ciclo de vida (Guardar, Publicar, Validar)
router.post('/save', (req, res) => res.status(200).json({ success: true }));
router.post('/publish', (req, res) => res.status(200).json({ success: true }));
router.post('/validate', (req, res) => res.status(200).json({ success: true }));

module.exports = router;
