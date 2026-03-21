// src/controllers/category.controller.js
import Category from "../models/category.model.js"; // CORRECCIÓN CRÍTICA: Importar el modelo Category


// ----------------------------------------------------
// UTILITY: Manejador de Errores para Consistencia
// ----------------------------------------------------
const handleSequelizeError = (res, error, defaultMessage) => {
    // 409 Conflict: Problemas de unicidad (e.g., duplicate category_name)
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ 
            message: "Conflict: The category name is already registered.", 
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
    // 409 Conflict: Violación de Clave Foránea (Intentar borrar una FK usada por Product)
    if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(409).json({ 
            message: "Conflict: Cannot delete this category. There are associated products that depend on it.", 
            details: "This Category is currently in use by Products."
        });
    }
    
    // 500 Internal Server Error para otros errores
    console.error("Sequelize Error:", error);
    return res.status(500).json({ 
        message: defaultMessage, 
        error: error.message
    });
};


// ------ VER TODAS LAS CATEGORIAS ------ //
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.status(200).json(categories);
    } catch (error) {
        handleSequelizeError(res, error, "Error fetching categories");
    }
};
// -------------------------------------- //


// ------ VER CATEGORIA POR ID ------- //
export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);

        if (!category) return res.status(404).json({ message: "Category not found" });

        res.status(200).json(category);
    } catch (error) {
        handleSequelizeError(res, error, "Error fetching category");
    }
};
// ----------------------------------- //


// ------ CREAR CATEGORIA ------ //
export const createCategory = async (req, res) => {
    try {
        const { category_name } = req.body; // CORRECTO: usar el mismo nombre del modelo

        if (!category_name) {
            return res.status(400).json({ message: "Missing required field: category_name." });
        }

        const newCategory = await Category.create({ category_name });

        res.status(201).json(newCategory);
    } catch (error) {
        handleSequelizeError(res, error, "Error creating category");
    }
};

// ----------------------------- //


// --- ACTUALIZAR CATEGORIA ------ //
export const updateCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);

        if (!category) return res.status(404).json({ message: "Category not found" });

        const updatedCategory = await category.update(req.body);

        res.status(200).json(updatedCategory);
    } catch (error) {
        handleSequelizeError(res, error, "Error updating category");
    }
};
// ------------------------------- //


// ------ BORRAR CATEGORIA ------- //
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);

        if (!category) return res.status(404).json({ message: "Category not found" });

        // Borrado Físico. El handler capturará el error FK si hay productos asociados.
        await category.destroy();

        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        // El handler unificado capturará SequelizeForeignKeyConstraintError como 409
        handleSequelizeError(res, error, "Error deleting category");
    }
};
// ------------------------------- //