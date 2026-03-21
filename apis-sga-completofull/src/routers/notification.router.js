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

const router = express.Router();

// GET /api/v1/notifications - Obtener todas las notificaciones
router.get("/notification", getAllNotifications);

// GET /api/v1/notifications/:id - Obtener notificación por ID
router.get("/notification/:id", getNotificationById);

// GET /api/v1/notifications/customer/:id - Notificaciones por cliente
router.get("/notification/customer/:id", getNotificationsByCustomer);

// POST /api/v1/notifications - Crear notificación
router.post("/notification", verifyToken, createNotification);

// PUT /api/v1/notifications/:id - Actualizar notificación
router.put("/notification/:id", verifyToken, updateNotification);

// PATCH /api/v1/notifications/:id/sent - Marcar como enviada
router.patch("/notification/:id/sent", verifyToken, markAsSent);

// PATCH /api/v1/notifications/:id/read - Marcar como leída
router.patch("/notification/:id/read", verifyToken, markAsRead);

// DELETE /api/v1/notifications/:id - Eliminar notificación (soft delete)
router.delete("/notification/:id", verifyToken, deleteNotification);

// DELETE /api/v1/notifications/:id/permanent - Eliminar permanentemente (solo admin)
router.delete("/notification/:id/permanent", verifyToken, isAdmin, permanentDeleteNotification);

export default router;