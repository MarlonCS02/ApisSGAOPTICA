import { Router } from "express";
import { getAllCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer} from "../controllers/customer.controller.js";

// CREACIÓN DE RUTAS
const router = Router();

router.get("/customer", getAllCustomers); // get: Obtener
router.get("/customer/:id", getCustomerById);
router.post("/customer", createCustomer); // post: Crear datos
router.put("/customer/:id", updateCustomer); // put: Actualizar por id
router.delete("/customer/:id", deleteCustomer); // delete: Eliminar por id

// Exportamos las rutas
export default router;