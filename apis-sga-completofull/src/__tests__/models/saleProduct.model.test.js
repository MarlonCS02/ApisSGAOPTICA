import { jest } from "@jest/globals";
import { Sequelize } from "sequelize";

jest.unstable_mockModule("../../config/connect.db.js", () => ({
  default: new Sequelize("mysql://root:pass@127.0.0.1/test", { logging: false }),
}));

const { default: SaleProduct } = await import("../../models/saleProduct.model.js");

describe("SaleProduct Model - Definición de estructura", () => {
  test("el modelo SaleProduct existe", () => expect(SaleProduct).toBeDefined());
  test("tableName es 'sale_product'", () => expect(SaleProduct.getTableName()).toBe("sale_product"));

  test("id es primaryKey autoIncrement", () => {
    expect(SaleProduct.rawAttributes.id.primaryKey).toBe(true);
    expect(SaleProduct.rawAttributes.id.autoIncrement).toBe(true);
  });

  test("quantity tiene allowNull false", () => {
    expect(SaleProduct.rawAttributes.quantity.allowNull).toBe(false);
  });

  test("sellPrice tiene allowNull false", () => {
    expect(SaleProduct.rawAttributes.sellPrice.allowNull).toBe(false);
  });

  test("saleId (FK) tiene allowNull false", () => {
    expect(SaleProduct.rawAttributes.saleId.allowNull).toBe(false);
  });

  test("productId (FK) tiene allowNull false", () => {
    expect(SaleProduct.rawAttributes.productId.allowNull).toBe(false);
  });

  test("tiene índice único compuesto (id_sale + id_product)", () => {
    const indexes = SaleProduct.options.indexes;
    expect(indexes).toBeDefined();
    expect(indexes[0].unique).toBe(true);
    expect(indexes[0].fields).toEqual(["id_sale", "id_product"]);
  });

  test("no tiene timestamps", () => {
    expect(SaleProduct.options.timestamps).toBe(false);
  });

  test("freezeTableName está activo", () => {
    expect(SaleProduct.options.freezeTableName).toBe(true);
  });
});
