// /api/notifyRSVP.ts
import { neon } from '@neondatabase/serverless';
import { sendEmail } from '../services/emailClient';
import 'dotenv/config';

export async function POST(request: Request) {
  console.warn("Recebendo pedido para notificar RSVP por email");

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { nome, convidados } = await request.json();

    // Validação
    if (!nome || !convidados) {
      return Response.json({ error: 'Nome e número de convidados são obrigatórios' }, { status: 400 });
    }

    // Busca lista completa ordenada (mais recente primeiro)
    const lista = await sql`
      SELECT name, guests_count, created_at
      FROM users
      ORDER BY created_at DESC;
    `;

    // Soma total de convidados
    const total = lista.reduce((acc, item) => acc + Number(item.guests_count), 0);

    // Monta HTML com estilo
    const assunto = `🎉 Nova confirmação: ${nome}`;
    const corpo = `
      <div style="font-family: Arial, sans-serif; background: linear-gradient(to bottom, #ffe0b2, #ffcc80); padding: 20px; border-radius: 12px; max-width: 500px; margin: auto;">
        <h2 style="color: #d35400; text-align: center;">🌊 Nova Confirmação de Presença!</h2>
        <p style="font-size: 16px; color: #444;">Um novo convidado confirmou presença no aniversário da <strong>Ivy</strong>.</p>
        
        <div style="background: white; border-radius: 8px; padding: 15px; margin-top: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <p><strong>Nome:</strong> ${nome}</p>
          <p><strong>Convidados:</strong> ${convidados}</p>
        </div>

        <hr style="margin: 20px 0; border: none; border-top: 2px dashed #ff9800;" />

        <h3 style="color: #d35400;">📋 Lista de confirmações</h3>
        <p style="margin-bottom: 8px;"><strong>Total de pessoas confirmadas:</strong> ${total}</p>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${lista.map(item => `
            <li style="padding: 6px 0; border-bottom: 1px solid #eee;">
              ${item.name} → ${item.guests_count}
            </li>
          `).join('')}
        </ul>

        <p style="text-align: center; font-size: 12px; color: #777; margin-top: 15px;">
          Enviado automaticamente pelo sistema do convite da Ivy 🌺
        </p>
      </div>
    `;

    // Envia para dois destinatários
    await sendEmail({
      to: ['arthurcaue100@.com', 'conta2@example.com'],
      subject: assunto,
      html: corpo
    });

    return Response.json({ message: 'Notificação enviada com sucesso' }, { status: 200 });

  } catch (err) {
    console.error("Erro ao enviar notificação de RSVP:", err);
    return Response.json({ error: 'Erro interno ao enviar e-mail' }, { status: 500 });
  }
}
