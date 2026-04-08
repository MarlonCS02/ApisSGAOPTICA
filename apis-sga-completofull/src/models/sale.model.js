// src/models/sale.model.js
import { Model, DataTypes } from "sequelize";
import sequelize from "../config/connect.db.js";

class Sale extends Model {}

Sale.init({
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true, 
    field: "id" 
  },
  dateSale: { 
    type: DataTypes.DATEONLY, 
    allowNull: false,
    field: "date_sale" 
  },
  numberBill: { 
    type: DataTypes.STRING(50), 
    allowNull: false,
    unique: true,
    field: "number_bill" 
  },
  total: { 
    type: DataTypes.FLOAT, 
    allowNull: false,
    defaultValue: 0.00,
    field: "total" 
  },
  // Clave Foránea: Customer (AHORA PERMITE NULL para ventas públicas)
  customerId: { 
    type: DataTypes.INTEGER,
    allowNull: true,  // ✅ CAMBIADO: null para clientes anónimos
    field: "customer_id" 
  },
  // Clave Foránea: PaymentType
  paymentTypeId: { 
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "payment_type_id" 
  },
  // ✅ NUEVOS CAMPOS PARA CLIENTES ANÓNIMOS (ventas públicas)
  guestName: {
    type: DataTypes.STRING(150),
    allowNull: true,
    field: "guest_name"
  },
  guestEmail: {
    type: DataTypes.STRING(150),
    allowNull: true,
    field: "guest_email"
  },
  guestPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: "guest_phone"
  },
  guestAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: "guest_address"
  }
}, {
  sequelize,
  modelName: "Sale",
  tableName: "sale",
  timestamps: false,
  freezeTableName: true
});

export default Sale;