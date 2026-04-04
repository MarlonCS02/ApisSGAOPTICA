import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import { Op } from "sequelize";

// ----------------------------------------------------
// UTILITY: Manejador de Errores
// ----------------------------------------------------
const handleSequelizeError = (res, error, defaultMessage) => {
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ 
            message: "Conflict: The product name is already registered.", 
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
            message: "Conflict: Cannot delete product due to associated sales records."
        });
    }
    
    console.error("Sequelize Error:", error);
    return res.status(500).json({ 
        message: defaultMessage, 
        error: error.message
    });
};

// ------ OBTENER TODOS LOS PRODUCTOS ------ //
export const getProducts = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const whereCondition = status ? { status } : {};

        const offset = (page - 1) * limit;

        const { count, rows } = await Product.findAndCountAll({
            where: whereCondition,
            attributes: ['id', 'nameProduct', 'description', 'unitPrice', 'stock', 'status', 'categoryId', 'imagen'],
            include: {
                model: Category,
                attributes: ["category_id", "category_name"]
            },
            order: [["nameProduct", "ASC"]],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.status(200).json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            data: rows
        });
    } catch (error) {
        handleSequelizeError(res, error, "Error fetching products");
    }
};

// ------ OBTENER PRODUCTO POR ID ------ //
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            attributes: ['id', 'nameProduct', 'description', 'unitPrice', 'stock', 'status', 'categoryId', 'imagen'],
            include: {
                model: Category,
                attributes: ["category_id", "category_name"]
            }
        });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json(product);
    } catch (error) {
        handleSequelizeError(res, error, "Error fetching product");
    }
};

// ------ CREAR PRODUCTO ------ //
export const createProduct = async (req, res) => {
    try {
        const { nameProduct, description, unitPrice, stock, categoryId, status } = req.body;
        
        // Obtener la ruta de la imagen si se subió
        const imagen = req.file ? `/uploads/products/${req.file.filename}` : null;

        // Validaciones
        if (!nameProduct || unitPrice === undefined || stock === undefined || !categoryId) {
            return res.status(400).json({
                message: "Missing required fields (nameProduct, unitPrice, stock, categoryId)"
            });
        }

        if (isNaN(unitPrice) || unitPrice <= 0) {
            return res.status(400).json({ message: "Price must be a positive number" });
        }

        if (isNaN(stock) || stock < 0 || !Number.isInteger(Number(stock))) {
            return res.status(400).json({ message: "Stock must be a non-negative integer" });
        }

        // Verificar categoría
        const categoryExists = await Category.findByPk(categoryId);
        if (!categoryExists) {
            return res.status(400).json({ message: "Category ID does not exist" });
        }

        // Crear producto
        const newProduct = await Product.create({
            nameProduct,
            description: description || null,
            unitPrice,
            stock,
            categoryId,
            status: status || "ACTIVE",
            imagen: imagen  // 👈 Guardar la ruta
        });

        // Obtener producto con categoría
        const productWithCategory = await Product.findByPk(newProduct.id, {
            attributes: ['id', 'nameProduct', 'description', 'unitPrice', 'stock', 'status', 'categoryId', 'imagen'],
            include: {
                model: Category,
                attributes: ["category_id", "category_name"]
            }
        });

        res.status(201).json(productWithCategory);
    } catch (error) {
        handleSequelizeError(res, error, "Error creating product");
    }
};

