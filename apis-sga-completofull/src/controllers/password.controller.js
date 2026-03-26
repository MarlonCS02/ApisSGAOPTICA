import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/user.model.js";
import UserEntity from "../models/userEntity.model.js";

// Variable para almacenar códigos temporalmente (en producción usar Redis o base de datos)
const resetCodes = new Map(); // key: email, value: { code, expiresAt }

// Generar código de 6 dígitos
const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
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
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutos de validez

    // Guardar código temporalmente
    resetCodes.set(correo, {
      code: resetCode,
      expiresAt,
      userId: user.user_id
    });

    console.log(`Código de recuperación para ${correo}: ${resetCode}`);
    
    // En producción, aquí enviarías el código por email
    // Por ahora, lo devolvemos en la respuesta para pruebas

    return res.status(200).json({
      ok: true,
      message: "Código de recuperación enviado",
      code: resetCode, // Solo para pruebas, en producción no devolver esto
      expiresIn: 15 // minutos
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

// Limpiar códigos expirados cada hora (opcional)
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of resetCodes.entries()) {
    if (now > data.expiresAt) {
      resetCodes.delete(email);
    }
  }
}, 60 * 60 * 1000); // Cada hora