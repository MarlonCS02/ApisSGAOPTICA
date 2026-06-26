// src/controllers/formula.controller.js
import Formula     from "../models/formula.model.js";
import Customer    from "../models/customer.model.js";
import User        from "../models/user.model.js";
import Appointment from "../models/appointment.model.js";

// ── Manejador de errores Sequelize ──────────────────────────────────────────
const handleSequelizeError = (res, error, defaultMessage) => {
    console.error("Error:", error);
    if (error.name === 'SequelizeUniqueConstraintError')
        return res.status(409).json({ message: "Conflict: dato ya registrado.", details: error.errors.map(e => e.message) });
    if (error.name === 'SequelizeValidationError')
        return res.status(400).json({ message: "Validación fallida.", details: error.errors.map(e => e.message) });
    if (error.name === 'SequelizeForeignKeyConstraintError')
        return res.status(409).json({ message: "Conflicto de clave foránea.", details: "Verifica registros relacionados." });
    return res.status(500).json({ message: defaultMessage, error: error.message });
};

// ── ADMIN/OPTÓMETRA: Subir fórmula de un cliente específico ─────────────────
export const uploadFormula = async (req, res) => {
    try {
        const { customerId, uploadedById, description } = req.body;

        if (!req.file)
            return res.status(400).json({ message: "Debes subir un archivo (fórmula)." });

        const customer = await Customer.findByPk(customerId);
        if (!customer)
            return res.status(404).json({ message: "Cliente no encontrado." });

        const formula = await Formula.create({
            customerId,
            uploadedById: uploadedById || req.user.user_id,
            filePath:     `/uploads/formulas/${req.file.filename}`,
            fileName:     req.file.originalname,
            fileType:     req.file.mimetype,
            uploadedAt:   new Date(),
            description:  description || null
        });

        return res.status(201).json({ message: "Fórmula subida exitosamente.", formula });
    } catch (error) {
        handleSequelizeError(res, error, "Error al subir la fórmula.");
    }
};

// ── CLIENTE: Subir su propia fórmula visual ─────────────────────────────────
export const uploadMyFormula = async (req, res) => {
    try {
        const { user_id } = req.user;
        const { description } = req.body;

        if (!req.file)
            return res.status(400).json({ message: "Debes subir un archivo (fórmula)." });

        // Buscar el perfil de cliente asociado al usuario logueado
        const customer = await Customer.findOne({ where: { idUser: user_id } });
        if (!customer)
            return res.status(404).json({ 
                message: "No se encontró un perfil de cliente para este usuario. Contacta al administrador." 
            });

        const formula = await Formula.create({
            customerId:   customer.customer_id,
            uploadedById: user_id,
            filePath:     `/uploads/formulas/${req.file.filename}`,
            fileName:     req.file.originalname,
            fileType:     req.file.mimetype,
            uploadedAt:   new Date(),
            description:  description || null
        });

        return res.status(201).json({ message: "Fórmula subida exitosamente.", formula });
    } catch (error) {
        handleSequelizeError(res, error, "Error al subir tu fórmula.");
    }
};

// ── CLIENTE: Ver sus propias fórmulas ───────────────────────────────────────
export const getMyFormulas = async (req, res) => {
    try {
        const { user_id } = req.user;

        const customer = await Customer.findOne({ where: { idUser: user_id } });
        if (!customer)
            return res.status(404).json({ message: "Perfil de cliente no encontrado." });

        const formulas = await Formula.findAll({
            where: { customerId: customer.customer_id },
            order: [['uploadedAt', 'DESC']]
        });

        return res.status(200).json(formulas);
    } catch (error) {
        handleSequelizeError(res, error, "Error al obtener tus fórmulas.");
    }
};

// ── ADMIN/OPTÓMETRA: Ver todas las fórmulas ─────────────────────────────────
export const getFormulas = async (req, res) => {
    try {
        const formulas = await Formula.findAll({
            include: [
                { model: Customer },
                { model: User, as: 'Uploader', attributes: ['user_id', 'user_user'] }
            ],
            order: [['uploadedAt', 'DESC']]
        });
        return res.status(200).json(formulas);
    } catch (error) {
        handleSequelizeError(res, error, "Error al obtener fórmulas.");
    }
};

// ── OPTÓMETRA: Fórmulas con info de clientes y sus citas ───────────────────
export const getFormulasWithCustomerInfo = async (req, res) => {
    try {
        const formulas = await Formula.findAll({
            include: [{ model: Customer }],
            order: [['uploadedAt', 'DESC']]
        });

        // Para cada fórmula obtener las citas del cliente
        // Nota: el campo real en Appointment es "date" y "time" (no appointmentDate)
        const result = await Promise.all(
            formulas.map(async (formula) => {
                const appointments = await Appointment.findAll({
                    where: { customer_id: formula.customerId },
                    order: [['date', 'DESC']],
                    limit: 5
                });
                return {
                    ...formula.toJSON(),
                    appointments
                };
            })
        );

        return res.status(200).json(result);
    } catch (error) {
        handleSequelizeError(res, error, "Error al obtener fórmulas con info de clientes.");
    }
};

// ── Ver fórmula por ID ───────────────────────────────────────────────────────
export const getFormulaById = async (req, res) => {
    try {
        const formula = await Formula.findByPk(req.params.id, {
            include: [
                { model: Customer },
                { model: User, as: 'Uploader', attributes: ['user_id', 'user_user'] }
            ]
        });
        if (!formula)
            return res.status(404).json({ message: "Fórmula no encontrada." });
        return res.status(200).json(formula);
    } catch (error) {
        handleSequelizeError(res, error, "Error al obtener la fórmula.");
    }
};

// ── Ver fórmulas por ID del cliente ─────────────────────────────────────────
export const getFormulasByCustomer = async (req, res) => {
    try {
        const formulas = await Formula.findAll({
            where: { customerId: req.params.customerId },
            order: [['uploadedAt', 'DESC']]
        });
        return res.status(200).json(formulas);
    } catch (error) {
        handleSequelizeError(res, error, "Error al obtener fórmulas del cliente.");
    }
};

// ── Eliminar fórmula (admin) ─────────────────────────────────────────────────
export const deleteFormula = async (req, res) => {
    try {
        const formula = await Formula.findByPk(req.params.id);
        if (!formula)
            return res.status(404).json({ message: "Fórmula no encontrada." });
        await formula.destroy();
        return res.status(200).json({ message: "Fórmula eliminada exitosamente." });
    } catch (error) {
        handleSequelizeError(res, error, "Error al eliminar la fórmula.");
    }
};