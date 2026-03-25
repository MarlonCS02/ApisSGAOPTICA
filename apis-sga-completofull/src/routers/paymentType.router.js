// src/routers/paymentType.router.js
import { Router } from "express";
import { getAllPaymentTypes, getPaymentTypeById, createPaymentType, updatePaymentType, deletePaymentType } from "../controllers/paymentType.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = Router();

// GET - Ver todos los tipos de pago (público — se necesita al crear una venta)
router.get("/paymentType", getAllPaymentTypes);

// GET - Ver tipo de pago por ID (público)
router.get("/paymentType/:id", getPaymentTypeById);

// POST - Crear tipo de pago (solo admin)
router.post("/paymentType", verifyToken, isAdmin, createPaymentType);

// PUT - Actualizar tipo de pago (solo admin)
router.put("/paymentType/:id", verifyToken, isAdmin, updatePaymentType);

// DELETE - Eliminar tipo de pago (solo admin)
router.delete("/paymentType/:id", verifyToken, isAdmin, deletePaymentType);

export default router;