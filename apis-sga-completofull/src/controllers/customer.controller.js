// src/controllers/customer.controller.js
import Customer from "../models/customer.model.js";
import User from "../models/user.model.js";
import DocumentType from "../models/documentType.model.js";

// ----------------------------------------------------
// UTILITY: Manejador de Errores para Consistencia
// ----------------------------------------------------
const handleSequelizeError = (res, error, defaultMessage) => {
    // 409 Conflict: Problemas de unicidad (documentNumber o email)
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ 
            message: "Conflict: The data is already registered (Document Number or Email).", 
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
    // 409 Conflict: Violación de Clave Foránea (Al intentar borrar un cliente con ventas/citas)
    if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(409).json({ 
            message: "Conflict: Cannot delete or update the customer due to associated records.", 
            details: "The customer has associated sales, appointments, or formulas."
        });
    }
    
    // 500 Internal Server Error para otros errores
    console.error("Sequelize Error:", error);
    return res.status(500).json({ 
        message: defaultMessage, 
        error: error.message
    });
};


// ---------------------------------------------------
// GET: Obtener todos los clientes (con asociaciones)
// ---------------------------------------------------
export const getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.findAll({
            include: [
                {
                    model: User,
                    as: "Creator", // 🔑 OBLIGATORIO
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

        return res.status(200).json(customers);
    } catch (error) {
        handleSequelizeError(res, error, "Error fetching all customers");
    }
};

// ---------------------------------------------------
// GET: Obtener cliente por ID (con asociaciones)
// ---------------------------------------------------
export const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;

        const customer = await Customer.findByPk(id, {
            include: [
                {
                    model: DocumentType,
                    attributes: ["id_doc_type", "type_document", "document_name"]
                },
                {
                    model: Appointment,
                    include: [
                        {
                            model: Optometrist,
                            attributes: ["id", "first_name"] // ✅ SIN professionalCard
                        },
                        {
                            model: ExamType,
                            attributes: ["id", "name"]
                        }
                    ],
                    order: [
                        ["date", "ASC"],
                        ["time", "ASC"]
                    ]
                }
            ]
        });

        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        return res.status(200).json(customer);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error fetching customer",
            error: error.message
        });
    }
};

// ---------------------------------------------------
// POST: Crear cliente
// ---------------------------------------------------
export const createCustomer = async (req, res) => {
    try {
        const {
            idUser, idDocType, documentNumber, firstName, secondName, 
            firstLastName, secondLastName, phoneNumber, email
        } = req.body;

        // Validaciones manuales (opcional, para dar 400 Bad Request más específico)
        if (!idUser || !idDocType || !documentNumber || !firstName || !firstLastName) {
             return res.status(400).json({ message: "Missing required fields (User, Document Type, Document Number, First Name, Last Name)." });
        }

        // 1. Verificar existencia de FK (User)
        const user = await User.findByPk(idUser);
        if (!user) {
            return res.status(400).json({ message: "The specified User (idUser) does not exist." });
        }

        // 2. Verificar existencia de FK (DocumentType)
        const doc = await DocumentType.findByPk(idDocType);
        if (!doc) {
            return res.status(400).json({ message: "The specified Document Type (idDocType) does not exist." });
        }

        // 3. Creación del cliente
        const newCustomer = await Customer.create({
            idUser, idDocType, documentNumber, firstName, secondName, 
            firstLastName, secondLastName, phoneNumber, email
        });

        // 201 Created
        return res.status(201).json(newCustomer);

    } catch (error) {
        // Usamos el handler unificado para errores de DB (unicidad, validación, etc.)
        handleSequelizeError(res, error, "Error creating customer");
    }
};

// ---------------------------------------------------
// PUT: Actualizar cliente
// ---------------------------------------------------
export const updateCustomer = async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id);

        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        // Sequilize actualizará y validará la unicidad/nulidad.
        const updatedCustomer = await customer.update(req.body);

        // 200 OK
        return res.status(200).json(updatedCustomer);

    } catch (error) {
        // Usamos el handler unificado
        handleSequelizeError(res, error, "Error updating customer");
    }
};

// ---------------------------------------------------
// DELETE: Eliminar cliente
// ---------------------------------------------------
export const deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id);

        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        // Sequelize intentará borrar. Si hay FKs (ventas, citas), fallará y tirará el error.
        await customer.destroy();

        // 200 OK
        return res.status(200).json({ message: "Customer deleted successfully" });

    } catch (error) {
        // El handler unificado capturará SequelizeForeignKeyConstraintError como 409
        handleSequelizeError(res, error, "Error deleting customer");
    }
};