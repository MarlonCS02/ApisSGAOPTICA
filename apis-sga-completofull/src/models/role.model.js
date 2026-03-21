// models/role.model.js
import { Model, DataTypes } from "sequelize";
import sequelize from "../config/connect.db.js";

class Role extends Model {}

Role.init(
  {
    role_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    role_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    role_description: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  },
  {
    sequelize,
    modelName: "Role",         // 👈 Nombre correcto del modelo
    tableName: "role",         // 👈 Nombre EXACTO de la tabla
    freezeTableName: true,     // 👈 Evita que Sequelize pluralice
    timestamps: false,
  }
);

export default Role;
