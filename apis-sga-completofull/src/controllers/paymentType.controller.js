// src/controllers/paymentType.controller.js
import PaymentType from "../models/paymentType.model.js";

// ----------------------------------------------------
// UTILITY: Manejador de Errores para Consistencia
// ----------------------------------------------------
const handleSequelizeError = (res, error, defaultMessage) => {
    // 409 Conflict: Problemas de unicidad (e.g., duplicate name)
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ 
            message: "Conflict: The payment type name is already registered.", 
            details: error.errors.map(err => err.message) 
        });
    }
    // 400 Bad Request: Fallo en la validación (allowNull: false)
    if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
            message: "Validation failed: Missing or incorrect data.", 
            details: error.errors.map(err => err.message) 
        });
    }
    // 409 Conflict: Violación de Clave Foránea (Intentar borrar una FK usada)
    if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(409).json({ 
            message: "Conflict: Cannot delete this payment type. There are associated sales that depend on it.", 
            details: "This Payment Type is currently in use."
        });
    }
    
    // 500 Internal Server Error para otros errores
    console.error("Sequelize Error:", error);
    return res.status(500).json({ 
        message: defaultMessage, 
        error: error.message
    });
};


// ----------- VER TODOS LOS TIPOS DE PAGO (GET) ----------------
export const getAllPaymentTypes = async (req, res) => {
    try {
        const paymentTypes = await PaymentType.findAll();
        res.status(200).json(paymentTypes); 
    } catch (error) {
        handleSequelizeError(res, error, "Error fetching all payment types");
    }
};

// ----------- VER TIPO DE PAGO POR ID (GET) ----------------
export const getPaymentTypeById = async (req, res) => {
    try {
        // CORRECCIÓN: findByPK -> findByPk
        const paymentType = await PaymentType.findByPk(req.params.id); 

        if (!paymentType) {
            return res.status(404).json({ message: "Payment Type not found" });
        }

        res.status(200).json(paymentType);
    } catch (error) {
        handleSequelizeError(res, error, "Error fetching payment type by ID");
    }
};

// ----------- CREAR TIPO DE PAGO (POST) ----------------
export const createPaymentType = async (req, res) => {
    try {
        const { name } = req.body; 

        if (!name) {
            return res.status(400).json({ message: "Missing required field: name." });
        }
        
        const newPaymentType = await PaymentType.create({ name });

        res.status(201).json(newPaymentType); 
    } catch (error) {
        // Usa el handler unificado
        handleSequelizeError(res, error, "Error creating payment type");
    }
};

// ----------- ACTUALIZAR TIPO DE PAGO (PUT) ----------------
export const updatePaymentType = async (req, res) => {
    try {
        // CORRECCIÓN: findByPK -> findByPk
        const paymentType = await PaymentType.findByPk(req.params.id); 

        if (!paymentType) {
            return res.status(404).json({ message: "Payment Type not found" });
        }

        const updatedPaymentType = await paymentType.update(req.body); 

        res.status(200).json(updatedPaymentType);
    } catch (error) {
        // Usa el handler unificado
        handleSequelizeError(res, error, "Error updating payment type");
    }
};

// ----------- BORRAR TIPO DE PAGO (DELETE) ----------------
export const deletePaymentType = async (req, res) => {
    try {
        // CORRECCIÓN: findByPK -> findByPk
        const paymentType = await PaymentType.findByPk(req.params.id); 

        if (!paymentType) {
            return res.status(404).json({ message: "Payment Type not found" });
        }

        // Si hay FKs, Sequelize lanzará SequelizeForeignKeyConstraintError,
        // el cual es capturado por nuestro handler unificado (409).
        await paymentType.destroy(); 

        res.status(200).json({ message: "Payment Type deleted successfully" });
    } catch (error) {
        // Usa el handler unificado (capturará 409 por FK si es necesario)
        handleSequelizeError(res, error, "Error deleting payment type");
    }
};