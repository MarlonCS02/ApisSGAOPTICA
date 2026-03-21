import express from "express";
import { 
    createProduct,
    getProducts, 
    getProductById,
    updateProduct,
    updateStock,
    deleteProduct,
    restoreProduct
} from "../controllers/product.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

// =============================================
// RUTAS PÚBLICAS (no requieren autenticación)
// =============================================

// GET /api/v1/products - Obtener todos los productos
router.get("/products", getProducts);

// GET /api/v1/products/:id - Obtener un producto por ID
router.get("/products/:id", getProductById);


// =============================================
// RUTAS PROTEGIDAS (requieren token de admin)
// =============================================

// POST /api/v1/products - Crear un nuevo producto
router.post("/products", verifyToken, isAdmin, createProduct);

// PUT /api/v1/products/:id - Actualizar un producto completo
router.put("/products/:id", verifyToken, isAdmin, updateProduct);

// PATCH /api/v1/products/:id/stock - Actualizar solo el stock
router.patch("/products/:id/stock", verifyToken, isAdmin, updateStock);

// DELETE /api/v1/products/:id - Eliminar producto (soft delete)
router.delete("/products/:id", verifyToken, isAdmin, deleteProduct);

// PATCH /api/v1/products/:id/restore - Restaurar producto eliminado
router.patch("/products/:id/restore", verifyToken, isAdmin, restoreProduct);

export default router;