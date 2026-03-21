import { Router } from "express";
import { getRoles, getRoleById, createRole, updateRole, deleteRole } from "../controllers/role.controller.js";

// --- CREACION DE RUTAS --- //
// get: Obtener
// post: Crear datos
// put: Actualizar
// delete: Eliminar

const router = Router();

router.get('/roles', getRoles); // TOdos los roles
router.get('/roles/:id', getRoleById); // Roles por id
router.post('/roles', createRole); // Crear un rol
router.put('/roles/:id', updateRole); // Actualizar un rol
router.delete('/roles/:id', deleteRole); // Eliminar un rol

// Exportamos las rutas
export default router;