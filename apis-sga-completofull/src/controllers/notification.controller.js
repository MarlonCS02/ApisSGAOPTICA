import Notification from "../models/notification.model.js";
import Customer from "../models/customer.model.js";
import Appointment from "../models/appointment.model.js";
import { Op } from "sequelize";

// ----------------------------------------------------
// UTILITY: Manejador de Errores
// ----------------------------------------------------
const handleSequelizeError = (res, error, defaultMessage) => {
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ 
            message: "Conflict: The data already exists.", 
            details: error.errors.map(err => err.message) 
        });
    }
    if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
            message: "Validation Error: Missing or incorrect data.", 
            details: error.errors.map(err => err.message) 
        });
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(409).json({ 
            message: "Conflict: Cannot perform the operation due to associated records.",
            details: "Verify that the Customer and Appointment exist."
        });
    }
    
    console.error("Sequelize Error:", error);
    return res.status(500).json({ 
        message: defaultMessage, 
        error: error.message
    });
};

// =============================================
// OBTENER TODAS LAS NOTIFICACIONES (con paginación)
// =============================================
export const getAllNotifications = async (req, res) => {
    try {
        const { type, status, page = 1, limit = 10 } = req.query;
        
        const whereCondition = {};
        if (type) whereCondition.type = type;
        if (status) whereCondition.status = status;
        
        const offset = (page - 1) * limit;

        const { count, rows } = await Notification.findAndCountAll({
            where: whereCondition,
            include: [
                {
                    model: Customer,
                    attributes: ["customer_id", "firstName", "firstLastName", "phoneNumber", "email"]
                },
                {
                    model: Appointment,
                    attributes: ["appointment_id", "date", "time", "status"],
                    required: false
                }
            ],
            order: [["sent_at", "DESC"]],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.status(200).json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            data: rows
        });

    } catch (error) {
        handleSequelizeError(res, error, "Error obtaining notifications");
    }
};

// =============================================
// OBTENER NOTIFICACIÓN POR ID
// =============================================
export const getNotificationById = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findByPk(id, {
            include: [
                {
                    model: Customer,
                    attributes: ["customer_id", "firstName", "firstLastName", "phoneNumber", "email"]
                },
                {
                    model: Appointment,
                    attributes: ["appointment_id", "date", "time", "status"],
                    required: false
                }
            ]
        });

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json(notification);

    } catch (error) {
        handleSequelizeError(res, error, "Error obtaining notification");
    }
};

// =============================================
// CREAR NOTIFICACIÓN
// =============================================
export const createNotification = async (req, res) => {
    try {
        const {
            customer_id,
            appointment_id,
            type,
            subject,
            message,
            status
        } = req.body;

        // 1. Validación de campos requeridos
        if (!customer_id || !message) {
            return res.status(400).json({ 
                message: "The fields 'customer_id' and 'message' are required" 
            });
        }

        // 2. Validar que el cliente existe
        const customerExists = await Customer.findByPk(customer_id);
        if (!customerExists) {
            return res.status(404).json({ message: "Customer not found" });
        }

        // 3. Validar que la cita existe (si se proporciona)
        if (appointment_id) {
            const appointmentExists = await Appointment.findByPk(appointment_id);
            if (!appointmentExists) {
                return res.status(404).json({ message: "Appointment not found" });
            }
        }

        // 4. Validar tipo de notificación válido
        const validTypes = ["SYSTEM", "APPOINTMENT_REMINDER", "APPOINTMENT_CANCELLED", "APPOINTMENT_CONFIRMED", "PROMOTION", "ALERT"];
        if (type && !validTypes.includes(type)) {
            return res.status(400).json({ 
                message: `Invalid notification type. Valid types: ${validTypes.join(", ")}` 
            });
        }

        // 5. Crear la notificación
        const newNotification = await Notification.create({
            customer_id,
            appointment_id: appointment_id || null,
            type: type || "SYSTEM",
            subject: subject || "System Notification",
            message,
            status: status || "PENDING"
        });

        // 6. Obtener notificación con relaciones
        const notificationWithRelations = await Notification.findByPk(newNotification.notification_id, {
            include: [
                { model: Customer, attributes: ["customer_id", "firstName", "firstLastName"] },
                { model: Appointment, attributes: ["appointment_id", "date", "time"], required: false }
            ]
        });

        res.status(201).json({
            message: "Notification created successfully",
            data: notificationWithRelations
        });

    } catch (error) {
        handleSequelizeError(res, error, "Error creating notification");
    }
};

