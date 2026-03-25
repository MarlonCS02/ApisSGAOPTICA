// src/routers/category.router.js
import { Router } from "express";
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from "../controllers/category.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = Router();

// GET - Ver todas las categorías (público — el cliente navega el catálogo)
router.get("/category", getCategories);

// GET - Ver categoría por ID (público)
router.get("/category/:id", getCategoryById);

// POST - Crear categoría (solo admin)
router.post("/category", verifyToken, isAdmin, createCategory);

// PUT - Actualizar categoría (solo admin)
router.put("/category/:id", verifyToken, isAdmin, updateCategory);

// DELETE - Eliminar categoría (solo admin)
router.delete("/category/:id", verifyToken, isAdmin, deleteCategory);

export default router;