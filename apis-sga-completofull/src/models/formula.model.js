// src/models/formula.model.js
import { Model, DataTypes } from "sequelize";
import sequelize from "../config/connect.db.js";

class Formula extends Model {}

Formula.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "id",
    },

    // ----------------------
    // FK: Customer
    // ----------------------
    customerId: {
      type: DataTypes.INTEGER, // Consistente con customer_id de Customer
      allowNull: false,
      field: "customer_id",
    },

    // ----------------------
    // FK: User (quien subió el archivo)
    // ----------------------
    uploadedById: {
      type: DataTypes.UUID, // Consistente con user_id de User
      allowNull: false,
      field: "uploaded_by_id",
    },

    filePath: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "file_path",
    },

    fileName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: "file_name",
    },

    fileType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "file_type",
    },

    uploadedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "uploaded_at",
    },

    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "description",
    },
  },
  {
    sequelize,
    modelName: "Formula",
    tableName: "formula",
    freezeTableName: true,
    timestamps: false,
  }
);

export default Formula;