// =============================================
// ACTUALIZAR NOTIFICACIÓN
// =============================================
export const updateNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, subject, message, status } = req.body;

        // Buscar la notificación
        const notification = await Notification.findByPk(id);
        if (!notification) {
            return res.status(404).json({ message: "Notificación no encontrada" });
        }

        // Validar tipo de notificación si se actualiza
        if (type) {
            const validTypes = ["SYSTEM", "APPOINTMENT_REMINDER", "APPOINTMENT_CANCELLED", "APPOINTMENT_CONFIRMED", "PROMOTION", "ALERT"];
            if (!validTypes.includes(type)) {
                return res.status(400).json({ 
                    message: `Invalid notification type. Valid types: ${validTypes.join(", ")}` 
                });
            }
        }

        // Validar estado si se actualiza
        if (status) {
            const validStatuses = ["PENDING", "SENT", "FAILED", "CANCELLED", "READ"];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ 
                    message: `Invalid status. Valid statuses: ${validStatuses.join(", ")}` 
                });
            }
        }

        // Preparar datos para actualizar
        const updateData = {};
        if (type !== undefined) updateData.type = type;
        if (subject !== undefined) updateData.subject = subject;
        if (message !== undefined) updateData.message = message;
        if (status !== undefined) updateData.status = status;

        // Actualizar
        await notification.update(updateData);

        // Obtener notificación actualizada con relaciones
        const updatedNotification = await Notification.findByPk(id, {
            include: [
                { model: Customer, attributes: ["customer_id", "firstName", "firstLastName"] },
                { model: Appointment, attributes: ["appointment_id", "date", "time"], required: false }
            ]
        });

        res.status(200).json({
            message: "Notification updated successfully",
            data: updatedNotification
        });

    } catch (error) {
        handleSequelizeError(res, error, "Error updating notification");
    }
};

// =============================================
// MARCAR NOTIFICACIÓN COMO ENVIADA
// =============================================
export const markAsSent = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findByPk(id);
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        await notification.update({
            status: "SENT",
            sent_at: new Date()
        });

        const updatedNotification = await Notification.findByPk(id, {
            include: [
                { model: Customer, attributes: ["customer_id", "firstName", "firstLastName"] }
            ]
        });

        res.status(200).json({
            message: "Notification marked as sent",
            data: updatedNotification
        });

    } catch (error) {
        handleSequelizeError(res, error, "Error marking notification as sent");
    }
};

// =============================================
// MARCAR NOTIFICACIÓN COMO LEÍDA
// =============================================
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findByPk(id);
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        await notification.update({ status: "READ" });

        res.status(200).json({
            message: "Notification marked as read",
            data: notification
        });

    } catch (error) {
        handleSequelizeError(res, error, "Error marking notification as read");
    }
};

// =============================================
// OBTENER NOTIFICACIONES POR CLIENTE
// =============================================
export const getNotificationsByCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, page = 1, limit = 10 } = req.query;

        // Verificar que el cliente existe
        const customerExists = await Customer.findByPk(id);
        if (!customerExists) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const whereCondition = { customer_id: id };
        if (status) whereCondition.status = status;

        const offset = (page - 1) * limit;

        const { count, rows } = await Notification.findAndCountAll({
            where: whereCondition,
            include: [
                { model: Appointment, attributes: ["appointment_id", "date", "time"], required: false }
            ],
            order: [["sent_at", "DESC"]],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.status(200).json({
            customer: {
                id: customerExists.customer_id,
                name: `${customerExists.firstName} ${customerExists.firstLastName}`
            },
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            noLeidas: rows.filter(n => n.status === "PENDING" || n.status === "SENT").length,
            data: rows
        });

    } catch (error) {
        handleSequelizeError(res, error, "Error obtaining notifications for the customer");
    }
};

// =============================================
// ELIMINAR NOTIFICACIÓN (Soft Delete)
// =============================================
export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findByPk(id);
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        // Soft delete: cambiar estado a CANCELLED
        await notification.update({ status: "CANCELLED" });

        res.status(200).json({
            message: "Notification deleted successfully",
            data: notification
        });

    } catch (error) {
        handleSequelizeError(res, error, "Error deleting notification");
    }
};

// =============================================
// ELIMINAR NOTIFICACIÓN PERMANENTEMENTE (solo admin)
// =============================================
export const permanentDeleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findByPk(id);
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        // Eliminación física
        await notification.destroy();

        res.status(200).json({
            message: "Notification deleted permanently"
        });

    } catch (error) {
        handleSequelizeError(res, error, "Error deleting notification permanently");
    }
};