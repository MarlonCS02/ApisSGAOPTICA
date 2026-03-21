import { Model, DataTypes } from "sequelize";
import sequelize from "../config/connect.db.js";

class Category extends Model {}

Category.init(
  {
    category_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: "category_id",
    },
    category_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: "category_name",
    },
  },
  {
    sequelize,
    modelName: "Category",
    tableName: "category",
    timestamps: false,
    freezeTableName: true // AGREGADO: Para evitar pluralización
  }
);

export default Category;