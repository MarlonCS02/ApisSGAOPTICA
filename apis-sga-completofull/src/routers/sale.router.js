// src/routers/sale.router.js
import { Router } from "express";
import { createSale, getSales, getSaleById, deleteSale } from "../controllers/sale.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { isAdminOrEmployee } from "../middlewares/isAdminOrEmployee.js";

const router = Router();

// GET - Ver todas las ventas (admin y empleado)
router.get("/sales", verifyToken, isAdminOrEmployee, getSales);

// GET - Ver venta por ID (admin y empleado)
router.get("/sales/:id", verifyToken, isAdminOrEmployee, getSaleById);

// POST - Crear venta (admin y empleado — el cliente no compra directamente por API)
router.post("/sales", verifyToken, isAdminOrEmployee, createSale);

// DELETE - Eliminar venta (solo admin)
router.delete("/sales/:id", verifyToken, isAdmin, deleteSale);

export default router;