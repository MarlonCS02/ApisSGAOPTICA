// src/controllers/customer.controller.js
import Customer from "../models/customer.model.js";
import User from "../models/user.model.js";
import UserEntity from "../models/userEntity.model.js";
import DocumentType from "../models/documentType.model.js";
import bcrypt from "bcryptjs";
import sequelize from "../config/connect.db.js";

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY: Manejador de errores Sequelize
// ─────────────────────────────────────────────────────────────────────────────
const handleSequelizeError = (res, error, defaultMessage) => {
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
            message: "Conflict: The data is already registered (Document Number or Email).",
            details: error.errors.map(err => err.message)
        });
    }
    if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
            message: "Validation failed: Missing or incorrect data.",
            details: error.errors.map(err => err.message)
        });
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(409).json({
            message: "Conflict: Cannot delete or update the customer due to associated records.",
            details: "The customer has associated sales, appointments, or formulas."
        });
    }
    console.error("Sequelize Error:", error);
    return res.status(500).json({ message: defaultMessage, error: error.message });
};

// ─────────────────────────────────────────────────────────────────────────────
// GET: Todos los clientes
// ─────────────────────────────────────────────────────────────────────────────
export const getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.findAll({
            include: [
                { model: User, as: "Creator", attributes: ["user_id", "user_user"] },
                { model: DocumentType, attributes: ["id_doc_type", "type_document", "document_name", "status"] }
            ]
        });
        return res.status(200).json(customers);
    } catch (error) {
        handleSequelizeError(res, error, "Error fetching all customers");
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET: Cliente por ID
// ─────────────────────────────────────────────────────────────────────────────
export const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await Customer.findByPk(id, {
            include: [
                { model: DocumentType, attributes: ["id_doc_type", "type_document", "document_name"] }
            ]
        });
        if (!customer) return res.status(404).json({ message: "Customer not found" });
        return res.status(200).json(customer);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error fetching customer", error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST: Crear cliente (admin/empleado)
// ─────────────────────────────────────────────────────────────────────────────
export const createCustomer = async (req, res) => {
    try {
        const { idUser, idDocType, documentNumber, firstName, secondName, firstLastName, secondLastName, phoneNumber, email } = req.body;

        if (!idUser || !idDocType || !documentNumber || !firstName || !firstLastName) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        const user = await User.findByPk(idUser);
        if (!user) return res.status(400).json({ message: "The specified User (idUser) does not exist." });

        const doc = await DocumentType.findByPk(idDocType);
        if (!doc) return res.status(400).json({ message: "The specified Document Type (idDocType) does not exist." });

        const newCustomer = await Customer.create({
            idUser, idDocType, documentNumber, firstName, secondName,
            firstLastName, secondLastName, phoneNumber, email
        });

        return res.status(201).json(newCustomer);
    } catch (error) {
        handleSequelizeError(res, error, "Error creating customer");
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT: Actualizar cliente por ID (admin/empleado)
// ─────────────────────────────────────────────────────────────────────────────
export const updateCustomer = async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id);
        if (!customer) return res.status(404).json({ message: "Customer not found" });
        const updatedCustomer = await customer.update(req.body);
        return res.status(200).json(updatedCustomer);
    } catch (error) {
        handleSequelizeError(res, error, "Error updating customer");
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE: Eliminar cliente
// ─────────────────────────────────────────────────────────────────────────────
export const deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id);
        if (!customer) return res.status(404).json({ message: "Customer not found" });
        await customer.destroy();
        return res.status(200).json({ message: "Customer deleted successfully" });
    } catch (error) {
        handleSequelizeError(res, error, "Error deleting customer");
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT: Actualizar perfil del cliente autenticado
// Ruta: PUT /api/v1/customer/profile
// Middleware: solo verifyToken — NO requiere isAdmin ni isAdminOrEmployee
// El cliente se identifica por el user_id dentro del JWT
//
// Campos de tabla Customer que puede actualizar:
//   firstName, secondName, firstLastName, secondLastName, phoneNumber, email
// Campos de tabla UserEntity:
//   address (dirección)
// Cambio de contraseña (tabla User):
//   currentPassword, newPassword, confirmNewPassword
// ─────────────────────────────────────────────────────────────────────────────
export const updateCustomerProfile = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.user.user_id;

        const {
            // Campos Customer
            firstName,
            secondName,
            firstLastName,
            secondLastName,
            phoneNumber,
            email,
            // Campo UserEntity
            address,
            // Cambio de contraseña
            currentPassword,
            newPassword,
            confirmNewPassword
        } = req.body;

        // 1. Buscar el customer del usuario autenticado
        const customer = await Customer.findOne({
            where: { idUser: userId },
            transaction: t
        });

        if (!customer) {
            await t.rollback();
            return res.status(404).json({ message: "No se encontró el perfil de cliente para este usuario." });
        }

        // 2. Actualizar campos Customer (solo los que llegan en el body)
        if (firstName      !== undefined) customer.firstName      = firstName;
        if (secondName     !== undefined) customer.secondName     = secondName;
        if (firstLastName  !== undefined) customer.firstLastName  = firstLastName;
        if (secondLastName !== undefined) customer.secondLastName = secondLastName;
        if (phoneNumber    !== undefined) customer.phoneNumber    = phoneNumber;
        if (email          !== undefined) customer.email          = email;

        await customer.save({ transaction: t });

        // 3. Sincronizar UserEntity (nombre, apellido, teléfono, dirección)
        let userEntity = await UserEntity.findOne({
            where: { user_id: userId },
            transaction: t
        });

        if (userEntity) {
            if (firstName     !== undefined) userEntity.first_name = firstName;
            if (firstLastName !== undefined) userEntity.last_name  = firstLastName;
            if (phoneNumber   !== undefined) userEntity.phone      = phoneNumber;
            if (address       !== undefined) userEntity.address    = address;
            await userEntity.save({ transaction: t });
        }

        // 4. Sincronizar email en User.user_user si cambió
        if (email !== undefined) {
            const user = await User.findByPk(userId, { transaction: t });
            if (user && user.user_user !== email) {
                user.user_user = email;
                await user.save({ transaction: t });
            }
        }

        // 5. Cambio de contraseña (solo si el usuario lo solicitó)
        if (newPassword !== undefined && newPassword !== '') {
            if (!currentPassword) {
                await t.rollback();
                return res.status(400).json({ message: "Debes ingresar tu contraseña actual para cambiarla." });
            }
            if (newPassword !== confirmNewPassword) {
                await t.rollback();
                return res.status(400).json({ message: "La nueva contraseña y la confirmación no coinciden." });
            }
            if (newPassword.length < 6) {
                await t.rollback();
                return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres." });
            }

            const user = await User.findByPk(userId, { transaction: t });
            const isMatch = bcrypt.compareSync(currentPassword, user.user_password);
            if (!isMatch) {
                await t.rollback();
                return res.status(400).json({ message: "La contraseña actual es incorrecta." });
            }

            user.user_password = bcrypt.hashSync(newPassword, 10);
            await user.save({ transaction: t });
        }

        await t.commit();

        // Responder con todos los datos actualizados para que el frontend refresque
        return res.status(200).json({
            message: "Perfil actualizado correctamente",
            customer: {
                firstName:      customer.firstName,
                secondName:     customer.secondName,
                firstLastName:  customer.firstLastName,
                secondLastName: customer.secondLastName,
                phoneNumber:    customer.phoneNumber,
                email:          customer.email,
            },
            entity: {
                first_name: userEntity?.first_name ?? null,
                last_name:  userEntity?.last_name  ?? null,
                phone:      userEntity?.phone      ?? null,
                address:    userEntity?.address    ?? null,
            }
        });

    } catch (error) {
        await t.rollback();
        console.error("Error en updateCustomerProfile:", error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: "El correo electrónico ya está en uso por otro usuario." });
        }
        return res.status(500).json({ message: "Error actualizando el perfil", error: error.message });
    }
};
