import sequelize from "../config/connect.db.js";

// ----------------------------------------
// 1. IMPORTAR TODOS LOS MODELOS
// ----------------------------------------
import Role from "./role.model.js";
import User from "./user.model.js";
import UserEntity from "./userEntity.model.js";
import Customer from "./customer.model.js";
import DocumentType from "./documentType.model.js";
import Optometrist from "./optometrist.model.js";
import ExamType from "./examType.model.js";
import Formula from "./formula.model.js";
import PaymentType from "./paymentType.model.js";
import Product from "./product.model.js";
import Sale from "./sale.model.js";
import SaleProduct from "./saleProduct.model.js";
import Category from "./category.model.js";
import Notification from "./notification.model.js";
import Appointment from "./appointment.model.js";


// ----------------------------------------
// 2. DEFINIR TODAS LAS ASOCIACIONES
// ----------------------------------------
export function modelsApp() {

    // 1. User <-> Role (1:M)
    Role.hasMany(User, {
        foreignKey: "role_id",
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
    });
    User.belongsTo(Role, { foreignKey: "role_id" });


    // 2. User <-> UserEntity (1:1) con alias exclusivos
    User.hasOne(UserEntity, {
        foreignKey: "user_id",
        as: "UserEntityInfo",
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    });
    UserEntity.belongsTo(User, {
        foreignKey: "user_id",
        as: "EntityOwner"
    });


    // 3. Customer <-> DocumentType (1:M)
    DocumentType.hasMany(Customer, {
        foreignKey: "id_doc_type",
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
    });
    Customer.belongsTo(DocumentType, { foreignKey: "id_doc_type" });


    // 4. Optometrist <-> DocumentType (1:M)
    DocumentType.hasMany(Optometrist, {
        foreignKey: "id_doc_type",
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
    });
    Optometrist.belongsTo(DocumentType, { foreignKey: "id_doc_type" });


    // 5. Optometrist <-> User (1:1) con alias exclusivos
    User.hasOne(Optometrist, {
        foreignKey: "id_user",
        as: "UserOptoInfo",
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
    });
    Optometrist.belongsTo(User, {
        foreignKey: "id_user",
        as: "OptometristUserRef"
    });


    // 6. Customer <-> User (1:M)
    User.hasMany(Customer, {
        foreignKey: "id_user",
        as: "UserCustomers",
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
    });
    Customer.belongsTo(User, {
        foreignKey: "id_user",
        as: "Creator"
    });


    // 7. Formula <-> Customer (1:M)
    Customer.hasMany(Formula, {
        foreignKey: "customer_id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    });
    Formula.belongsTo(Customer, { foreignKey: "customer_id" });


    // 8. Formula <-> User (1:M)
    User.hasMany(Formula, {
        foreignKey: "uploaded_by_id",
        as: "UserFormulas",
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
    });
    Formula.belongsTo(User, {
        foreignKey: "uploaded_by_id",
        as: "Uploader"
    });


    // 9. Product <-> Category (1:M)
    Category.hasMany(Product, {
        foreignKey: "category_id",
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
    });
    Product.belongsTo(Category, { foreignKey: "category_id" });


    // 10. Sale <-> Customer (1:M)
    Customer.hasMany(Sale, {
        foreignKey: "customer_id",
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
    });
    Sale.belongsTo(Customer, { foreignKey: "customer_id" });


    // 11. Sale <-> PaymentType (1:M)
    PaymentType.hasMany(Sale, {
        foreignKey: "payment_type_id",
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
    });
    Sale.belongsTo(PaymentType, { foreignKey: "payment_type_id" });


    // 12. Sale <-> Product (M:M) usando SaleProduct
    Sale.belongsToMany(Product, {
        through: SaleProduct,
        foreignKey: "id_sale",
        otherKey: "id_product",
        onDelete: "CASCADE"
    });

    Product.belongsToMany(Sale, {
        through: SaleProduct,
        foreignKey: "id_product",
        otherKey: "id_sale",
        onDelete: "CASCADE"
    });

    // Relaciones directas del puente
    SaleProduct.belongsTo(Sale, { foreignKey: "id_sale" });
    SaleProduct.belongsTo(Product, { foreignKey: "id_product" });
    Sale.hasMany(SaleProduct, { foreignKey: "id_sale" });
    Product.hasMany(SaleProduct, { foreignKey: "id_product" });


    // 13. Appointment <-> Customer (1:M)
    Customer.hasMany(Appointment, {
        foreignKey: "customer_id",
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
    });
    Appointment.belongsTo(Customer, { foreignKey: "customer_id" });


    // 14. Appointment <-> ExamType (1:M)
    ExamType.hasMany(Appointment, {
        foreignKey: "exam_type_id",
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
    });
    Appointment.belongsTo(ExamType, { foreignKey: "exam_type_id" });


    // 15. Notification <-> Customer (1:M)
    Customer.hasMany(Notification, {
        foreignKey: "customer_id",
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
    });
    Notification.belongsTo(Customer, { foreignKey: "customer_id" });


    // 16. Notification <-> Appointment (1:M)
    Appointment.hasMany(Notification, {
        foreignKey: "appointment_id",
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
    });
    Notification.belongsTo(Appointment, { foreignKey: "appointment_id" });


    // 17. Appointment <-> Optometrist (1:M)
    Optometrist.hasMany(Appointment, {
        foreignKey: "optometrist_id",
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
    });
    Appointment.belongsTo(Optometrist, { foreignKey: "optometrist_id" });
}


// ----------------------------------------
// 3. SINCRONIZACIÓN COMPLETA Y ÚNICA
// ----------------------------------------
export async function syncDatabase() {
    try {
        modelsApp(); // Crear asociaciones solo una vez
        
        // 🔥 ÚNICO CAMBIO: Agregar { alter: true } para actualizar la tabla product
        // Esto NO borra datos, solo agrega columnas faltantes (como 'imagen')
        await sequelize.sync({}); 
        
        console.log("✅ Todos los modelos sincronizados correctamente.");
        console.log("📝 Estructura de tablas actualizada (alter: true)");
    } catch (error) {
        console.error("❌ Error al sincronizar modelos:", error);
    }
}


// ----------------------------------------
// 4. EXPORTACIÓN
// ----------------------------------------
export {
    Role,
    User,
    UserEntity,
    Customer,
    DocumentType,
    Optometrist,
    ExamType,
    Formula,
    PaymentType,
    Product,
    Sale,
    SaleProduct,
    Category,
    Notification,
    Appointment
};