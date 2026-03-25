// src/routers/notification.router.js
import express from "express";
import {
    getAllNotifications,
    getNotificationById,
    createNotification,
    updateNotification,
    markAsSent,
    markAsRead,
    getNotificationsByCustomer,
    deleteNotification,
    permanentDeleteNotification
} from "../controllers/notification.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { isAdminOrEmployee } from "../middlewares/isAdminOrEmployee.js";

const router = express.Router();

// GET - Todas las notificaciones (admin y empleado)
router.get("/notification", verifyToken, isAdminOrEmployee, getAllNotifications);

// GET - Notificación por ID (admin, empleado y el propio cliente con token)
router.get("/notification/:id", verifyToken, getNotificationById);

// GET - Notificaciones por cliente (admin, empleado y el propio cliente con token)
router.get("/notification/customer/:id", verifyToken, getNotificationsByCustomer);

// POST - Crear notificación (admin y empleado)
router.post("/notification", verifyToken, isAdminOrEmployee, createNotification);

// PUT - Actualizar notificación (admin y empleado)
router.put("/notification/:id", verifyToken, isAdminOrEmployee, updateNotification);

// PATCH - Marcar como enviada (admin y empleado)
router.patch("/notification/:id/sent", verifyToken, isAdminOrEmployee, markAsSent);

// PATCH - Marcar como leída (cualquier usuario logueado — el cliente marca las suyas)
router.patch("/notification/:id/read", verifyToken, markAsRead);

// DELETE - Soft delete (admin y empleado)
router.delete("/notification/:id", verifyToken, isAdminOrEmployee, deleteNotification);

// DELETE - Eliminar permanentemente (solo admin)
router.delete("/notification/:id/permanent", verifyToken, isAdmin, permanentDeleteNotification);

export default router;