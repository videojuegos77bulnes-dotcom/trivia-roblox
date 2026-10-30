const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const tema = data.tema || "General";

                // Petición a la API gratuita de Google Gemini Flash
                const apiKey = process.env.GEMINI_API_KEY;
                const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `Genera una pregunta de trivia sobre el tema "${tema}" diseñada para una ronda de eliminación de 9 jugadores. Devuelve ÚNICAMENTE un objeto JSON válido con este formato exacto, sin bloques de código ni texto adicional, asegurándote de que la lista de opciones tenga exactamente 9 elementos y el campo "correcta" sea el número de la opción correcta (del 1 al 9): {"pregunta": "texto", "opciones": ["op1", "op2", "op3", "op4", "op5", "op6", "op7", "op8", "op9"], "correcta": 1}`
                            }]
                        }]
                    })
                });

                const aiData = await aiResponse.json();
                const textoGenerado = aiData.candidates[0].content.parts[0].text;

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(textoGenerado);
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    } else {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Servidor de Trivia para Roblox activo.');
    }
});

server.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
