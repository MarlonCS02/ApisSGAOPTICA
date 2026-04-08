// src/models/customer.model.js
import { Model, DataTypes } from "sequelize";
import sequelize from "../config/connect.db.js";

class Customer extends Model {}

Customer.init(
  {
    customer_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    idUser: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "id_user",
    },
    idDocType: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "id_doc_type",
    },
    documentNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    secondName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    firstLastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    secondLastName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
  },
  {
    sequelize,
    modelName: "Customer",
    tableName: "customer",
    freezeTableName: true,
    timestamps: true,
  }
);

export default Customer;