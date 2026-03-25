// src/routes/user.router.js

import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";

// CRUD del usuario
import {
    createUser,
    showUser,
    showUserId,
    updateUser,
    deleteUser
} from "../controllers/user.controller.js";

// LOGIN
import { loginUser } from "../controllers/auth.controller.js";

const router = Router();

// ----------------------------------------------------
// 🔓 RUTAS PÚBLICAS (sin token)
// ----------------------------------------------------

// Registrar usuario
router.post("/user/register", createUser);

// Login usuario → devuelve token
router.post("/auth/login", loginUser);

// Mostrar todos los usuarios (protegido)
router.get("/user", showUser);

// Mostrar usuario por ID (protegido)
router.get("/user/:id", showUserId);

// ----------------------------------------------------
// 🔐 RUTAS PROTEGIDAS (requieren token)
// ----------------------------------------------------


// Actualizar usuario (protegido)
router.put("/user/:id", verifyToken, updateUser);

// Eliminar usuario (protegido)
router.delete("/user/:id", verifyToken, deleteUser);

export default router;
