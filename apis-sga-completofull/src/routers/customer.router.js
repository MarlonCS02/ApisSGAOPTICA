// src/routers/customer.router.js
import { Router } from "express";
import { getAllCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer } from "../controllers/customer.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { isAdminOrEmployee } from "../middlewares/isAdminOrEmployee.js";

const router = Router();

// GET - Ver todos los clientes (admin y empleado)
router.get("/customer", verifyToken, isAdminOrEmployee, getAllCustomers);

// GET - Ver cliente por ID (admin, empleado y el propio cliente con token)
router.get("/customer/:id", verifyToken, getCustomerById);

// POST - Crear cliente (admin y empleado — el registro lo hace el sistema al crear usuario)
router.post("/customer", verifyToken, isAdminOrEmployee, createCustomer);

// PUT - Actualizar cliente (admin y empleado)
router.put("/customer/:id", verifyToken, isAdminOrEmployee, updateCustomer);

// DELETE - Eliminar cliente (solo admin)
router.delete("/customer/:id", verifyToken, isAdmin, deleteCustomer);

export default router;