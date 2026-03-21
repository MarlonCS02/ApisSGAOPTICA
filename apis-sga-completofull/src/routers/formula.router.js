import { Router } from "express";
// Importamos el middleware para subir formulas en imagen y pdf
import subirFormula from "../middlewares/uploadFormula.js";
// Importamos las funciones para la subida de la formua
import { uploadFormula, getFormulas, getFormulaById, getFormulasByCustomer, deleteFormula } from "../controllers/formula.controller.js";

// --- CREACION DE RUTAS --- //
// get: Obtener
// post: Crear datos
// put: Actualizar
// delete: Eliminar

const router = Router();

router.post("/formulas", subirFormula.single("file"), uploadFormula); // Aqui se sube las formulas
router.get("/formulas", getFormulas); // Ver formulas

// Nota: La ruta con más segmentos DEBE ir antes para evitar que ":id" capture "customer"
router.get("/formulas/customer/:customerId", getFormulasByCustomer); // Formulas por id del cliente

router.get("/formulas/:id", getFormulaById); // Formulas por id
router.delete("/formulas/:id", deleteFormula); // Eliminar una formula

// Exportamos las rutas
export default router;