// src/controllers/appointment.controller.js
import Appointment from "../models/appointment.model.js";
import Customer from "../models/customer.model.js";
import Optometrist from "../models/optometrist.model.js";
import ExamType from "../models/examType.model.js";
import Notification from "../models/notification.model.js";
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
            details: "Verify that the Customer, Optometrist and Exam Type exist."
        });
    }
    
    console.error("Sequelize Error:", error);
    return res.status(500).json({ 
        message: defaultMessage, 
        error: error.message
    });
};

// =============================================
// FUNCIÓN AUXILIAR: Crear recordatorio
// =============================================
const createAppointmentReminder = async (appointment) => {
    try {
        const customer = await Customer.findByPk(appointment.customer_id, {
            attributes: ['firstName', 'firstLastName']
        });
        
        const customerName = `${customer.firstName} ${customer.firstLastName}`;
        const appointmentDate = new Date(appointment.date);
        const formattedDate = appointmentDate.toLocaleDateString('es-CO');
        
        const reminder = await Notification.create({
            customer_id: appointment.customer_id,
            appointment_id: appointment.appointment_id,
            type: "APPOINTMENT_REMINDER",
            subject: "Appointment Reminder",
            message: `Hola ${customerName}, te recordamos que tienes una cita programada para el día ${formattedDate} a las ${appointment.time}. Por favor confirma tu asistencia.`,
            status: "PENDING"
        });
        
        return reminder;
    } catch (error) {
        console.error("Error creating reminder:", error);
        return null;
    }
};

// =============================================
// CREAR CITA
// =============================================
export const createAppointment = async (req, res) => {
    try {
        const { date, time, customer_id, exam_type_id, optometrist_id } = req.body;

        if (!date || !time || !customer_id || !exam_type_id || !optometrist_id) {
            return res.status(400).json({ 
                message: "All fields are required: date, time, customer, exam type and optometrist" 
            });
        }

        const today = new Date().toISOString().split('T')[0];
        if (date < today) {
            return res.status(400).json({ message: "Cannot create appointments in past dates" });
        }

        const customerExists = await Customer.findByPk(customer_id);
        if (!customerExists) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const optometristExists = await Optometrist.findByPk(optometrist_id);
        if (!optometristExists) {
            return res.status(404).json({ message: "Optometrist not found" });
        }

        const examTypeExists = await ExamType.findByPk(exam_type_id);
        if (!examTypeExists) {
            return res.status(404).json({ message: "Exam type not found" });
        }

        const conflict = await Appointment.findOne({
            where: {
                optometrist_id,
                date,
                time,
                status: { [Op.ne]: "cancelada" }
            }
        });

        if (conflict) {
            return res.status(409).json({ 
                message: "Schedule conflict: The optometrist already has an appointment at that date and time" 
            });
        }

        const newAppointment = await Appointment.create({
            date,
            time,
            customer_id,
            exam_type_id,
            optometrist_id,
            status: "pendiente"
        });

        await createAppointmentReminder(newAppointment);

        const appointmentWithRelations = await Appointment.findByPk(newAppointment.appointment_id, {
            include: [
                { model: Customer, attributes: ["customer_id", "firstName", "firstLastName", "phoneNumber"] },
                { model: Optometrist, attributes: ["id", "firstName", "firstLastName", "professionalCardCode"] },
                { model: ExamType, attributes: ["id", "name", "description"] }
            ]
        });

        res.status(201).json({
            message: "Appointment created successfully. A reminder has been generated and is pending.",
            data: appointmentWithRelations
        });

    } catch (error) {
        handleSequelizeError(res, error, "Error creating appointment");
    }
};

// =============================================
// OBTENER TODAS LAS CITAS
// =============================================
export const getAppointments = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        
        const whereCondition = status ? { status } : {};
        const offset = (page - 1) * limit;

        const { count, rows } = await Appointment.findAndCountAll({
            where: whereCondition,
            include: [
                { model: Customer, attributes: ["customer_id", "firstName", "firstLastName", "phoneNumber"] },
                { model: Optometrist, attributes: ["id", "firstName", "firstLastName", "professionalCardCode"] },
                { model: ExamType, attributes: ["id", "name", "description"] }
            ],
            order: [["date", "ASC"], ["time", "ASC"]],
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
        handleSequelizeError(res, error, "Error obtaining appointments");
    }
};

