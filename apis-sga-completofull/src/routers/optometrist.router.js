// src/routers/optometrist.router.js
import { Router } from "express";
import { getAllOptometrists, getOptometristById, createOptometrist, updateOptometrist, deleteOptometrist } from "../controllers/optometrist.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = Router();

// GET - Ver todos los optómetras (público — el cliente necesita saber quién lo atiende)
router.get("/optometrist", getAllOptometrists);

// GET - Ver optómetra por ID (público)
router.get("/optometrist/:id", getOptometristById);

// POST - Crear optómetra (solo admin)
router.post("/optometrist", verifyToken, isAdmin, createOptometrist);

// PUT - Actualizar optómetra (solo admin)
router.put("/optometrist/:id", verifyToken, isAdmin, updateOptometrist);

// DELETE - Desactivar optómetra (solo admin — borrado lógico)
router.delete("/optometrist/:id", verifyToken, isAdmin, deleteOptometrist);

export default router;