import { Model, DataTypes } from "sequelize";
import sequelize from "../config/connect.db.js";

class Product extends Model {}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "id"
    },
    // ✅ Versión camelCase para usar en el código
    nameProduct: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: "name_product"  // Mapea a la columna name_product
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "description"  // Mapea a la columna description
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "stock"
    },
    unitPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
      field: "unit_price"  // Mapea a la columna unit_price
    },
    status: {
      type: DataTypes.STRING(40),
      defaultValue: "ACTIVE",
      field: "status"
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "category_id"  // Mapea a la columna category_id
    },
    imagen: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "imagen",
      defaultValue: null
    }
  },
  {
    sequelize,
    modelName: "Product",
    tableName: "product",
    timestamps: false,
    freezeTableName: true
  }
);

export default Product;