// ----------------------------------------------------
// CONTROLADOR DE USUARIOS
// ----------------------------------------------------

import sequelize from "../config/connect.db.js";
import bcrypt from "bcryptjs";

import User from "../models/user.model.js";
import UserEntity from "../models/userEntity.model.js";
import Customer from "../models/customer.model.js";
import Role from "../models/role.model.js";


// ----------------------------------------------------
// 🛠️ Manejador global de errores Sequelize
// ----------------------------------------------------
const handleSequelizeError = (res, error, defaultMessage) => {
    if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
            message: "Conflict: A user with this username already exists.",
            details: error.errors.map(e => e.message)
        });
    }

    if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
            message: "Validation failed.",
            details: error.errors.map(e => e.message)
        });
    }

    console.error(error);

    return res.status(500).json({
        message: defaultMessage,
        error: error.message
    });
};



// ----------------------------------------------------
// 🌐 REGISTRO PÚBLICO — para el formulario del frontend
// Crea User + UserEntity + Customer en una sola transacción.
// El rol "cliente" se asigna automáticamente — el frontend
// no necesita enviar role_id.
// Campos requeridos: nombre, correo, contraseña
// Campos opcionales: telefono
// ----------------------------------------------------
export const registerUser = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { nombre, correo, contrasena, confirmar_contrasena, telefono } = req.body;

        // 1. Validar campos requeridos
        if (!nombre || !correo || !contrasena || !confirmar_contrasena) {
            await t.rollback();
            return res.status(400).json({
                message: "Los campos nombre, correo, contraseña y confirmar contraseña son obligatorios."
            });
        }

        // 2. Verificar que las contraseñas coincidan
        if (contrasena !== confirmar_contrasena) {
            await t.rollback();
            return res.status(400).json({
                message: "Las contraseñas no coinciden."
            });
        }

        // 3. Verificar que el correo no esté ya registrado
        const emailExiste = await Customer.findOne({ where: { email: correo } });
        if (emailExiste) {
            await t.rollback();
            return res.status(409).json({
                message: "Este correo ya está registrado."
            });
        }

        // 4. Buscar el rol "cliente" automáticamente — el frontend no lo envía
        const rolCliente = await Role.findOne({ where: { role_name: "cliente" } });
        if (!rolCliente) {
            await t.rollback();
            return res.status(500).json({
                message: "Error de configuración: el rol 'cliente' no existe en la base de datos."
            });
        }

        // 5. Encriptar contraseña
        const hashed = bcrypt.hashSync(contrasena, 10);

        // 6. Crear User (el correo se usa como username)
        const nuevoUser = await User.create(
            {
                user_user: correo,
                user_password: hashed,
                role_id: rolCliente.role_id
            },
            { transaction: t }
        );

        // 7. Crear UserEntity con el nombre
        // "nombre" se guarda completo en first_name para simplificar el registro.
        // El admin puede completar apellidos después si lo necesita.
        await UserEntity.create(
            {
                user_id: nuevoUser.user_id,
                first_name: nombre,
                last_name: "",
                phone: telefono || null,
                address: null
            },
            { transaction: t }
        );

        // 8. Crear Customer con los datos básicos
        // idDocType y documentNumber quedan null — se completan en la óptica.
        await Customer.create(
            {
                idUser: nuevoUser.user_id,
                idDocType: null,
                documentNumber: null,
                firstName: nombre,
                firstLastName: "",
                phoneNumber: telefono || null,
                email: correo
            },
            { transaction: t }
        );

        // 9. Confirmar transacción — si algo falló arriba, nada se guarda
        await t.commit();

        return res.status(201).json({
            message: "Registro exitoso. Ya puedes iniciar sesión.",
            user_id: nuevoUser.user_id
        });

    } catch (error) {
        await t.rollback();
        return handleSequelizeError(res, error, "Error al registrar el usuario.");
    }
};



