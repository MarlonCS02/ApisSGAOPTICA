import express from "express";
import { 
    createAppointment,
    getAppointments,
    getAppointmentById,
    getAppointmentsByCustomer,
    updateAppointment,
    cancelAppointment,
    deleteAppointment
} from "../controllers/appointment.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

// GET /api/v1/appointments - Obtener todas las citas
router.get("/appointment", getAppointments);

// GET /api/v1/appointments/:id - Obtener cita por ID
router.get("/appointment/:id", getAppointmentById);

// GET /api/v1/appointments/customer/:id - Citas por cliente
router.get("/appointment/customer/:id", getAppointmentsByCustomer);


// =============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// =============================================

// POST /api/v1/appointments - Crear cita (requiere token)
router.post("/appointment", verifyToken, createAppointment);

// PUT /api/v1/appointments/:id - Actualizar cita (requiere token)
router.put("/appointment/:id", verifyToken, updateAppointment);

// PATCH /api/v1/appointments/:id/cancel - Cancelar cita (requiere token)
router.patch("/appointment/:id/cancel", verifyToken, cancelAppointment);

// DELETE /api/v1/appointments/:id - Eliminar cita (solo admin)
router.delete("/appointment/:id", verifyToken, isAdmin, deleteAppointment);

export default router;