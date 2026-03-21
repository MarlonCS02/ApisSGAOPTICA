// src/controllers/documentType.controller.js
import DocumentType from "../models/documentType.model.js";

// ----------------------------------------------------
// UTILITY: Manejador de Errores para Consistencia
// ----------------------------------------------------
const handleSequelizeError = (res, error, defaultMessage) => {
    // 409 Conflict: Problemas de unicidad (e.g., duplicate document_name)
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ 
            message: "Conflict: The document type is already registered (Unique constraint failed).", 
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
    // 409 Conflict: Violación de Clave Foránea (Intentar borrar físicamente una FK usada)
    if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(409).json({ 
            message: "Conflict: Cannot delete this type due to associated records (Customers, Optometrists).", 
            details: "This Document Type is currently in use."
        });
    }
    
    // 500 Internal Server Error para otros errores
    console.error("Sequelize Error:", error);
    return res.status(500).json({ 
        message: defaultMessage, 
        error: error.message
    });
};


// ----------- VER TODOS LOS TIPOS DE DOCUMENTO (GET) ----------------
export const getAllDocumentTypes = async (req, res) => {
    try {
        const documentTypes = await DocumentType.findAll({
            attributes: ['type_document', 'document_name', 'status']
        });
        // Respuesta limpia con status 200
        res.status(200).json(documentTypes); 
    } catch (error) {
        handleSequelizeError(res, error, "Error fetching all document types");
    }
};

// ----------- VER TIPO DE DOCUMENTO POR ID (GET) ----------------
export const getDocumentTypeById = async (req, res) => {
    try {
        const documentType = await DocumentType.findByPk(req.params.id);

        if (!documentType) {
            return res.status(404).json({ message: "Document Type not found" });
        }

        res.status(200).json(documentType);
    } catch (error) {
        handleSequelizeError(res, error, "Error fetching document type by ID");
    }
};

// ----------- CREAR TIPO DE DOCUMENTO (POST) ----------------
export const createDocumentType = async (req, res) => {
    try {
        const { type_document, document_name, status } = req.body;

        // Validaciones manuales (opcional, para dar 400 inmediato)
        if (!type_document || !document_name) {
            return res.status(400).json({
                message: "Missing required fields: type_document and document_name."
            });
        }

        const newDocumentType = await DocumentType.create({
            type_document,
            document_name,
            status: status || "ACTIVE"
        });

        res.status(201).json(newDocumentType);
    } catch (error) {
        // Usa el handler unificado para unicidad (409) y validación (400)
        handleSequelizeError(res, error, "Error creating document type");
    }
};

// ----------- ACTUALIZAR TIPO DE DOCUMENTO (PUT) ----------------
export const updateDocumentType = async (req, res) => {
    try {
        const documentType = await DocumentType.findByPk(req.params.id);

        if (!documentType) {
            return res.status(404).json({ message: "Document Type not found" });
        }

        const updatedDocumentType = await documentType.update(req.body);

        res.status(200).json(updatedDocumentType);
    } catch (error) {
        // Usa el handler unificado para unicidad (409) y validación (400)
        handleSequelizeError(res, error, "Error updating document type");
    }
};

// ----------- BORRADO LÓGICO DE TIPO DE DOCUMENTO (DELETE) ----------------
export const deleteDocumentType = async (req, res) => {
    try {
        const documentType = await DocumentType.findByPk(req.params.id);

        if (!documentType) {
            return res.status(404).json({ message: "Document Type not found" });
        }

        // --- BORRADO LÓGICO: Actualiza status a INACTIVE ---
        await documentType.update({ status: "INACTIVE" }); 

        res.status(200).json({ message: "Document Type deactivated successfully (Soft Deleted)" });
    } catch (error) {
        // Usa el handler unificado
        handleSequelizeError(res, error, "Error deactivating document type");
    }
};