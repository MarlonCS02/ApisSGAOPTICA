// src/controllers/report.controller.js
import { Op } from 'sequelize';
import Notification from '../models/notification.model.js';
import Appointment from '../models/appointment.model.js';
import Customer from '../models/customer.model.js';
import User from '../models/user.model.js';
import UserEntity from '../models/userEntity.model.js';

// ----------------------------------------------------
// 🛠️ Manejador de Errores
// ----------------------------------------------------
const handleSequelizeError = (res, error, defaultMessage) => {
    console.error("Error en Reporte:", error);
    return res.status(500).json({ 
        message: defaultMessage, 
        error: error.message 
    });
};

// ----------------------------------------------------
// REPORTE 1: Notificaciones de Citas por Rango de Fechas
// ----------------------------------------------------
export const getAppointmentNotificationsReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Validación de parámetros
        if (!startDate || !endDate) {
            return res.status(400).json({ 
                message: "Se requieren startDate y endDate" 
            });
        }

        // Validar que las fechas sean válidas
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start) || isNaN(end)) {
            return res.status(400).json({ 
                message: "Fechas inválidas" 
            });
        }

        // Buscar notificaciones relacionadas con citas en el rango de fechas
        const notifications = await Notification.findAll({
            where: {
                sent_at: {
                    [Op.between]: [start, end]
                },
                type: {
                    [Op.in]: ['APPOINTMENT_REMINDER', 'APPOINTMENT_CONFIRMED', 'APPOINTMENT_CANCELLED']
                }
            },
            include: [
                { 
                    model: Customer,
                    attributes: ['customer_id', 'firstName', 'firstLastName', 'phoneNumber', 'email']
                },
                { 
                    model: Appointment,
                    attributes: ['appointment_id', 'date', 'time', 'status']
                }
            ],
            order: [['sent_at', 'DESC']]
        });

        // Estadísticas del reporte
        const stats = {
            total: notifications.length,
            byType: {},
            byStatus: {},
            byMonth: {}
        };

        // Procesar estadísticas
        notifications.forEach(notif => {
            // Por tipo de notificación
            stats.byType[notif.type] = (stats.byType[notif.type] || 0) + 1;
            
            // Por estado de notificación
            stats.byStatus[notif.status] = (stats.byStatus[notif.status] || 0) + 1;
            
            // Por mes
            const month = new Date(notif.sent_at).toLocaleString('es-ES', { month: 'long', year: 'numeric' });
            stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
        });

        res.status(200).json({
            success: true,
            periodo: { 
                startDate: start.toISOString().split('T')[0], 
                endDate: end.toISOString().split('T')[0] 
            },
            estadisticas: stats,
            notificaciones: notifications,
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        handleSequelizeError(res, error, "Error al generar reporte de notificaciones");
    }
};

// ----------------------------------------------------
// REPORTE 2: Estado de Citas por Rango de Fechas
// ----------------------------------------------------
export const getAppointmentsStatusReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ 
                message: "Se requieren startDate y endDate" 
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Consultar citas directamente
        const appointments = await Appointment.findAll({
            where: {
                date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            include: [
                { 
                    model: Customer,
                    attributes: ['customer_id', 'firstName', 'firstLastName', 'phoneNumber']
                },
                {
                    model: User,
                    include: [{
                        model: UserEntity,
                        as: 'UserEntityInfo',
                        attributes: ['first_name', 'last_name']
                    }]
                }
            ],
            order: [['date', 'ASC'], ['time', 'ASC']]
        });

        // Estadísticas de citas
        const stats = {
            total: appointments.length,
            pendientes: appointments.filter(a => a.status === 'pendiente').length,
            confirmadas: appointments.filter(a => a.status === 'confirmada').length,
            completadas: appointments.filter(a => a.status === 'completada').length,
            canceladas: appointments.filter(a => a.status === 'cancelada').length,
            reagendadas: appointments.filter(a => a.status === 'reagendada').length
        };

        // Agrupar por fecha
        const byDate = {};
        appointments.forEach(apt => {
            const dateStr = apt.date;
            if (!byDate[dateStr]) {
                byDate[dateStr] = { 
                    total: 0, 
                    pendientes: 0, 
                    confirmadas: 0,
                    completadas: 0, 
                    canceladas: 0,
                    reagendadas: 0
                };
            }
            byDate[dateStr].total++;
            if (apt.status === 'pendiente') byDate[dateStr].pendientes++;
            if (apt.status === 'confirmada') byDate[dateStr].confirmadas++;
            if (apt.status === 'completada') byDate[dateStr].completadas++;
            if (apt.status === 'cancelada') byDate[dateStr].canceladas++;
            if (apt.status === 'reagendada') byDate[dateStr].reagendadas++;
        });

        // Agrupar por hora
        const byHour = {};
        appointments.forEach(apt => {
            const hour = apt.time?.split(':')[0] || '00';
            if (!byHour[hour]) byHour[hour] = 0;
            byHour[hour]++;
        });

        res.status(200).json({
            success: true,
            periodo: { startDate, endDate },
            resumen: stats,
            porFecha: byDate,
            porHora: byHour,
            detalles: appointments,
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        handleSequelizeError(res, error, "Error al generar reporte de citas");
    }
};

// ----------------------------------------------------
// REPORTE 3: Historial de Recordatorios Enviados
// ----------------------------------------------------
export const getRemindersHistory = async (req, res) => {
    try {
        const { customerId, limit = 50, startDate, endDate } = req.query;

        const whereCondition = {
            type: 'APPOINTMENT_REMINDER'
        };

        // Si se especifica un cliente, filtrar por él
        if (customerId && customerId !== 'undefined') {
            whereCondition.customer_id = customerId;
        }

        // Si se especifica rango de fechas
        if (startDate && endDate) {
            whereCondition.sent_at = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const reminders = await Notification.findAll({
            where: whereCondition,
            include: [
                { 
                    model: Customer,
                    attributes: ['customer_id', 'firstName', 'firstLastName', 'phoneNumber', 'email']
                },
                { 
                    model: Appointment,
                    attributes: ['appointment_id', 'date', 'time', 'status']
                }
            ],
            order: [['sent_at', 'DESC']],
            limit: parseInt(limit)
        });

        // Estadísticas de recordatorios
        const stats = {
            total: reminders.length,
            enviados: reminders.filter(r => r.status === 'SENT').length,
            pendientes: reminders.filter(r => r.status === 'PENDING').length,
            fallidos: reminders.filter(r => r.status === 'FAILED').length
        };

        res.status(200).json({
            success: true,
            total: reminders.length,
            estadisticas: stats,
            recordatorios: reminders,
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        handleSequelizeError(res, error, "Error al obtener historial de recordatorios");
    }
};
