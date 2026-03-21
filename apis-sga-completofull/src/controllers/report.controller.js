import { Op } from "sequelize";
import Sale from "../models/sale.model.js";
import Appointment from "../models/appointment.model.js";
import Customer from "../models/customer.model.js";
import PaymentType from "../models/paymentType.model.js";
import Optometrist from "../models/optometrist.model.js";
import ExamType from "../models/examType.model.js";

// ----------------------------------------------------
// UTILITY: Manejador de Errores
// ----------------------------------------------------
const handleError = (res, error, defaultMessage) => {
    console.error("Error en reporte:", error);
    return res.status(500).json({ 
        message: defaultMessage, 
        error: error.message 
    });
};

// =============================================
// REPORTE DE VENTAS POR RANGO DE FECHAS
// =============================================
export const getSalesReportByDate = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Validación
        if (!startDate || !endDate) {
            return res.status(400).json({ 
                message: "the parameters 'startDate' and 'endDate' are required (format: YYYY-MM-DD)" 
            });
        }

        // Consulta a la tabla SALE (existente)
        const sales = await Sale.findAll({
            where: {
                dateSale: {
                    [Op.between]: [startDate, endDate]
                }
            },
            include: [
                { 
                    model: Customer, 
                    attributes: ["customer_id", "firstName", "firstLastName"] 
                },
                { 
                    model: PaymentType, 
                    attributes: ["id", "name"] 
                }
            ],
            order: [["dateSale", "ASC"]]
        });

        // Cálculo de estadísticas
        const totalSales = sales.length;
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
        const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

        // Agrupar por tipo de pago
        const byPaymentType = {};
        sales.forEach(sale => {
            const paymentName = sale.PaymentType?.name || "Not specified";
            byPaymentType[paymentName] = (byPaymentType[paymentName] || 0) + 1;
        });

        res.status(200).json({
            periodo: { startDate, endDate },
            resumen: {
                totalVentas: totalSales,
                ingresosTotales: totalRevenue,
                ticketPromedio: averageTicket
            },
            porTipoPago: byPaymentType,
            detalles: sales
        });

    } catch (error) {
        handleError(res, error, "Error generating sales report");
    }
};

// =============================================
// REPORTE DE CITAS POR RANGO DE FECHAS
// =============================================
export const getAppointmentsReportByDate = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ 
                message: "the parameters 'startDate' and 'endDate' are required" 
            });
        }

        // Consulta a la tabla APPOINTMENT (existente)
        const appointments = await Appointment.findAll({
            where: {
                date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            include: [
                { 
                    model: Customer, 
                    attributes: ["customer_id", "firstName", "firstLastName", "phoneNumber"] 
                },
                { 
                    model: Optometrist, 
                    attributes: ["id", "firstName", "firstLastName"] 
                },
                { 
                    model: ExamType, 
                    attributes: ["id", "name"] 
                }
            ],
            order: [["date", "ASC"], ["time", "ASC"]]
        });

        // Estadísticas por estado
        const byStatus = {
            pendientes: 0,
            completadas: 0,
            canceladas: 0
        };

        const byOptometrist = {};
        const byExamType = {};

        appointments.forEach(apt => {
            // Por estado
            byStatus[apt.status] = (byStatus[apt.status] || 0) + 1;
            
            // Por optómetra
            const optoName = apt.Optometrist ? `${apt.Optometrist.firstName} ${apt.Optometrist.firstLastName}` : "Not assigned";
            byOptometrist[optoName] = (byOptometrist[optoName] || 0) + 1;
            
            // Por tipo de examen
            const examName = apt.ExamType?.name || "Not specified";
            byExamType[examName] = (byExamType[examName] || 0) + 1;
        });

        res.status(200).json({
            periodo: { startDate, endDate },
            resumen: {
                totalCitas: appointments.length,
                porEstado: byStatus
            },
            porOptometra: byOptometrist,
            porTipoExamen: byExamType,
            detalles: appointments
        });

    } catch (error) {
        handleError(res, error, "Error generating appointments report");
    }
};

// =============================================
// REPORTE DE CITAS POR CLIENTE
// =============================================
export const getCustomerAppointmentsReport = async (req, res) => {
    try {
        const { customerId, startDate, endDate } = req.query;

        if (!customerId) {
            return res.status(400).json({ message: "The parameter 'customerId' is required" });
        }

        // Verificar que el cliente existe
        const customer = await Customer.findByPk(customerId, {
            attributes: ["customer_id", "firstName", "firstLastName", "phoneNumber", "email"]
        });

        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        // Construir condición WHERE
        const whereCondition = { customer_id: customerId };
        
        if (startDate && endDate) {
            whereCondition.date = {
                [Op.between]: [startDate, endDate]
            };
        }

        const appointments = await Appointment.findAll({
            where: whereCondition,
            include: [
                { model: Optometrist, attributes: ["firstName", "firstLastName"] },
                { model: ExamType, attributes: ["name", "description"] }
            ],
            order: [["date", "DESC"], ["time", "DESC"]]
        });

        // Estadísticas del cliente
        const stats = {
            total: appointments.length,
            completadas: appointments.filter(a => a.status === "completada").length,
            canceladas: appointments.filter(a => a.status === "cancelada").length,
            pendientes: appointments.filter(a => a.status === "pendiente").length
        };

        res.status(200).json({
            cliente: customer,
            periodo: startDate && endDate ? { startDate, endDate } : "All history",
            estadisticas: stats,
            citas: appointments
        });

    } catch (error) {
        handleError(res, error, "Error generating appointments report by customer");
    }
};

// =============================================
// REPORTE DE PRODUCTOS MÁS VENDIDOS
// =============================================
export const getTopProductsReport = async (req, res) => {
    try {
        const { startDate, endDate, limit = 10 } = req.query;

        // Importar modelos necesarios
        const SaleProduct = (await import("../models/saleProduct.model.js")).default;
        const Product = (await import("../models/product.model.js")).default;
        const Sale = (await import("../models/sale.model.js")).default;
        const sequelize = (await import("../config/connect.db.js")).default;

        // Construir condición de fecha
        const dateCondition = {};
        if (startDate && endDate) {
            dateCondition.dateSale = {
                [Op.between]: [startDate, endDate]
            };
        }

        const topProducts = await SaleProduct.findAll({
            attributes: [
                "productId",
                [sequelize.fn("SUM", sequelize.col("quantity")), "totalSold"],
                [sequelize.fn("SUM", sequelize.col("sellPrice")), "totalRevenue"],
                [sequelize.fn("COUNT", sequelize.col("saleId")), "numberOfSales"]
            ],
            include: [
                { 
                    model: Product, 
                    attributes: ["id", "nameProduct", "unitPrice", "stock"] 
                },
                { 
                    model: Sale,
                    where: dateCondition,
                    attributes: [],
                    required: startDate && endDate // Si hay fechas, hacer INNER JOIN
                }
            ],
            group: ["productId", "Product.id"],
            order: [[sequelize.literal("totalSold"), "DESC"]],
            limit: parseInt(limit),
            subQuery: false
        });

        res.status(200).json({
            periodo: startDate && endDate ? { startDate, endDate } : "All times",
            totalProductos: topProducts.length,
            productos: topProducts
        });

    } catch (error) {
        handleError(res, error, "Error generating top products report");
    }
};