// ------ ACTUALIZAR PRODUCTO ------ //
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { nameProduct, description, unitPrice, stock, categoryId, status } = req.body;
        
        // Si se subió nueva imagen, obtener la ruta
        let imagen = null;
        if (req.file) {
            imagen = `/uploads/products/${req.file.filename}`;
        }

        // Buscar producto
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Validaciones condicionales
        if (unitPrice !== undefined && (isNaN(unitPrice) || unitPrice <= 0)) {
            return res.status(400).json({ message: "Price must be a positive number" });
        }

        if (stock !== undefined && (isNaN(stock) || stock < 0 || !Number.isInteger(Number(stock)))) {
            return res.status(400).json({ message: "Stock must be a non-negative integer" });
        }

        if (categoryId !== undefined) {
            const categoryExists = await Category.findByPk(categoryId);
            if (!categoryExists) {
                return res.status(400).json({ message: "Category ID does not exist" });
            }
        }

        // Verificar nombre único si se está actualizando
        if (nameProduct && nameProduct !== product.nameProduct) {
            const existingProduct = await Product.findOne({
                where: {
                    nameProduct,
                    id: { [Op.ne]: id }
                }
            });
            if (existingProduct) {
                return res.status(409).json({ message: "Another product with this name already exists" });
            }
        }

        // Preparar datos para actualizar
        const updateData = {};
        if (nameProduct !== undefined) updateData.nameProduct = nameProduct;
        if (description !== undefined) updateData.description = description;
        if (unitPrice !== undefined) updateData.unitPrice = unitPrice;
        if (stock !== undefined) updateData.stock = stock;
        if (categoryId !== undefined) updateData.categoryId = categoryId;
        if (status !== undefined) updateData.status = status;
        if (imagen !== null) updateData.imagen = imagen;  // 👈 Solo si se subió nueva imagen

        // Actualizar
        await product.update(updateData);

        // Obtener producto actualizado
        const updatedProduct = await Product.findByPk(id, {
            attributes: ['id', 'nameProduct', 'description', 'unitPrice', 'stock', 'status', 'categoryId', 'imagen'],
            include: {
                model: Category,
                attributes: ["category_id", "category_name"]
            }
        });

        res.status(200).json(updatedProduct);
    } catch (error) {
        handleSequelizeError(res, error, "Error updating product");
    }
};

// ------ ACTUALIZAR SOLO STOCK ------ //
export const updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { stock } = req.body;

        if (stock === undefined) {
            return res.status(400).json({ message: "Stock field is required" });
        }

        if (isNaN(stock) || stock < 0 || !Number.isInteger(Number(stock))) {
            return res.status(400).json({ message: "Stock must be a non-negative integer" });
        }

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        await product.update({ stock });

        const updatedProduct = await Product.findByPk(id, {
            attributes: ['id', 'nameProduct', 'description', 'unitPrice', 'stock', 'status', 'categoryId', 'imagen'],
            include: {
                model: Category,
                attributes: ["category_id", "category_name"]
            }
        });

        res.status(200).json({
            message: "Stock Actualizado Correctamente",
            data: updatedProduct
        });
    } catch (error) {
        handleSequelizeError(res, error, "Error updating stock");
    }
};

// ------ ELIMINAR PRODUCTO (SOFT DELETE) ------ //
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Soft delete: cambiar status a INACTIVE
        await product.update({ status: "INACTIVE" });

        const deletedProduct = await Product.findByPk(id, {
            attributes: ['id', 'nameProduct', 'description', 'unitPrice', 'stock', 'status', 'categoryId', 'imagen'],
            include: {
                model: Category,
                attributes: ["category_id", "category_name"]
            }
        });

        res.status(200).json({
            message: "Product deactivated successfully",
            data: deletedProduct
        });
    } catch (error) {
        handleSequelizeError(res, error, "Error deleting product");
    }
};

// ------ RESTAURAR PRODUCTO ------ //
export const restoreProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Restaurar: cambiar status a ACTIVE
        await product.update({ status: "ACTIVE" });

        const restoredProduct = await Product.findByPk(id, {
            attributes: ['id', 'nameProduct', 'description', 'unitPrice', 'stock', 'status', 'categoryId', 'imagen'],
            include: {
                model: Category,
                attributes: ["category_id", "category_name"]
            }
        });

        res.status(200).json({
            message: "Product restored successfully",
            data: restoredProduct
        });
    } catch (error) {
        handleSequelizeError(res, error, "Error restoring product");
    }
};