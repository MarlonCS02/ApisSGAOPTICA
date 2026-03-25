// src/middlewares/isAdmin.js
export const isAdmin = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Usuario no autenticado"
            });
        }

        // Se verifica por role_name que viene en el token JWT (puesto por verifyToken.js)
        // CORRECCIÓN: antes verificaba user_id === 1, lo cual era incorrecto porque
        // ataba el permiso a un usuario específico en lugar de al rol.
        if (req.user.role_name !== "Administrador") {
            return res.status(403).json({
                success: false,
                message: "Acceso denegado. Solo el administrador puede realizar esta acción."
            });
        }

        next();
    } catch (error) {
        console.error("Error en middleware isAdmin:", error);
        res.status(500).json({
            success: false,
            message: "Error al verificar permisos de administrador",
            error: error.message
        });
    }
};