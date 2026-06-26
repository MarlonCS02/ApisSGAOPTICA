import { jest } from "@jest/globals";
import { Sequelize } from "sequelize";

// Mock de la conexión a BD ANTES de importar el modelo (patrón ESM nativo de Jest 30)
jest.unstable_mockModule("../../config/connect.db.js", () => ({
  default: new Sequelize("mysql://root:pass@127.0.0.1/test", { logging: false }),
}));

// Import dinámico DESPUÉS de registrar el mock
const { default: Category } = await import("../../models/category.model.js");

describe("Category Model - Definición de estructura", () => {
  test("el modelo Category existe", () => {
    expect(Category).toBeDefined();
  });

  test("tableName es 'category'", () => {
    expect(Category.getTableName()).toBe("category");
  });

  test("tiene campo category_id como primaryKey autoIncrement", () => {
    const attrs = Category.rawAttributes;
    expect(attrs.category_id.primaryKey).toBe(true);
    expect(attrs.category_id.autoIncrement).toBe(true);
  });

  test("category_name tiene allowNull false y unique true", () => {
    const attrs = Category.rawAttributes;
    expect(attrs.category_name.allowNull).toBe(false);
    expect(attrs.category_name.unique).toBe(true);
  });

  test("no tiene timestamps", () => {
    expect(Category.options.timestamps).toBe(false);
  });

  test("freezeTableName está activo", () => {
    expect(Category.options.freezeTableName).toBe(true);
  });
});
