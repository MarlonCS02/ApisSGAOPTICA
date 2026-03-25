// src/routers/formula.router.js
import { Router } from "express";
import subirFormula from "../middlewares/uploadFormula.js";
import { uploadFormula, getFormulas, getFormulaById, getFormulasByCustomer, deleteFormula } from "../controllers/formula.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { isAdminOrOptometrist } from "../middlewares/isAdminOrOptometrist.js";

const router = Router();

// GET - Ver todas las fórmulas (solo admin y optómetra)
router.get("/formulas", verifyToken, isAdminOrOptometrist, getFormulas);

// GET - Fórmulas por cliente (admin, optómetra y el propio cliente con token)
// La ruta con más segmentos va antes para evitar que ":id" capture "customer"
router.get("/formulas/customer/:customerId", verifyToken, getFormulasByCustomer);

// GET - Fórmula por ID (admin, optómetra y el propio cliente con token)
router.get("/formulas/:id", verifyToken, getFormulaById);

// POST - Subir fórmula (admin, optómetra y cliente — el cliente sube la suya)
router.post("/formulas", verifyToken, subirFormula.single("file"), uploadFormula);

// DELETE - Eliminar fórmula (solo admin)
router.delete("/formulas/:id", verifyToken, isAdmin, deleteFormula);

export default router;