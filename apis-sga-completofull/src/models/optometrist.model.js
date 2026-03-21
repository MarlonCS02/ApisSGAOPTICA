// src/models/optometrist.model.js
import { Model, DataTypes } from "sequelize";
import sequelize from "../config/connect.db.js";

class Optometrist extends Model {}

Optometrist.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "id",
    },

    documentNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "document_number",
    },

    email: {
      type: DataTypes.STRING(254),
      allowNull: false,
      unique: true, // Agregado: El email de un optómetra debe ser único
      validate: { isEmail: true },
      field: "email",
    },

    firstName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "first_name",
    },

    secondName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "second_name",
    },

    firstLastName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "first_last_name",
    },

    secondLastName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "second_last_name",
    },

    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: "phone_number",
    },

    // ----------------------
    // FK: DocumentType (Tipo de dato corregido a INTEGER)
    // ----------------------
    idDocType: {
      type: DataTypes.INTEGER, // ¡CORRECCIÓN!
      allowNull: false,
      field: "id_doc_type",
    },

    // ----------------------
    // FK: User (Agregado unique: true para relación 1:1)
    // ----------------------
    idUser: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true, // ¡CLAVE para la relación 1:1 con User!
      field: "id_user",
    },

    professionalCardCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true, // Asumimos que el código de tarjeta es único
      field: "professional_card_code",
    },
  },
  {
    sequelize,
    modelName: "Optometrist",
    tableName: "optometrist",
    freezeTableName: true,
    timestamps: false,
  }
);

export default Optometrist;