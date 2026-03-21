// src/controllers/examType.controller.js
import ExamType from "../models/examType.model.js";

// ----------------------------------------------------
// UTILITY: Manejador de Errores para Consistencia
// ----------------------------------------------------
const handleSequelizeError = (res, error, defaultMessage) => {
    // 409 Conflict: Problemas de unicidad (e.g., duplicate name)
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ 
            message: "Conflict: The exam type name is already registered.", 
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
            message: "Conflict: Cannot delete this exam type. There are associated Appointments or Formulas that depend on it.", 
            details: "This Exam Type is currently in use."
        });
    }
    
    // 500 Internal Server Error para otros errores
    console.error("Sequelize Error:", error);
    return res.status(500).json({ 
        message: defaultMessage, 
        error: error.message
    });
};


// ----------- VER TODOS LOS TIPOS DE EXAMEN (GET) ----------------
export const getAllExamTypes = async (req, res) => {
    try {
        const examTypes = await ExamType.findAll();
        res.status(200).json(examTypes); 
    } catch (error) {
        handleSequelizeError(res, error, "Error fetching all exam types");
    }
};

// ----------- VER TIPO DE EXAMEN POR ID (GET) ----------------
export const getExamTypeById = async (req, res) => {
    try {
        // CORRECCIÓN: findByPK -> findByPk
        const examType = await ExamType.findByPk(req.params.id); 

        if (!examType) {
            return res.status(404).json({ message: "Exam Type not found" });
        }

        res.status(200).json(examType);
    } catch (error) {
        handleSequelizeError(res, error, "Error fetching exam type by ID");
    }
};

// ----------- CREAR TIPO DE EXAMEN (POST) ----------------
export const createExamType = async (req, res) => {
    try {
        const { name, description } = req.body; 

        if (!name) {
            return res.status(400).json({ message: "Missing required field: name." });
        }
        
        const newExamType = await ExamType.create({ name, description });

        res.status(201).json(newExamType); 
    } catch (error) {
        // Usa el handler unificado (capturará 409 por unicidad)
        handleSequelizeError(res, error, "Error creating exam type");
    }
};

// ----------- ACTUALIZAR TIPO DE EXAMEN (PUT) ----------------
export const updateExamType = async (req, res) => {
    try {
        // CORRECCIÓN: findByPK -> findByPk
        const examType = await ExamType.findByPk(req.params.id); 

        if (!examType) {
            return res.status(404).json({ message: "Exam Type not found" });
        }

        const updatedExamType = await examType.update(req.body); 

        res.status(200).json(updatedExamType);
    } catch (error) {
        // Usa el handler unificado
        handleSequelizeError(res, error, "Error updating exam type");
    }
};

// ----------- BORRAR TIPO DE EXAMEN (DELETE) ----------------
export const deleteExamType = async (req, res) => {
    try {
        // CORRECCIÓN: findByPK -> findByPk
        const examType = await ExamType.findByPk(req.params.id); 

        if (!examType) {
            return res.status(404).json({ message: "Exam Type not found" });
        }

        // Borrado Físico. El handler capturará el error FK (409) si hay dependencias.
        await examType.destroy(); 

        res.status(200).json({ message: "Exam Type deleted successfully" });
    } catch (error) {
        // Usa el handler unificado (capturará 409 por FK si es necesario)
        handleSequelizeError(res, error, "Error deleting exam type");
    }
};