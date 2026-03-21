import { Router } from "express";
import { getAllSaleProducts, getSaleProductById, createSaleProduct, updateSaleProduct, deleteSaleProduct} from "../controllers/saleProduct.controller.js";

// CREACIÓN DE RUTAS
const router = Router();

router.get("/saleProduct", getAllSaleProducts); // get: Obtener
router.get("/saleProduct/:id", getSaleProductById);
router.post("/saleProduct", createSaleProduct); // post: Crear datos
router.put("/saleProduct/:id", updateSaleProduct); // put: Actualizar
router.delete("/saleProduct/:id", deleteSaleProduct); // delete: Eliminar

// Exportamos las rutas
export default router;