// ----------------------------------------------------
// ➕ CREAR USUARIO + USERENTITY (uso interno del admin)
// Este endpoint queda intacto para que el administrador
// pueda crear usuarios con cualquier rol desde el panel.
// ----------------------------------------------------
export const createUser = async (req, res) => {
    const t = await sequelize.transaction();

    try {

        const { user_user, user_password, role_id } = req.body;

        if (!user_user || !user_password || !role_id) {
            return res.status(400).json({
                message: "Missing required fields (user_user, user_password, role_id)."
            });
        }

        // Verificar si el rol existe
        const role = await Role.findByPk(role_id);
        if (!role) {
            return res.status(400).json({ message: "Role does not exist." });
        }

        // Encriptar contraseña
        const hashed = bcrypt.hashSync(user_password, 10);

        // Crear usuario
        const newUser = await User.create(
            {
                user_user,
                user_password: hashed,
                role_id
            },
            { transaction: t }
        );

        // Crear UserEntity asociado
        await UserEntity.create(
            {
                user_id: newUser.user_id,
                first_name: req.body.first_name || null,
                last_name: req.body.last_name || null,
                phone: req.body.phone || null,
                address: req.body.address || null
            },
            { transaction: t }
        );

        await t.commit();

        return res.status(201).json({
            message: "User created successfully.",
            user_id: newUser.user_id
        });

    } catch (error) {
        await t.rollback();
        return handleSequelizeError(res, error, "Error creating user");
    }
};



// ----------------------------------------------------
// 📄 MOSTRAR TODOS LOS USUARIOS
// ----------------------------------------------------
export const showUser = async (req, res) => {
    try {

        const users = await User.findAll({
            attributes: { exclude: ["user_password"] },
            include: [
                { model: UserEntity, as: "UserEntityInfo" },
                { model: Role }
            ]
        });

        return res.json(users);

    } catch (error) {
        return handleSequelizeError(res, error, "Error fetching users");
    }
};



// ----------------------------------------------------
// 📄 MOSTRAR USUARIO POR ID
// ----------------------------------------------------
export const showUserId = async (req, res) => {
    try {

        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ["user_password"] },
            include: [
                { model: UserEntity, as: "UserEntityInfo" },
                { model: Role }
            ]
        });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        return res.json(user);

    } catch (error) {
        return handleSequelizeError(res, error, "Error fetching user by ID");
    }
};



// ----------------------------------------------------
// ✏️ ACTUALIZAR USUARIO + USERENTITY (Transacción)
// ----------------------------------------------------
export const updateUser = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const id = req.params.id;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const { user_user, user_password, role_id } = req.body;

        // Validar rol si lo envían
        if (role_id !== undefined) {
            const checkRole = await Role.findByPk(role_id);
            if (!checkRole) {
                return res.status(400).json({ message: "Role does not exist." });
            }
        }

        const dataToUpdate = {};

        if (user_user !== undefined) dataToUpdate.user_user = user_user;
        if (role_id !== undefined) dataToUpdate.role_id = role_id;

        if (user_password !== undefined) {
            dataToUpdate.user_password = bcrypt.hashSync(user_password, 10);
        }

        // Actualizar USER
        await user.update(dataToUpdate, { transaction: t });

        // USERENTITY
        const entityFields = ["first_name", "last_name", "phone", "address"];
        const entityData = {};

        entityFields.forEach(f => {
            if (req.body[f] !== undefined) {
                entityData[f] = req.body[f];
            }
        });

        if (Object.keys(entityData).length > 0) {
            await UserEntity.update(entityData, {
                where: { user_id: id },
                transaction: t
            });
        }

        await t.commit();

        const updated = await User.findByPk(id, {
            attributes: { exclude: ["user_password"] },
            include: [
                { model: UserEntity, as: "UserEntityInfo" },
                { model: Role }
            ]
        });

        return res.json(updated);

    } catch (error) {
        await t.rollback();
        return handleSequelizeError(res, error, "Error updating user");
    }
};



// ----------------------------------------------------
// 🗑️ ELIMINAR USUARIO
// ----------------------------------------------------
export const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        await user.destroy(); // CASCADE asegura borrar UserEntity

        return res.json({ message: "User and entity deleted successfully." });

    } catch (error) {
        return res.status(500).json({
            message: "Error deleting user.",
            error: error.message
        });
    }
};