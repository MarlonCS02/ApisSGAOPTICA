import { Router } from "express";
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from "../controllers/category.controller.js";

// --- CREACION DE RUTAS --- //
// get: Obtener
// post: Crear datos
// put: Actualizar
// delete: Eliminar

const router = Router();

router.get("/category", getCategories); // Todas las categorias
router.get("/category/:id", getCategoryById); // Categorias por id
router.post("/category", createCategory); // Crear una categoria
router.put("/category/:id", updateCategory); // Actualizar una categoria
router.delete("/category/:id", deleteCategory); // Borrar una categoria

// Exportmaos las rutas
export default router;