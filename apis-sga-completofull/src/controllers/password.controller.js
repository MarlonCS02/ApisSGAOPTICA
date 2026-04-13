// src/controllers/password.controller.js
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import UserEntity from "../models/userEntity.model.js";
import { sendPasswordResetEmail } from "../config/email.config.js";

// Variable para almacenar códigos temporalmente
const resetCodes = new Map();

const generateResetCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Función para verificar si un correo parece real (puede recibir emails)
const isRealEmail = (email) => {
    // Dominios que NO son reales (pruebas)
    const fakeDomains = [
        'test.com', 'example.com', 'fake.com', 'prueba.com',
        'test.local', 'localhost', 'dominio.com', 'correo.com',
        'usuario.com', 'ejemplo.com', 'demo.com', 'testing.com'
    ];
    
    const emailDomain = email.split('@')[1]?.toLowerCase();
    
    // Si el dominio está en la lista de falsos, no es real
    if (fakeDomains.includes(emailDomain)) {
        return false;
    }
    
    // Si tiene formato de email válido y no es dominio falso, asumimos que es real
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// 1. Solicitar recuperación de contraseña - Enviar código
export const requestPasswordReset = async (req, res) => {
    try {
        const { correo } = req.body;

        if (!correo) {
            return res.status(400).json({
                ok: false,
                message: "El correo electrónico es requerido"
            });
        }

        // Buscar usuario por correo
        const user = await User.findOne({
            where: { user_user: correo },
            include: [{ model: UserEntity, as: "UserEntityInfo" }]
        });

        if (!user) {
            return res.status(404).json({
                ok: false,
                message: "No existe una cuenta con este correo electrónico"
            });
        }

        // Generar código de 6 dígitos
        const resetCode = generateResetCode();
        const expiresAt = Date.now() + 15 * 60 * 1000;

        // Guardar código temporalmente
        resetCodes.set(correo, {
            code: resetCode,
            expiresAt,
            userId: user.user_id
        });

        // Obtener nombre del usuario
        const nombre = user.UserEntityInfo?.first_name || 
                      user.UserEntityInfo?.first_name || 
                      correo.split('@')[0];

        // Verificar si el correo es real
        const emailReal = isRealEmail(correo);
        
        let emailSent = false;
        let message = "";

        if (emailReal) {
            // Intentar enviar email real
            emailSent = await sendPasswordResetEmail(correo, resetCode, nombre);
            
            if (emailSent) {
                message = "Código de recuperación enviado a tu correo electrónico";
                console.log(`✅ Email enviado a ${correo}`);
            } else {
                message = "No se pudo enviar el email. Usa el código de respaldo.";
                console.log(`⚠️ Falló envío a ${correo}, usando código de respaldo`);
            }
        } else {
            // Correo de prueba - mostrar código en consola
            message = "Correo de prueba. Usa el código que aparece en la consola del servidor.";
            console.log(`📧 CÓDIGO DE PRUEBA para ${correo}: ${resetCode}`);
            emailSent = false;
        }

        // Siempre mostrar el código en consola para desarrollo
        console.log(`🔑 Código para ${correo}: ${resetCode}`);

        // En desarrollo, devolvemos el código en la respuesta
        const isDevelopment = process.env.NODE_ENV !== 'production';
        
        return res.status(200).json({
            ok: true,
            message: message,
            code: isDevelopment ? resetCode : undefined, // Solo en desarrollo
            emailSent: emailSent,
            isRealEmail: emailReal,
            expiresIn: 15
        });

    } catch (error) {
        console.error("Error en requestPasswordReset:", error);
        return res.status(500).json({
            ok: false,
            message: "Error al procesar la solicitud",
            error: error.message
        });
    }
};

// 2. Verificar código de recuperación
export const verifyResetCode = async (req, res) => {
    try {
        const { correo, code } = req.body;

        if (!correo || !code) {
            return res.status(400).json({
                ok: false,
                message: "Correo y código son requeridos"
            });
        }

        const resetData = resetCodes.get(correo);

        if (!resetData) {
            return res.status(404).json({
                ok: false,
                message: "No hay una solicitud de recuperación activa"
            });
        }

        if (resetData.code !== code) {
            return res.status(400).json({
                ok: false,
                message: "Código incorrecto"
            });
        }

        if (Date.now() > resetData.expiresAt) {
            resetCodes.delete(correo);
            return res.status(400).json({
                ok: false,
                message: "El código ha expirado. Solicita uno nuevo"
            });
        }

        return res.status(200).json({
            ok: true,
            message: "Código verificado correctamente",
            userId: resetData.userId
        });

    } catch (error) {
        console.error("Error en verifyResetCode:", error);
        return res.status(500).json({
            ok: false,
            message: "Error al verificar el código",
            error: error.message
        });
    }
};

// 3. Restablecer contraseña
export const resetPassword = async (req, res) => {
    try {
        const { correo, code, nueva_contrasena, confirmar_contrasena } = req.body;

        if (!correo || !code || !nueva_contrasena || !confirmar_contrasena) {
            return res.status(400).json({
                ok: false,
                message: "Todos los campos son requeridos"
            });
        }

        if (nueva_contrasena !== confirmar_contrasena) {
            return res.status(400).json({
                ok: false,
                message: "Las contraseñas no coinciden"
            });
        }

        if (nueva_contrasena.length < 6) {
            return res.status(400).json({
                ok: false,
                message: "La contraseña debe tener al menos 6 caracteres"
            });
        }

        const resetData = resetCodes.get(correo);

        if (!resetData) {
            return res.status(404).json({
                ok: false,
                message: "No hay una solicitud de recuperación activa"
            });
        }

        if (resetData.code !== code) {
            return res.status(400).json({
                ok: false,
                message: "Código incorrecto"
            });
        }

        if (Date.now() > resetData.expiresAt) {
            resetCodes.delete(correo);
            return res.status(400).json({
                ok: false,
                message: "El código ha expirado. Solicita uno nuevo"
            });
        }

        // Encriptar nueva contraseña
        const hashedPassword = bcrypt.hashSync(nueva_contrasena, 10);

        // Actualizar contraseña en la base de datos
        await User.update(
            { user_password: hashedPassword },
            { where: { user_user: correo } }
        );

        // Eliminar código usado
        resetCodes.delete(correo);

        return res.status(200).json({
            ok: true,
            message: "Contraseña actualizada correctamente"
        });

    } catch (error) {
        console.error("Error en resetPassword:", error);
        return res.status(500).json({
            ok: false,
            message: "Error al restablecer la contraseña",
            error: error.message
        });
    }
};

// Limpiar códigos expirados cada hora
setInterval(() => {
    const now = Date.now();
    for (const [email, data] of resetCodes.entries()) {
        if (now > data.expiresAt) {
            resetCodes.delete(email);
        }
    }
}, 60 * 60 * 1000);