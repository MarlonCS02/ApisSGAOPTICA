// src/middlewares/isAdmin.js
export const isAdmin = (req, res, next) => {
    try {
        // Verificar que el usuario existe en el request (debe venir de verifyToken)
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        // Verificar si es admin (id = 1 según requerimientos)
        // req.user viene de verifyToken.js con user_id, role_id, role_name
        if (req.user.user_id !== 1 && req.user.role_id !== 1) {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. Solo el administrador puede realizar esta acción.'
            });
        }

        next();
    } catch (error) {
        console.error('Error en middleware isAdmin:', error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar permisos de administrador',
            error: error.message
        });
    }
};