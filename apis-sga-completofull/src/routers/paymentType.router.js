import { Router } from "express";
import { getAllPaymentTypes, getPaymentTypeById, createPaymentType, updatePaymentType, deletePaymentType} from "../controllers/paymentType.controller.js";

// CREACIÓN DE RUTAS
const router = Router();

router.get("/paymentType", getAllPaymentTypes); // get: Obtener
router.get("/paymentType/:id", getPaymentTypeById);

router.post("/paymentType", createPaymentType); // post: Crear datos

router.put("/paymentType/:id", updatePaymentType); // put: Actualizar

router.delete("/paymentType/:id", deletePaymentType); // delete: Eliminar (Borrado Físico)

// Exportamos las rutas
export default router;