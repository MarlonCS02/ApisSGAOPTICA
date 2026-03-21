import { Router } from "express";
import { getAllOptometrists, getOptometristById, createOptometrist, updateOptometrist, deleteOptometrist} from "../controllers/optometrist.controller.js";

// CREACIÓN DE RUTAS
const router = Router();

router.get("/optometrist", getAllOptometrists); // get: Obtener
router.get("/optometrist/:id", getOptometristById);
router.post("/optometrist", createOptometrist); // post: Crear datos
router.put("/optometrist/:id", updateOptometrist); // put: Actualizar
router.delete("/optometrist/:id", deleteOptometrist); // delete: Eliminar (Borrado Lógico)

// Exportamos las rutas
export default router;