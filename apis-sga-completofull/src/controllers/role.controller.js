import Role from "../models/role.model.js";

/* -----------------------------------------------------
🔧 UTILIDAD PARA MANEJAR ERRORES COMUNES DE SEQUELIZE
--------------------------------------------------------*/
const handleSequelizeError = (res, error, defaultMessage) => {

    // Error: nombre duplicado (UNIQUE)
    if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
            message: "Conflict: Role name must be unique.",
            details: error.errors.map(err => err.message)
        });
    }

    // Error: datos inválidos o faltantes (VALIDATION)
    if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
            message: "Validation failed.",
            details: error.errors.map(err => err.message)
        });
    }

    // Errores generales → 500
    console.error(error);
    return res.status(500).json({ 
        message: defaultMessage, 
        error: error.message 
    });
};


/* -----------------------------------------------------
📌 OBTENER TODOS LOS ROLES
--------------------------------------------------------*/
export const getRoles = async (req, res) => {
    try {
        const roles = await Role.findAll();
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: "Error fetching roles", error: error.message });
    }
};


/* -----------------------------------------------------
📌 OBTENER UN ROL POR ID
--------------------------------------------------------*/
export const getRoleById = async (req, res) => {
    try {
        const role = await Role.findByPk(req.params.id);

        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }

        res.json(role);
    } catch (error) {
        handleSequelizeError(res, error, "Error fetching role by ID");
    }
};


/* -----------------------------------------------------
➕ CREAR UN NUEVO ROL
⚠ Tu modelo usa SOLO: name
--------------------------------------------------------*/
export const createRole = async (req, res) => {
    try {
        const { role_name, role_description } = req.body; // ✔ Campos correctos

        const newRole = await Role.create({ role_name, role_description });

        res.status(201).json(newRole);

    } catch (error) {
        handleSequelizeError(res, error, "Error creating role");
    }
};



/* -----------------------------------------------------
✏️ ACTUALIZAR UN ROL POR ID
--------------------------------------------------------*/
export const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role_name, role_description } = req.body;

        const role = await Role.findByPk(id);

        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }

        // Validar campos requeridos
        if (!role_name || !role_description) {
            return res.status(400).json({
                message: "role_name and role_description are required"
            });
        }

        // Actualizar solo los campos válidos
        await role.update({
            role_name,
            role_description
        });

        return res.status(200).json({
            message: "Role updated successfully",
            role,
        });

    } catch (error) {
        console.error("⚠️ ERROR EN UPDATE ROLE:", error);
        return res.status(500).json({
            message: "Error updating role",
            error: error.message,
        });
    }
};



/* -----------------------------------------------------
🗑️ ELIMINAR UN ROL POR ID
--------------------------------------------------------*/
export const deleteRole = async (req, res) => {
    try {
        const role = await Role.findByPk(req.params.id);

        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }

        // Si un usuario tiene este role_id, dará error por RESTRICT
        await role.destroy();

        res.status(200).json({ message: "Role deleted successfully" });

    } catch (error) {
        res.status(500).json({
            message: "Error deleting role (check Foreign Keys)",
            error: error.message
        });
    }
};
