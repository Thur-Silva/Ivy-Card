import 'dotenv/config'; // <-- primeiro import
// server.js
import express from 'express';

import next from 'next';
import { POST, GET } from './api/rsvp.ts';


const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();
    const port = 3000;

    server.use(express.json());

    // Crie a rota de API personalizada, usando as funções importadas
    server.post('/api/rsvp', async (req, res) => {
        try {
            const response = await POST(req); 
            const json = await response.json();
            res.status(response.status).json(json);
        } catch (error) {
            console.error("Erro na rota /api/rsvp:", error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    });

    // Use server.use() para passar todas as outras requisições para o Next.js
    server.use(handle);

    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${port}`);
    });
});