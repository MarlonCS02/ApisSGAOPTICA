// src/controllers/optometrist.controller.js

import Optometrist from "../models/optometrist.model.js";
import User from "../models/user.model.js"; 
import DocumentType from "../models/documentType.model.js"; 

// ----------------------------------------------------
// UTILITY: Manejador de Errores para Consistencia
// ----------------------------------------------------
const handleSequelizeError = (res, error, defaultMessage) => {
    // 409 Conflict: Document number, professional card, or email already registered
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ 
            message: "Conflict: Document number, Professional Card, or Email is already registered.", 
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
    // 500 Internal Server Error para otros errores
    console.error("Sequelize Error:", error);
    return res.status(500).json({ 
        message: defaultMessage, 
        error: error.message
    });
};


// ----------- VER TODOS LOS OPTOMETRISTAS (GET) ----------------
export const getAllOptometrists = async (req, res) => {
    try {
        const optometrists = await Optometrist.findAll({
            include: [
                {
                    model: User,
                    as: "OptometristUserRef", // 👈 CLAVE
                    attributes: ["user_id", "user_user"]
                },
                {
                    model: DocumentType,
                    attributes: [
                        "id_doc_type",
                        "type_document",
                        "document_name",
                        "status"
                    ]
                }
            ]
        });

        res.json(optometrists);
    } catch (error) {
        handleSequelizeError(res, error, "Error fetching all optometrists");
    }
};



// ----------- VER OPTOMETRISTA POR ID (GET) ----------------
export const getOptometristById = async (req, res) => {
    try {
        const optometrist = await Optometrist.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: "OptometristUserRef",
                    attributes: ["user_id", "user_user"]
                },
                {
                    model: DocumentType,
                    attributes: [
                        "id_doc_type",
                        "type_document",
                        "document_name",
                        "status"
                    ]
                }
            ]
        });

        if (!optometrist) {
            return res.status(404).json({ message: "Optometrist not found" });
        }

        res.json(optometrist);
    } catch (error) {
        handleSequelizeError(res, error, "Error fetching optometrist by ID");
    }
};



// ----------- CREAR OPTOMETRISTA (POST) ----------------
export const createOptometrist = async (req, res) => {
    try {
        const { 
            idUser, 
            idDocType, 
            documentNumber, 
            firstName, 
            firstLastName, 
            professionalCardCode, // ✅ nombre correcto
            email 
        } = req.body; 

        if (!idUser || !idDocType || !documentNumber || !firstName || !firstLastName || !professionalCardCode) {
            return res.status(400).json({ 
                message: "Missing required fields" 
            });
        }

        const userExists = await User.findByPk(idUser);
        if (!userExists) {
            return res.status(400).json({ message: "User does not exist" });
        }

        const docExists = await DocumentType.findByPk(idDocType);
        if (!docExists) {
            return res.status(400).json({ message: "Document Type does not exist" });
        }

        const newOptometrist = await Optometrist.create({ 
            idUser,
            idDocType, 
            documentNumber, 
            firstName, 
            firstLastName, 
            professionalCardCode, // ✅ ahora sí
            email,
            is_active: true 
        });

        res.status(201).json(newOptometrist);

    } catch (error) {
        handleSequelizeError(res, error, "Error creating optometrist");
    }
};



// ----------- ACTUALIZAR OPTOMETRISTA (PUT) ----------------
export const updateOptometrist = async (req, res) => {
    try {
        const optometrist = await Optometrist.findByPk(req.params.id); 

        if (!optometrist) {
            return res.status(404).json({ message: "Optometrist not found" });
        }

        const updatedOptometrist = await optometrist.update(req.body); 

        res.status(200).json(updatedOptometrist);
    } catch (error) {
        handleSequelizeError(res, error, "Error updating optometrist");
    }
};


// ----------- BORRADO LÓGICO DE OPTOMETRISTA (DELETE) ----------------
export const deleteOptometrist = async (req, res) => {
    try {
        const optometrist = await Optometrist.findByPk(req.params.id); 

        if (!optometrist) {
            return res.status(404).json({ message: "Optometrist not found" });
        }

        // --- BORRADO LÓGICO: Actualiza is_active a falso ---
        await optometrist.update({ is_active: false });

        res.status(200).json({ message: "Optometrist deactivated successfully (Soft Deleted)" });
    } catch (error) {
        handleSequelizeError(res, error, "Error deactivating optometrist");
    }
};