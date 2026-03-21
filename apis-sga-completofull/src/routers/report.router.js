import express from "express";
import { 
    getSalesReportByDate,
    getAppointmentsReportByDate,
    getCustomerAppointmentsReport,
    getTopProductsReport
} from "../controllers/report.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

// =============================================
// 📊 RUTAS DE REPORTES (TODAS SON GET - SOLO LECTURA)
// =============================================

// Reporte de ventas por fecha
// GET /api/v1/reports/sales?startDate=2024-01-01&endDate=2024-01-31
router.get("/reports/sales", verifyToken, getSalesReportByDate);

// Reporte de citas por fecha
// GET /api/v1/reports/appointments?startDate=2024-01-01&endDate=2024-01-31
router.get("/reports/appointment", verifyToken, getAppointmentsReportByDate);

// Reporte de citas por cliente
// GET /api/v1/reports/customer-appointments?customerId=1&startDate=2024-01-01&endDate=2024-01-31
router.get("/reports/customer-appointment", verifyToken, getCustomerAppointmentsReport);

// Reporte de productos más vendidos (solo admin)
// GET /api/v1/reports/top-products?startDate=2024-01-01&endDate=2024-01-31&limit=5
router.get("/reports/top-products", verifyToken, isAdmin, getTopProductsReport);

export default router;