import { Router } from "express";
import { getAllDocumentTypes, getDocumentTypeById, createDocumentType, updateDocumentType, deleteDocumentType} from "../controllers/documentType.controller.js";

// CREACIÓN DE RUTAS
const router = Router();

router.get("/documentType", getAllDocumentTypes); // get: Obtener
router.get("/documentType/:id", getDocumentTypeById);
router.post("/documentType", createDocumentType); // post: Crear datos
router.put("/documentType/:id", updateDocumentType); // put: Actualizar
router.delete("/documentType/:id", deleteDocumentType); // delete: Eliminar (Borrado Lógico)

// Exportamos las rutas
export default router;
