// src/routers/appointment.router.js
import express from "express";
import {
    createAppointment,
    getAppointments,
    getAppointmentById,
    getAppointmentsByCustomer,
    getAppointmentsByOptometrist,
    updateAppointment,
    cancelAppointment,
    deleteAppointment
} from "../controllers/appointment.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { isAdminOrEmployee } from "../middlewares/isAdminOrEmployee.js";

const router = express.Router();

// =============================================
// RUTAS PÚBLICAS (ver citas no requiere login)
// =============================================

// GET /api/v1/appointment - Todas las citas
router.get("/appointment", getAppointments);

// GET /api/v1/appointment/:id - Cita por ID
router.get("/appointment/:id", getAppointmentById);

// GET /api/v1/appointment/customer/:id - Citas por cliente
router.get("/appointment/customer/:id", getAppointmentsByCustomer);

// GET /api/v1/appointment/optometrist/:id - Citas por optómetra
router.get("/appointment/optometrist/:id", getAppointmentsByOptometrist);


// =============================================
// RUTAS PROTEGIDAS
// =============================================

// POST - Crear cita
// Pueden: administrador, empleado, cliente (cualquier usuario logueado)
// NO pueden: optómetra (el optómetra atiende citas, no las agenda)
router.post("/appointment", verifyToken, createAppointment);

// PUT - Actualizar cita (solo admin o empleado)
router.put("/appointment/:id", verifyToken, isAdminOrEmployee, updateAppointment);

// PATCH - Cancelar cita (admin, empleado y cliente — el cliente cancela la suya)
router.patch("/appointment/:id/cancel", verifyToken, cancelAppointment);

// DELETE - Eliminar cita permanentemente (solo admin)
router.delete("/appointment/:id", verifyToken, isAdmin, deleteAppointment);

export default router;