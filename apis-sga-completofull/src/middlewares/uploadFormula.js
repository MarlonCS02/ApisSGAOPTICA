// src/middlewares/uploadFormula.js

import multer from 'multer';
import path from 'path';

// --- CONFIGURACIÓN DE ALMACENAMIENTO ---
const storage = multer.diskStorage({
    // 1. Directorio de destino: Donde se guardarán los archivos
    destination: (req, file, cb) => {
        // Asegúrate de que esta carpeta exista en la raíz de tu proyecto
        cb(null, 'public/uploads/formulas'); 
    },
    // 2. Definición del nombre del archivo
    filename: (req, file, cb) => {
        // Generamos un nombre único:
        // Formula-[timestamp]-[extension original]
        const extension = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'Formula-' + uniqueSuffix + extension);
    }
});

// --- FILTRO DE ARCHIVOS (Para seguridad) ---
const fileFilter = (req, file, cb) => {
    // Aceptamos PDFs, JPEGs, PNGs (ejemplos)
    const allowedMimeTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        // Aceptar archivo
        cb(null, true);
    } else {
        // Rechazar archivo
        cb(null, false);
        // Puedes pasar un error, pero es mejor manejarlo en el controller o con un error handler
        // cb(new Error('Tipo de archivo no soportado. Solo se permiten PDF, JPEG y PNG.'), false); 
    }
};


// --- CREACIÓN DEL MIDDLEWARE FINAL ---
const uploadFormula = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    // Límite de tamaño (ej. 5 MB)
    limits: { fileSize: 1024 * 1024 * 5 } 
});

export default uploadFormula;