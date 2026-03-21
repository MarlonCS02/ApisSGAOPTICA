import { Router } from "express";
import { getAllExamTypes, getExamTypeById, createExamType, updateExamType, deleteExamType} from "../controllers/examType.controller.js";

// CREACIÓN DE RUTAS
const router = Router();

router.get("/examType", getAllExamTypes); // get: Obtener
router.get("/examType/:id", getExamTypeById);
router.post("/examType", createExamType); // post: Crear datos
router.put("/examType/:id", updateExamType); // put: Actualizar
router.delete("/examType/:id", deleteExamType); // delete: Eliminar (Borrado Físico, con riesgo de error 409)

// Exportamos las rutas
export default router;

