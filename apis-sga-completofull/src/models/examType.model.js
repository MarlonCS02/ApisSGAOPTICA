// src/models/examType.model.js
import { Model, DataTypes } from "sequelize";
import sequelize from "../config/connect.db.js";

class ExamType extends Model {}

ExamType.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "id",
    },

    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "name",
    },

    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "description",
    },
  },
  {
    sequelize,
    modelName: "ExamType",
    tableName: "exam_type",
    freezeTableName: true,
    timestamps: false,
  }
);

export default ExamType;