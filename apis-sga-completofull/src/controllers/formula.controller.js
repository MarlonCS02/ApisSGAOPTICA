// src/controllers/formula.controller.js
import Formula from "../models/formula.model.js";
import Customer from "../models/customer.model.js";
import User from "../models/user.model.js"; // Añadido para incluir la referencia 'uploadedBy'
import Optometrist from "../models/optometrist.model.js"; // Añadido para incluir la referencia 'uploadedBy'


// ----------------------------------------------------
// UTILITY: Manejador de Errores para Consistencia
// ----------------------------------------------------
const handleSequelizeError = (res, error, defaultMessage) => {
    // 409 Conflict: Problemas de unicidad (si aplica)
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ 
            message: "Conflict: The data is already registered.", 
            details: error.errors.map(err => err.message) 
        });
    }
    // 400 Bad Request: Fallo en la validación (e.g., campo nulo)
    if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
            message: "Validation failed: Missing or incorrect data.", 
            details: error.errors.map(err => err.message) 
        });
    }
    // 409 Conflict: Violación de Clave Foránea (Intentar borrar/actualizar FK)
    if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(409).json({ 
            message: "Conflict: Cannot perform operation due to associated records.", 
            details: "Please check related tables."
        });
    }
    
    // 500 Internal Server Error para otros errores
    console.error("Sequelize Error:", error);
    return res.status(500).json({ 
        message: defaultMessage, 
        error: error.message
    });
};


// ------ SUBIR FORMULA (Requiere middleware 'multer' o similar) ------ //
export const uploadFormula = async (req, res) => {
    try {
        const { customerId, uploadedById, description } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "Must upload a file (Formula document)." });
        }
        
        // 1. Validar cliente existente
        const customer = await Customer.findByPk(customerId);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        
        // 2. Validar usuario/optómetra que sube (opcional)
        if (uploadedById) {
            // Asumiendo que uploadedById es una FK a User o Optometrist. Aquí lo validamos como User por simplicidad.
            const uploader = await User.findByPk(uploadedById); 
            if (!uploader) {
                return res.status(404).json({ message: "Uploader User not found" });
            }
        }

        const file = req.file;

        // 3. Registrar fórmula
        const formula = await Formula.create({
            customerId,
            uploadedById: uploadedById || null,
            filePath: `/uploads/formulas/${file.filename}`,
            fileName: file.originalname,
            fileType: file.mimetype,
            uploadedAt: new Date(),
            description: description || null
            // Nota: Si la fórmula también guarda datos (esferas, cilindros), deben ir aquí.
        });

        res.status(201).json({
            message: "Formula uploaded successfully",
            formula
        });
    } catch (error) {
        handleSequelizeError(res, error, "Error uploading the formula");
    }
};
// --------------------------- //


// ------ VER FORMULAS (Con asociaciones para contexto) ------ //
export const getFormulas = async (req, res) => {
    try {
        const formulas = await Formula.findAll({
            // Incluye el cliente y la persona que subió el documento
            include: [
                { model: Customer },
                // La asociación debe estar definida en el modelo, asumiendo que se llama 'Uploader' o está en el modelo User/Optometrist
                { model: User, as: 'Uploader', attributes: ['user_id', 'user_user'] }, 
                // O si sube el Optometrist directamente:
                // { model: Optometrist, as: 'Optometrist', attributes: ['id', 'professionalCard'] } 
            ],
            order: [['uploadedAt', 'DESC']]
        });
        res.status(200).json(formulas);
    } catch (error) {
        handleSequelizeError(res, error, "Error fetching formulas");
    }
};
// -------------------------- //


// ------ VER FORMULA POR ID (Con asociaciones) ------ //
export const getFormulaById = async (req, res) => {
    try {
        const formula = await Formula.findByPk(req.params.id, {
            include: [
                { model: Customer },
                { model: User, as: 'Uploader', attributes: ['user_id', 'user_user'] },
            ],
        });

        if (!formula)
            return res.status(404).json({ message: "Formula not found" });

        res.status(200).json(formula);
    } catch (error) {
        handleSequelizeError(res, error, "Error fetching formula");
    }
};
// -------------------------------- //


// ------ VER FORMULAS POR ID DEL CLIENTE ------ //
export const getFormulasByCustomer = async (req, res) => {
    try {
        const formulas = await Formula.findAll({
            where: { customerId: req.params.customerId },
            order: [['uploadedAt', 'DESC']]
        });

        res.status(200).json(formulas);
    } catch (error) {
        handleSequelizeError(res, error, "Error fetching customer's formulas");
    }
};
// --------------------------------------------- //


// ------ BORRAR FORMULA ------ //
export const deleteFormula = async (req, res) => {
    // Nota: Un borrado físico (destroy) es aceptable aquí, pero el archivo físico en el servidor (filePath) DEBE borrarse manualmente.
    try {
        const formula = await Formula.findByPk(req.params.id);

        if (!formula)
            return res.status(404).json({ message: "Formula not found" });

        // Aquí debería ir la lógica para eliminar el archivo del sistema de archivos (fs.unlinkSync(formula.filePath))
        
        await formula.destroy();

        res.status(200).json({ message: "Formula deleted successfully" });
    } catch (error) {
        handleSequelizeError(res, error, "Error deleting formula");
    }
};
// ---------------------------- //