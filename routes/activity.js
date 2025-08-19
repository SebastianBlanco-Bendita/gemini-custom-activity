const express = require('express');
const router = express.Router();

// Placeholder para la función que llama a la API de Gemini
async function callGeminiAPI(prompt) {
    console.log("Calling Gemini API with prompt:", prompt);
    // --- INICIO DE LA LÓGICA DE LA API DE GEMINI ---
    // Aquí iría el código para hacer una petición a la API de Google Generative AI
    // Ejemplo:
    // const { GoogleGenerativeAI } = require("@google/generative-ai");
    // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    // const result = await model.generateContent(prompt);
    // const response = await result.response;
    // const text = response.text();
    // return text;
    // --- FIN DE LA LÓGICA DE LA API DE GEMINI ---

    // Devolvemos un cuerpo de correo de ejemplo para pruebas
    return `
        <h1>Hola!</h1>
        <p>Este es un correo de prueba generado basado en el prompt:</p>
        <p><em>${prompt}</em></p>
        <p>¡Esperamos que te guste!</p>
    `;
}

// Placeholder para la función que envía el correo
async function sendEmail(to, subject, htmlBody) {
    console.log(`Sending email to: ${to}`);
    console.log(`Subject: ${subject}`);
    // --- INICIO DE LA LÓGICA DE ENVÍO DE CORREO ---
    // Aquí usarías un servicio como SendGrid, Amazon SES, o la API de SFMC
    // para enviar el correo. Por seguridad y trazabilidad, usar la API de SFMC
    // para envíos transaccionales es una excelente opción.
    // --- FIN DE LA LÓGICA DE ENVÍO DE CORREO ---
    console.log("Email sent successfully (simulation).");
    return true;
}


// Endpoint de EJECUCIÓN: Se llama para cada contacto en el Journey
router.post('/execute', async (req, res) => {
    console.log('Executing activity for contact:', req.body);

    // Los datos del contacto vienen en 'inArguments'
    const args = req.body.inArguments[0];
    
    // Los datos de configuración de la UI vienen en 'activityInstance.metaData'
    const activityData = req.body;
    const subjectTemplate = activityData.metaData.subject;
    const promptTemplate = activityData.metaData.promptTemplate;
    
    // 1. Personalizar el prompt y el asunto con los datos del contacto
    let prompt = promptTemplate
        .replace(/{{firstName}}/g, args.firstName)
        .replace(/{{city}}/g, args.city)
        .replace(/{{interest}}/g, args.interest);

    let subject = subjectTemplate.replace(/{{firstName}}/g, args.firstName);

    try {
        // 2. Llamar a la API de Gemini para generar el cuerpo del correo
        const emailBody = await callGeminiAPI(prompt);

        // 3. Enviar el correo personalizado
        await sendEmail(args.emailAddress, subject, emailBody);

        // 4. Devolver éxito a Marketing Cloud
        res.status(200).json({ success: true });

    } catch (error) {
        console.error("Error during execution:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint de GUARDADO: Se llama cuando el usuario guarda la configuración
router.post('/save', (req, res) => {
    console.log('Saving activity configuration:', req.body);
    res.status(200).json({ success: true });
});

// Endpoint de PUBLICACIÓN: Se llama cuando el Journey se activa
router.post('/publish', (req, res) => {
    console.log('Publishing activity:', req.body);
    res.status(200).json({ success: true });
});

// Endpoint de VALIDACIÓN: Se llama para comprobar que la configuración es correcta antes de publicar
router.post('/validate', (req, res) => {
    console.log('Validating activity:', req.body);
    // Aquí podrías añadir lógica para verificar que el prompt y el asunto no están vacíos
    res.status(200).json({ success: true });
});

module.exports = router;
