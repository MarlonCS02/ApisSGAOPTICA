// src/routers/user.router.js
import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";

import {
    registerUser,
    createUser,
    showUser,
    showUserId,
    updateUser,
    deleteUser
} from "../controllers/user.controller.js";

import { loginUser } from "../controllers/auth.controller.js";

const router = Router();

// ----------------------------------------------------
// 🔓 RUTAS PÚBLICAS (sin token)
// ----------------------------------------------------

// Registro público desde el frontend — asigna rol "cliente" automáticamente
router.post("/auth/register", registerUser);

// Login — devuelve token JWT
router.post("/auth/login", loginUser);

// Registro interno del admin — permite especificar cualquier rol
router.post("/user/register", verifyToken, isAdmin, createUser);


// ----------------------------------------------------
// 🔐 RUTAS PROTEGIDAS (requieren token)
// ----------------------------------------------------

// Ver todos los usuarios (solo admin)
router.get("/user", verifyToken, isAdmin, showUser);

// Ver usuario por ID (solo admin)
router.get("/user/:id", verifyToken, isAdmin, showUserId);

// Actualizar usuario (solo admin)
router.put("/user/:id", verifyToken, isAdmin, updateUser);

// Eliminar usuario (solo admin)
router.delete("/user/:id", verifyToken, isAdmin, deleteUser);

export default router;