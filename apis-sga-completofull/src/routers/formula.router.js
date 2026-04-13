// src/routers/formula.router.js
import { Router } from "express";
import subirFormula from "../middlewares/uploadFormula.js";
import { uploadFormula, getFormulas, getFormulaById, getFormulasByCustomer, deleteFormula, uploadMyFormula, getMyFormulas, getFormulasWithCustomerInfo } from "../controllers/formula.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { isAdminOrOptometrist } from "../middlewares/isAdminOrOptometrist.js";

const router = Router();

// GET - Ver todas las fórmulas (solo admin y optómetra)
router.get("/formulas", verifyToken, isAdminOrOptometrist, getFormulas);

// GET - Fórmulas con info completa de clientes y citas (solo optómetra y admin)
router.get("/formulas/with-customers", verifyToken, isAdminOrOptometrist, getFormulasWithCustomerInfo);

// GET - El cliente ve SUS PROPIAS fórmulas (autenticado)
router.get("/formulas/my", verifyToken, getMyFormulas);

// GET - Fórmulas por cliente (admin, optómetra y el propio cliente con token)
// La ruta con más segmentos va antes para evitar que ":id" capture "customer"
router.get("/formulas/customer/:customerId", verifyToken, getFormulasByCustomer);

// GET - Fórmula por ID (admin, optómetra y el propio cliente con token)
router.get("/formulas/:id", verifyToken, getFormulaById);

// POST - El cliente sube SU PROPIA fórmula (solo necesita token)
router.post("/formulas/my", verifyToken, subirFormula.single("file"), uploadMyFormula);

// POST - Subir fórmula (admin, optómetra y cliente — el cliente sube la suya)
router.post("/formulas", verifyToken, subirFormula.single("file"), uploadFormula);

// DELETE - Eliminar fórmula (solo admin)
router.delete("/formulas/:id", verifyToken, isAdmin, deleteFormula);

export default router;