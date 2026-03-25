// src/middlewares/isAdminOrOptometrist.js
// Permite acceso a: administrador, optometra
// Usado en: subir fórmulas, ver fórmulas de clientes
export const isAdminOrOptometrist = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Usuario no autenticado"
            });
        }

        const rolesPermitidos = ["administrador", "optometra"];

        if (!rolesPermitidos.includes(req.user.role_name)) {
            return res.status(403).json({
                success: false,
                message: "Acceso denegado. Se requiere rol de administrador u optómetra."
            });
        }

        next();
    } catch (error) {
        console.error("Error en middleware isAdminOrOptometrist:", error);
        res.status(500).json({
            success: false,
            message: "Error al verificar permisos",
            error: error.message
        });
    }
};