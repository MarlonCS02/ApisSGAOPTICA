// src/models/paymentType.model.js
import { Model, DataTypes } from "sequelize";
import sequelize from "../config/connect.db.js";

class PaymentType extends Model {}

PaymentType.init({
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true, 
    field: "id" 
  },
  name: { 
    type: DataTypes.STRING(50), 
    field: "name" 
  }
}, {
  sequelize,
  modelName: "PaymentType",
  tableName: "payment_type",
  timestamps: false,
  freezeTableName: true // Agregado por consistencia
});

export default PaymentType;