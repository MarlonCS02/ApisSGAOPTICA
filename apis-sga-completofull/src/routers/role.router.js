// src/routers/role.router.js
import { Router } from "express";
import { getRoles, getRoleById, createRole, updateRole, deleteRole } from "../controllers/role.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = Router();

// GET - Ver todos los roles (solo admin — nadie más necesita gestionar roles)
router.get("/roles", verifyToken, isAdmin, getRoles);

// GET - Ver rol por ID (solo admin)
router.get("/roles/:id", verifyToken, isAdmin, getRoleById);

// POST - Crear rol (solo admin)
router.post("/roles", verifyToken, isAdmin, createRole);

// PUT - Actualizar rol (solo admin)
router.put("/roles/:id", verifyToken, isAdmin, updateRole);

// DELETE - Eliminar rol (solo admin)
router.delete("/roles/:id", verifyToken, isAdmin, deleteRole);

export default router;