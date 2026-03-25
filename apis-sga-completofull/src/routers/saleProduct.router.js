// src/routers/saleProduct.router.js
import { Router } from "express";
import { getAllSaleProducts, getSaleProductById, createSaleProduct, updateSaleProduct, deleteSaleProduct } from "../controllers/saleProduct.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { isAdminOrEmployee } from "../middlewares/isAdminOrEmployee.js";

const router = Router();

// GET - Ver todos los detalles de venta (admin y empleado)
router.get("/saleProduct", verifyToken, isAdminOrEmployee, getAllSaleProducts);

// GET - Ver detalle por ID (admin y empleado)
router.get("/saleProduct/:id", verifyToken, isAdminOrEmployee, getSaleProductById);

// POST - Crear detalle de venta (admin y empleado)
router.post("/saleProduct", verifyToken, isAdminOrEmployee, createSaleProduct);

// PUT - Actualizar detalle (admin y empleado)
router.put("/saleProduct/:id", verifyToken, isAdminOrEmployee, updateSaleProduct);

// DELETE - Eliminar detalle (solo admin)
router.delete("/saleProduct/:id", verifyToken, isAdmin, deleteSaleProduct);

export default router;