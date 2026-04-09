// src/routers/customer.router.js
import { Router } from "express";
import {
    getAllCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    updateCustomerProfile
} from "../controllers/customer.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { isAdminOrEmployee } from "../middlewares/isAdminOrEmployee.js";

const router = Router();

// GET - Ver todos los clientes (admin y empleado)
router.get("/customer", verifyToken, isAdminOrEmployee, getAllCustomers);

// GET - Ver cliente por ID
router.get("/customer/:id", verifyToken, getCustomerById);

// POST - Crear cliente (admin y empleado)
router.post("/customer", verifyToken, isAdminOrEmployee, createCustomer);

// ─────────────────────────────────────────────────────────────────────────────
// ⚠️  CRÍTICO: /customer/profile DEBE ir ANTES de /customer/:id
//     Si va después, Express captura "profile" como :id y aplica
//     isAdminOrEmployee, bloqueando al cliente con 403.
//     La ruta exacta que llama el frontend Flutter es: PUT /customer/profile
// ─────────────────────────────────────────────────────────────────────────────
router.put("/customer/profile", verifyToken, updateCustomerProfile);

// PUT - Actualizar cliente por ID (solo admin y empleado)
router.put("/customer/:id", verifyToken, isAdminOrEmployee, updateCustomer);

// DELETE - Eliminar cliente (solo admin)
router.delete("/customer/:id", verifyToken, isAdmin, deleteCustomer);

export default router;
