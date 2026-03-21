// models/documentType.model.js
import { Model, DataTypes } from "sequelize";
import sequelize from "../config/connect.db.js";

class DocumentType extends Model {}

DocumentType.init(
  {
    id_doc_type: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    type_document: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    document_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    status: {
      type: DataTypes.STRING(40),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
  },
  {
    sequelize,
    modelName: "DocumentType",
    tableName: "document_type",
    timestamps: false,
    freezeTableName: true,
  }
);

export default DocumentType;
