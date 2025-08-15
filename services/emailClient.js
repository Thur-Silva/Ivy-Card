// /services/emailClient.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: false, // <-- AQUI ESTÁ O ERRO: Para porta 587, 'secure' deve ser false
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

/**
 * Envia um email HTML para um ou mais destinatários.
 * @param {{ to: string[] | string, subject: string, html: string }} param0
 */
export async function sendEmail({ to, subject, html }) {
    if (!Array.isArray(to)) to = [to];
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);


    await transporter.sendMail({
        from: `"Convite Ivy" <${process.env.SMTP_USER}>`,
        to: to.join(', '),
        subject,
        html
    });
}