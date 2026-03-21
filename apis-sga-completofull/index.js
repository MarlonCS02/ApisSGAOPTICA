import dotenv from "dotenv";
dotenv.config(); // Cargar variables de entorno ANTES de conectar

import app from "./src/app/app.js";
import sequelize from "./src/config/connect.db.js";
import { syncDatabase } from "./src/models/models.app.js";

(async () => {
  try {
    // 1. Probar conexión
    await sequelize.authenticate();
    console.log("Conectado correctamente a MySQL");

    // 2. Crear modelos y asociaciones + sincronizar
    await syncDatabase();

    // 3. Iniciar servidor
    const port = process.env.PORT || 3002;
    app.listen(port, () => {
      console.log(`Servidor conectado en puerto ${port}`);
    });

  } catch (error) {
    console.error("Error iniciando servidor:", error);
  }
})();
