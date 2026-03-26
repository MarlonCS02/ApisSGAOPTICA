// src/routers/report.router.js
import express from "express";
import {
    getSalesReportByDate,
    getAppointmentsReportByDate,
    getCustomerAppointmentsReport,
    getTopProductsReport
} from "../controllers/report.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { isAdminOrEmployee } from "../middlewares/isAdminOrEmployee.js";

const router = express.Router();

// GET - Reporte de ventas por fecha (admin y empleado)
// GET /api/v1/reports/sales?startDate=2024-01-01&endDate=2024-01-31
router.get("/reports/sales", verifyToken, isAdminOrEmployee, getSalesReportByDate);

// GET - Reporte de citas por fecha (admin y empleado)
// GET /api/v1/reports/appointments?startDate=2024-01-01&endDate=2024-01-31
router.get("/reports/appointment", verifyToken, isAdminOrEmployee, getAppointmentsReportByDate);

// GET - Reporte de citas por cliente (admin, empleado y el propio cliente con token)
// GET /api/v1/reports/customer-appointments?customerId=1
router.get("/reports/customer-appointment", verifyToken, getCustomerAppointmentsReport);

// GET - Productos más vendidos (solo admin)
// GET /api/v1/reports/top-products?startDate=2024-01-01&endDate=2024-01-31&limit=5
router.get("/reports/top-products", verifyToken, isAdmin, getTopProductsReport); // Este no esta sirviendo

export default router;