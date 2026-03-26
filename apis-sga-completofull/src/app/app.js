import express from "express";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';

// Manejar __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Middleware global
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos (fórmulas)
app.use("/uploads", express.static(path.join(__dirname, '..', 'public', 'uploads')));

// Rutas
app.use('/api/v1', roleRoutes);
app.use('/api/v1', userRoutes);
app.use('/api/v1', categoryRoutes);
app.use("/api/v1", productRoutes);
app.use("/api/v1", saleRoutes);
app.use("/api/v1", appointmentRoutes);
app.use("/api/v1", formulaRoutes);
app.use('/api/v1', customerRoutes);
app.use('/api/v1', optometristRoutes);
app.use('/api/v1', notificationRoutes);
app.use('/api/v1', documentTypeRoutes);
app.use('/api/v1', examTypeRoutes);
app.use('/api/v1', paymentTypeRoutes);
app.use('/api/v1', saleProductRoutes);
app.use("/api/v1", reportRouter); 
app.use('/api/v1/auth', passwordRoutes);

// Error 404
app.use((req, res) => {
    res.status(404).json({ Message: "Endpoint not found" });
}); 

export default app;
