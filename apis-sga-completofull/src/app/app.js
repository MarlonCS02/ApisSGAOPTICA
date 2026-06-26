import express from "express";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import fs from 'fs';

// __dirname compatible con ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔥 CORRECCIÓN: La carpeta 'uploads' está en 'src', no en la raíz
const SRC_DIR = path.join(__dirname, '..'); // sube a 'src'
const ROOT_DIR = path.join(__dirname, '..', '..'); // raíz del proyecto (para otras cosas)

// ── Asegurar que las carpetas de uploads existan (en 'src') ──
const uploadsDir = path.join(SRC_DIR, 'uploads', 'products');
const publicUploadsDir = path.join(SRC_DIR, 'public', 'uploads');

// Crear carpetas si no existen
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`📁 Creada carpeta: ${uploadsDir}`);
}
if (!fs.existsSync(publicUploadsDir)) {
    fs.mkdirSync(publicUploadsDir, { recursive: true });
    console.log(`📁 Creada carpeta: ${publicUploadsDir}`);
}

// Routers
import roleRoutes from "../routers/role.router.js";
import userRoutes from "../routers/user.router.js";
import categoryRoutes from "../routers/category.router.js";
import productRoutes from "../routers/product.router.js";
import saleRoutes from "../routers/sale.router.js";
import appointmentRoutes from "../routers/appointment.router.js";
import formulaRoutes from "../routers/formula.router.js";
import customerRoutes from "../routers/customer.router.js";
import optometristRoutes from "../routers/optometrist.router.js";
import notificationRoutes from "../routers/notification.router.js";
import documentTypeRoutes from "../routers/documentType.router.js";
import examTypeRoutes from "../routers/examType.js";
import paymentTypeRoutes from "../routers/paymentType.router.js";
import saleProductRoutes from "../routers/saleProduct.router.js";
import reportRouter from "../routers/report.router.js";
import passwordRoutes from "../routers/password.router.js";

const app = express();

// ── Middleware global ──
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan("dev"));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Archivos estáticos (ahora con la ruta correcta) ──
// PRIMERO: /uploads/products/ → SRC_DIR/uploads/products/
app.use("/uploads/products", express.static(uploadsDir, {
    maxAge: '1d',
    etag: true,
    lastModified: true
}));

// SEGUNDO: /uploads/ → SRC_DIR/public/uploads/
app.use("/uploads", express.static(publicUploadsDir, {
    maxAge: '1d',
    etag: true,
    lastModified: true
}));

// ── Rutas API ──
app.use('/api/v1', roleRoutes);
app.use('/api/v1', userRoutes);
app.use('/api/v1', categoryRoutes);
app.use('/api/v1', productRoutes);
app.use('/api/v1', saleRoutes);
app.use('/api/v1', appointmentRoutes);
app.use('/api/v1', formulaRoutes);
app.use('/api/v1', customerRoutes);
app.use('/api/v1', optometristRoutes);
app.use('/api/v1', notificationRoutes);
app.use('/api/v1', documentTypeRoutes);
app.use('/api/v1', examTypeRoutes);
app.use('/api/v1', paymentTypeRoutes);
app.use('/api/v1', saleProductRoutes);
app.use('/api/v1', reportRouter);
app.use('/api/v1/auth', passwordRoutes);

// ── 404 ──
app.use((req, res) => {
    res.status(404).json({
        Message: "Endpoint not found",
        path: req.originalUrl
    });
});

// ── Manejo de errores global ──
app.use((err, req, res, next) => {
    console.error('❌ Error global:', err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Error interno del servidor'
    });
});

export default app;