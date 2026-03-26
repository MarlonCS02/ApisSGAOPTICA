import { Router } from "express";
import {
  requestPasswordReset,
  verifyResetCode,
  resetPassword
} from "../controllers/password.controller.js";

const router = Router();

// Rutas de recuperación de contraseña
router.post("/password/request-reset", requestPasswordReset);  // Solicitar código
router.post("/password/verify-code", verifyResetCode);          // Verificar código
router.post("/password/reset", resetPassword);                  // Restablecer contraseña

export default router;