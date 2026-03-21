// src/models/saleProduct.model.js
import { Model, DataTypes } from "sequelize";
import sequelize from "../config/connect.db.js";

class SaleProduct extends Model {}

SaleProduct.init({
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true, 
    field: "id" 
  },
  quantity: { 
    type: DataTypes.INTEGER, 
    allowNull: false, // MEJORA: Cantidad obligatoria
    field: "quantity" // CORRECCIÓN: Usando 'quantity' por consistencia. Si tu DB tiene 'cuantity', cambia esto.
  }, 
  sellPrice: { 
    type: DataTypes.FLOAT, 
    allowNull: false, // MEJORA: Precio de venta obligatorio
    field: "sell_price" 
  },
  // Clave Foránea: Sale
  saleId: { 
    type: DataTypes.INTEGER, 
    allowNull: false, // MEJORA: ID de Venta obligatorio
    field: "id_sale" 
  },
  // Clave Foránea: Product
  productId: { 
    type: DataTypes.INTEGER, 
    allowNull: false, // MEJORA: ID de Producto obligatorio
    field: "id_product" 
  }
}, {
  sequelize,
  modelName: "SaleProduct",
  tableName: "sale_product",
  timestamps: false,
  freezeTableName: true, // AGREGADO: Para evitar pluralización

  // CRÍTICO: Asegura que un producto no se pueda vender dos veces en la misma venta
  indexes: [
    {
      unique: true,
      fields: ['id_sale', 'id_product'] // Usar nombres de campo de la DB
    }
  ]
});

export default SaleProduct;