import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { 
    getAppointmentNotificationsReport,
    getAppointmentsStatusReport,
    getRemindersHistory
} from "../controllers/report.controller.js";

const router = Router();

// Todas las rutas de reportes requieren autenticación y rol de admin
router.use(verifyToken, isAdmin);

// REPORTE 1: Notificaciones de citas por rango de fechas
// GET /api/v1/reports/notifications?startDate=2024-01-01&endDate=2024-01-31
router.get("/reports/notifications", getAppointmentNotificationsReport);

// REPORTE 2: Estado de citas por rango de fechas
// GET /api/v1/reports/appointments/status?startDate=2024-01-01&endDate=2024-01-31
router.get("/reports/appointments/status", getAppointmentsStatusReport);

// REPORTE 3: Historial de recordatorios enviados
// GET /api/v1/reports/reminders?customerId=123&limit=20
router.get("/reports/reminders", getRemindersHistory);

export default router;