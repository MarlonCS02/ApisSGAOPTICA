// src/routers/customer.router.js
import { Router } from "express";
import {
    getAllCustomers,
    getCustomerById,
    getCustomerByUserId,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    updateCustomerProfile
} from "../controllers/customer.controller.js";

import { verifyToken }         from "../middlewares/verifyToken.js";
import { isAdmin }             from "../middlewares/isAdmin.js";
import { isAdminOrEmployee }   from "../middlewares/isAdminOrEmployee.js";

const router = Router();

// GET - Todos los clientes (admin/empleado)
router.get("/customer", verifyToken, isAdminOrEmployee, getAllCustomers);

// GET - Cliente por user_id (para que Profile.jsx cargue los datos del cliente logueado)
router.get("/customer/user/:userId", verifyToken, getCustomerByUserId);

// GET - Cliente por customer_id
router.get("/customer/:id", verifyToken, getCustomerById);

// POST - Crear cliente (admin/empleado)
router.post("/customer", verifyToken, isAdminOrEmployee, createCustomer);

// PUT - El cliente actualiza su propio perfil
router.put("/customer/profile", verifyToken, updateCustomerProfile);

// PUT - Admin actualiza cualquier cliente
router.put("/customer/:id", verifyToken, isAdminOrEmployee, updateCustomer);

// DELETE - Admin elimina cliente
router.delete("/customer/:id", verifyToken, isAdmin, deleteCustomer);

export default router;