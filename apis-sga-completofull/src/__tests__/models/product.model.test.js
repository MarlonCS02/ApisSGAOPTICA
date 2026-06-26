import { jest } from "@jest/globals";
import { Sequelize } from "sequelize";

jest.unstable_mockModule("../../config/connect.db.js", () => ({
  default: new Sequelize("mysql://root:pass@127.0.0.1/test", { logging: false }),
}));

const { default: Product } = await import("../../models/product.model.js");

describe("Product Model - Definición de estructura", () => {
  test("el modelo Product existe", () => expect(Product).toBeDefined());
  test("tableName es 'product'", () => expect(Product.getTableName()).toBe("product"));

  test("id es primaryKey autoIncrement", () => {
    const attrs = Product.rawAttributes;
    expect(attrs.id.primaryKey).toBe(true);
    expect(attrs.id.autoIncrement).toBe(true);
  });

  test("nameProduct tiene allowNull false y unique true", () => {
    const attrs = Product.rawAttributes;
    expect(attrs.nameProduct.allowNull).toBe(false);
    expect(attrs.nameProduct.unique).toBe(true);
  });

  test("unitPrice tiene allowNull false", () => {
    expect(Product.rawAttributes.unitPrice.allowNull).toBe(false);
  });

  test("stock tiene allowNull false y defaultValue 0", () => {
    const attrs = Product.rawAttributes;
    expect(attrs.stock.allowNull).toBe(false);
    expect(attrs.stock.defaultValue).toBe(0);
  });

  test("status tiene defaultValue 'ACTIVE'", () => {
    expect(Product.rawAttributes.status.defaultValue).toBe("ACTIVE");
  });

  test("imagen tiene allowNull true y defaultValue null", () => {
    const attrs = Product.rawAttributes;
    expect(attrs.imagen.allowNull).toBe(true);
    expect(attrs.imagen.defaultValue).toBeNull();
  });

  test("categoryId tiene allowNull true", () => {
    expect(Product.rawAttributes.categoryId.allowNull).toBe(true);
  });

  test("no tiene timestamps", () => {
    expect(Product.options.timestamps).toBe(false);
  });

  test("freezeTableName está activo", () => {
    expect(Product.options.freezeTableName).toBe(true);
  });
});