// =============================================
// OBTENER CITA POR ID
// =============================================
export const getAppointmentById = async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findByPk(id, {
            include: [
                { model: Customer, attributes: ["customer_id", "firstName", "firstLastName", "phoneNumber", "email"] },
                { model: Optometrist, attributes: ["id", "firstName", "firstLastName", "professionalCardCode"] },
                { model: ExamType, attributes: ["id", "name", "description"] }
            ]
        });

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        res.status(200).json(appointment);

    } catch (error) {
        handleSequelizeError(res, error, "Error obtaining appointment");
    }
};

// =============================================
// OBTENER CITAS POR CLIENTE
// =============================================
export const getAppointmentsByCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const customerExists = await Customer.findByPk(id);
        if (!customerExists) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await Appointment.findAndCountAll({
            where: { customer_id: id },
            include: [
                { model: Optometrist, attributes: ["id", "firstName", "firstLastName", "professionalCardCode"] },
                { model: ExamType, attributes: ["id", "name", "description"] }
            ],
            order: [["date", "DESC"], ["time", "DESC"]],
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
            data: rows
        });

    } catch (error) {
        handleSequelizeError(res, error, "Error obtaining customer's appointments");
    }
};

// =============================================
// ACTUALIZAR CITA
// =============================================
export const updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, time, customer_id, exam_type_id, optometrist_id, status } = req.body;

        const appointment = await Appointment.findByPk(id);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        if (appointment.status === "cancelada") {
            return res.status(400).json({ message: "Cannot modify a cancelled appointment" });
        }

        if (customer_id) {
            const customerExists = await Customer.findByPk(customer_id);
            if (!customerExists) return res.status(404).json({ message: "Customer not found" });
        }

        if (optometrist_id) {
            const optometristExists = await Optometrist.findByPk(optometrist_id);
            if (!optometristExists) return res.status(404).json({ message: "Optometrist not found" });
        }

        if (exam_type_id) {
            const examTypeExists = await ExamType.findByPk(exam_type_id);
            if (!examTypeExists) return res.status(404).json({ message: "Exam type not found" });
        }

        if ((date && date !== appointment.date) || 
            (time && time !== appointment.time) || 
            (optometrist_id && optometrist_id !== appointment.optometrist_id)) {
            
            const conflict = await Appointment.findOne({
                where: {
                    optometrist_id: optometrist_id || appointment.optometrist_id,
                    date: date || appointment.date,
                    time: time || appointment.time,
                    status: { [Op.ne]: "cancelada" },
                    appointment_id: { [Op.ne]: id }
                }
            });

            if (conflict) {
                return res.status(409).json({ 
                    message: "Schedule conflict: The optometrist already has an appointment at that date and time" 
                });
            }
        }

        const updateData = {};
        if (date !== undefined) updateData.date = date;
        if (time !== undefined) updateData.time = time;
        if (customer_id !== undefined) updateData.customer_id = customer_id;
        if (exam_type_id !== undefined) updateData.exam_type_id = exam_type_id;
        if (optometrist_id !== undefined) updateData.optometrist_id = optometrist_id;
        if (status !== undefined) updateData.status = status;

        await appointment.update(updateData);

        const updatedAppointment = await Appointment.findByPk(id, {
            include: [
                { model: Customer, attributes: ["customer_id", "firstName", "firstLastName"] },
                { model: Optometrist, attributes: ["id", "firstName", "firstLastName"] },
                { model: ExamType, attributes: ["id", "name"] }
            ]
        });

        res.status(200).json({
            message: "Appointment updated successfully",
            data: updatedAppointment
        });

    } catch (error) {
        handleSequelizeError(res, error, "Error updating the appointment");
    }
};

