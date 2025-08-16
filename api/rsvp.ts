// /api/rsvp.ts
import { neon } from '@neondatabase/serverless';
// @ts-ignore
import { sendEmail } from '../services/emailClient';
import 'dotenv/config';

// Interface para o corpo da requisição
interface RsvpRequestBody {
    nome: string;
    convidados: number;
}

// Função POST para criar RSVP
export async function POST(request: any) {

    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_PORT:', process.env.SMTP_PORT);

    console.warn("Recebendo confirmação de presença [/api/rsvp]");

    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        
        // Pega JSON corretamente em serverless/Next.js
        let body: RsvpRequestBody;
        try {
            body = await request.json();
        } catch {
            return { json: () => ({ error: 'Corpo inválido' }), status: 400 };
        }

        // Sanitização
        const nomeLimpo = String(body.nome || '').trim();
        const qtdConvidados = Number(body.convidados);

        // Validação
        if (!nomeLimpo) {
            return { json: () => ({ error: 'O nome é obrigatório.' }), status: 400 };
        }
        if (isNaN(qtdConvidados) || qtdConvidados < 1) {
            return { json: () => ({ error: 'Informe um número válido de pessoas (mínimo 1).' }), status: 400 };
        }

        // Inserir no banco
        const response = await sql`
            INSERT INTO users (name, guests_count, created_at)
            VALUES (${nomeLimpo}, ${qtdConvidados}, NOW())
            RETURNING *;
        `;

        // Lista completa ordenada (mais recente primeiro)
        const lista = await sql`
            SELECT name, guests_count, created_at
            FROM users
            ORDER BY created_at DESC;
        `;

        // Total de convidados
        const total = lista.reduce((acc, item) => acc + Number(item.guests_count), 0);

        // Monta HTML para e-mail
        const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
        const assunto = `🎉${capitalize(nomeLimpo)} confirmou que vem!`;
        const corpo = `
<div style="font-family: Arial, sans-serif; background: linear-gradient(to bottom, #ffe0b2, #ffcc80); padding: 25px; border-radius: 14px; max-width: 550px; margin: auto; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
    <h2 style="color: #d35400; text-align: center; font-size: 26px; margin-bottom: 10px;">🌊 Nova Confirmação de Presença!</h2>
    <p style="font-size: 16px; color: #444; text-align: center; margin-bottom: 20px;">
        Um novo convidado confirmou presença no aniversário da <strong>Ivy</strong>.
    </p>

    <div style="background: white; border-radius: 10px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">
        <p style="font-size: 16px; margin: 5px 0;"><strong>Nome:</strong> ${nomeLimpo}</p>
        <p style="font-size: 16px; margin: 5px 0;"><strong>Convidados:</strong> ${qtdConvidados}</p>
    </div>

    <hr style="margin: 25px 0; border: none; border-top: 2px dashed #ff9800;" />

    <h3 style="color: #d35400; font-size: 20px; margin-bottom: 12px;">📋 Lista de confirmações</h3>
    
    <p style="margin-bottom: 12px; font-size: 18px; color: #d33800ff; font-weight: bold; text-align: center;">
        Total de pessoas confirmadas: ${total}
    </p>

    <ul style="list-style: none; padding: 0; margin: 0;">
        ${lista.map(item => `
            <li style="padding: 8px 10px; border-bottom: 1px solid #eee; font-size: 15px; display: flex; justify-content: space-between;">
                <span>${item.name} --> </span> 
                <span> ${item.guests_count}</span>
            </li>
        `).join('')}
    </ul>

    <p style="text-align: center; font-size: 12px; color: #777; margin-top: 20px;">
        Enviado automaticamente pelo sistema do convite da Ivy 🌺
    </p>
</div>
`;

        // Envia e-mail
        try {
            await sendEmail({
                to: ['arthurcaue100@gmail.com'],
                subject: assunto,
                html: corpo
            });
            console.warn("Notificação por e-mail enviada com sucesso para o email: arthurcaue100@gmail.com");
        } catch (emailErr) {
            console.error("Erro ao enviar notificação por e-mail:", emailErr);
        }

        return {
            json: () => ({
                message: 'Confirmação registrada com sucesso!',
                data: response[0]
            }),
            status: 201
        };

    } catch (err) {
        console.error("Erro ao registrar RSVP:", err);
        return {
            json: () => ({ error: 'Erro interno do servidor' }),
            status: 500
        };
    }
}

// Função GET para listar confirmações
export async function GET(request: any) {
    console.warn("Listando confirmações [/api/rsvp]");

    try {
        const sql = neon(`${process.env.DATABASE_URL}`);

        const lista = await sql`
            SELECT id, name, guests_count, created_at
            FROM users
            ORDER BY created_at DESC;
        `;

        return {
            json: () => ({
                totalConfirmados: lista.length,
                data: lista
            }),
            status: 200
        };

    } catch (err) {
        console.error("Erro ao buscar confirmações:", err);
        return {
            json: () => ({ error: 'Erro interno do servidor' }),
            status: 500
        };
    }
}
