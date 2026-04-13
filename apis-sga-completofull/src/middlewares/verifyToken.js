import jwt from "jsonwebtoken";

// Rutas que NO requieren token (públicas)
const PUBLIC_ROUTES = [
    '/password/request-reset',
    '/password/verify-code',
    '/password/reset',
    '/auth/login',
    '/auth/register'
];

export const verifyToken = (req, res, next) => {
    // Verificar si la ruta actual es pública
    const isPublicRoute = PUBLIC_ROUTES.some(route => req.path.includes(route));
    
    // Si es ruta pública, pasar directamente (sin verificar token)
    if (isPublicRoute) {
        return next();
    }
    
    // Para rutas protegidas, verificar token
    try {
        const token = req.headers["authorization"]?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "SUPER_SECRET_KEY");

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token",
            error: error.message
        });
    }
};