// =============================================
// CANCELAR CITA
// =============================================
export const cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findByPk(id);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        if (appointment.status === "cancelada") {
            return res.status(400).json({ message: "The appointment is already cancelled" });
        }

        if (appointment.status === "completada") {
            return res.status(400).json({ message: "The appointment is already completed" });
        }

        const today = new Date().toISOString().split('T')[0];
        if (appointment.date < today) {
            return res.status(400).json({ message: "Cannot cancel an appointment from a past date" });
        }

        await Notification.update(
            { 
                status: "CANCELLED"
            },
            { 
                where: { 
                    appointment_id: id,
                    type: "APPOINTMENT_REMINDER"
                } 
            }
        );

        await appointment.update({ status: "cancelada" });

        const cancelledAppointment = await Appointment.findByPk(id, {
            include: [
                { model: Customer, attributes: ["firstName", "firstLastName"] },
                { model: Optometrist, attributes: ["firstName", "firstLastName"] }
            ]
        });

        res.status(200).json({
            message: "Appointment cancelled successfully. The associated reminders have been cancelled.",
            data: cancelledAppointment
        });

    } catch (error) {
        handleSequelizeError(res, error, "Error cancelling the appointment");
    }
};

// =============================================
// REENVIAR RECORDATORIO
// =============================================
export const resendReminder = async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findByPk(id, {
            include: [
                { model: Customer, attributes: ["customer_id", "firstName", "firstLastName", "phoneNumber"] }
            ]
        });

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        if (appointment.status === "cancelada") {
            return res.status(400).json({ message: "Cannot send reminder for a cancelled appointment" });
        }

        if (appointment.status === "completada") {
            return res.status(400).json({ message: "Cannot send reminder for a completed appointment" });
        }

        const customerName = `${appointment.Customer.firstName} ${appointment.Customer.firstLastName}`;
        const appointmentDate = new Date(appointment.date);
        const formattedDate = appointmentDate.toLocaleDateString('es-CO');

        const newReminder = await Notification.create({
            customer_id: appointment.customer_id,
            appointment_id: appointment.appointment_id,
            type: "APPOINTMENT_REMINDER",
            subject: "Appointment Reminder (RESEND)",
            message: `Hola ${customerName}, te recordamos que tienes una cita programada para el día ${formattedDate} a las ${appointment.time}. Por favor confirma tu asistencia. Este es un reenvío de recordatorio.`,
            status: "PENDING"
        });

        res.status(200).json({
            message: "Reminder resent successfully",
            data: newReminder
        });

    } catch (error) {
        handleSequelizeError(res, error, "Error resending the reminder");
    }
};

// =============================================
// OBTENER RECORDATORIOS DE UNA CITA
// =============================================
export const getAppointmentReminders = async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findByPk(id);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        const reminders = await Notification.findAll({
            where: {
                appointment_id: id,
                type: "APPOINTMENT_REMINDER"
            },
            include: [
                { model: Customer, attributes: ["firstName", "firstLastName", "phoneNumber"] }
            ],
            order: [["sent_at", "DESC"]]
        });

        res.status(200).json({
            appointment: {
                id: appointment.appointment_id,
                date: appointment.date,
                time: appointment.time,
                status: appointment.status
            },
            totalRecordatorios: reminders.length,
            recordatorios: reminders
        });

    } catch (error) {
        handleSequelizeError(res, error, "Error obtaining reminders");
    }
};

// =============================================
// ELIMINAR CITA (DELETE - solo admins)
// =============================================
export const deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findByPk(id);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        if (appointment.status === "completada") {
            return res.status(400).json({ message: "Cannot delete a completed appointment" });
        }

        // Cancelar notificaciones asociadas
        await Notification.update(
            { status: "CANCELLED" },
            { where: { appointment_id: id } }
        );

        // Eliminar la cita
        await appointment.destroy();

        res.status(200).json({ 
            message: "Appointment deleted permanently",
            data: {
                id: appointment.appointment_id,
                date: appointment.date,
                time: appointment.time
            }
        });

    } catch (error) {
        handleSequelizeError(res, error, "Error deleting the appointment");
    }
};