// src/config/email.config.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();  // ← IMPORTANTE: Cargar variables de entorno

// Configuración para Gmail
let transporter = null;
let emailConfigured = false;

try {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,     // ← AHORA USA LA VARIABLE DE ENTORNO
            pass: process.env.EMAIL_PASS       // ← AHORA USA LA VARIABLE DE ENTORNO
        }
    });
    emailConfigured = true;
    console.log('✅ Configuración de email cargada');
    console.log('📧 Enviando desde:', process.env.EMAIL_USER);
} catch (error) {
    console.error('❌ Error configurando email:', error.message);
    emailConfigured = false;
}

export const sendPasswordResetEmail = async (toEmail, resetCode, nombre) => {
    // Si no está configurado, no intentar enviar
    if (!emailConfigured || !transporter) {
        console.log(`⚠️ Email no configurado. Código para ${toEmail}: ${resetCode}`);
        return false;
    }

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="text-align: center; border-bottom: 2px solid #0066cc; padding-bottom: 20px;">
                <h1 style="color: #0066cc;">🔐 S.G.A Óptica</h1>
                <h2 style="color: #333;">Recuperación de contraseña</h2>
            </div>
            <div style="padding: 20px;">
                <p>Hola <strong>${nombre || 'usuario'}</strong>,</p>
                <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
                <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; color: #666;">Tu código de verificación es:</p>
                    <h1 style="font-size: 36px; letter-spacing: 5px; color: #0066cc; margin: 10px 0;">${resetCode}</h1>
                    <p style="margin: 0; font-size: 12px; color: #999;">Este código expira en 15 minutos</p>
                </div>
                <p>Si no solicitaste este cambio, ignora este mensaje.</p>
            </div>
            <div style="border-top: 1px solid #e0e0e0; padding-top: 15px; text-align: center; font-size: 12px; color: #999;">
                <p>S.G.A Óptica - Tu visión, nuestra pasión</p>
            </div>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"S.G.A Óptica" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: '🔐 Código de recuperación de contraseña - S.G.A Óptica',
            html: htmlContent
        });
        console.log(`✅ Email enviado a ${toEmail}`);
        return true;
    } catch (error) {
        console.error(`❌ Error enviando email a ${toEmail}:`, error.message);
        return false;
    }
};