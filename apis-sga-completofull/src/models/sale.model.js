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
    allowNull: false, // MEJORA: La fecha de venta es obligatoria
    field: "date_sale" 
  },
  numberBill: { 
    type: DataTypes.STRING(50), 
    allowNull: false, // MEJORA: Número de factura obligatorio
    unique: true, // MEJORA: El número de factura debe ser único
    field: "number_bill" 
  },
  total: { 
    type: DataTypes.FLOAT, 
    allowNull: false, // MEJORA: El total es obligatorio
    defaultValue: 0.00, // MEJORA: Valor por defecto
    field: "total" 
  },
  // Clave Foránea: Customer
  customerId: { 
    type: DataTypes.INTEGER, // Consistente con Customer PK
    allowNull: false, // MEJORA: Toda venta debe tener un cliente
    field: "customer_id" 
  },
  // Clave Foránea: PaymentType
  paymentTypeId: { 
    type: DataTypes.INTEGER, // Consistente con PaymentType PK
    allowNull: false, // MEJORA: Toda venta debe tener un tipo de pago
    field: "payment_type_id" 
  }
}, {
  sequelize,
  modelName: "Sale",
  tableName: "sale",
  timestamps: false,
  freezeTableName: true // AGREGADO: Para evitar pluralización
});

export default Sale;