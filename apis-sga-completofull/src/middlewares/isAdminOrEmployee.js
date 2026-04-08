// src/middlewares/isAdminOrEmployee.js
// Permite acceso a: administrador, empleado
// Usado en: crear ventas, cancelar citas ajenas, ver reportes
export const isAdminOrEmployee = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Usuario no autenticado"
            });
        }

        // Comparación case-insensitive para tolerar "Administrador" o "administrador"
        const roleLower = (req.user.role_name || "").toLowerCase();
        const rolesPermitidos = ["administrador", "empleado"];

        if (!rolesPermitidos.includes(roleLower)) {
            return res.status(403).json({
                success: false,
                message: "Acceso denegado. Se requiere rol de administrador o empleado."
            });
        }

        next();
    } catch (error) {
        console.error("Error en middleware isAdminOrEmployee:", error);
        res.status(500).json({
            success: false,
            message: "Error al verificar permisos",
            error: error.message
        });
    }
};