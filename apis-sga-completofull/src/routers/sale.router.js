import { Router } from "express";
// Importamos las funciones creadas para el apartado de ventas //
import { createSale, getSales, getSaleById, deleteSale } from "../controllers/sale.controller.js";

// --- CREACION DE RUTAS --- //
// get: Obtener
// post: Crear datos
// put: Actualizar
// delete: Eliminar

const router = Router();

router.post("/sales", createSale); // Crear venta
router.get("/sales", getSales); // Ver todas las ventas
router.get("/sales/:id", getSaleById); // Ver la venta por su id
router.delete("/sales/:id", deleteSale); // Eliminar venta

// Exportamos las rutas
export default router;