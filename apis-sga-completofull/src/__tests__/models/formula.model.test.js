import { jest } from "@jest/globals";
import { Sequelize } from "sequelize";

jest.unstable_mockModule("../../config/connect.db.js", () => ({
  default: new Sequelize("mysql://root:pass@127.0.0.1/test", { logging: false }),
}));

const { default: Formula } = await import("../../models/formula.model.js");

describe("Formula Model - Definición de estructura", () => {
  test("el modelo Formula existe", () => expect(Formula).toBeDefined());
  test("tableName es 'formula'", () => expect(Formula.getTableName()).toBe("formula"));

  test("id es primaryKey autoIncrement", () => {
    expect(Formula.rawAttributes.id.primaryKey).toBe(true);
    expect(Formula.rawAttributes.id.autoIncrement).toBe(true);
  });

  test("customerId tiene allowNull false", () => {
    expect(Formula.rawAttributes.customerId.allowNull).toBe(false);
  });

  test("uploadedById es UUID y obligatorio", () => {
    const attrs = Formula.rawAttributes.uploadedById;
    expect(attrs.allowNull).toBe(false);
    expect(attrs.type.constructor.name).toBe("UUID");
  });

  test("filePath, fileName y fileType son obligatorios", () => {
    expect(Formula.rawAttributes.filePath.allowNull).toBe(false);
    expect(Formula.rawAttributes.fileName.allowNull).toBe(false);
    expect(Formula.rawAttributes.fileType.allowNull).toBe(false);
  });

  test("uploadedAt tiene defaultValue DataTypes.NOW", () => {
    expect(Formula.rawAttributes.uploadedAt.defaultValue).toBeDefined();
  });

  test("description puede ser nulo", () => {
    expect(Formula.rawAttributes.description.allowNull).toBe(true);
  });

  test("no tiene timestamps", () => {
    expect(Formula.options.timestamps).toBe(false);
  });
});
