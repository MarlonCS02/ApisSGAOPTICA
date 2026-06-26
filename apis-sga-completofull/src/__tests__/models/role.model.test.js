import { jest } from "@jest/globals";
import { Sequelize } from "sequelize";

jest.unstable_mockModule("../../config/connect.db.js", () => ({
  default: new Sequelize("mysql://root:pass@127.0.0.1/test", { logging: false }),
}));

const { default: Role } = await import("../../models/role.model.js");

describe("Role Model - Definición de estructura", () => {
  test("el modelo Role existe", () => {
    expect(Role).toBeDefined();
  });

  test("tableName es 'role'", () => {
    expect(Role.getTableName()).toBe("role");
  });

  test("role_id es primaryKey autoIncrement", () => {
    const attrs = Role.rawAttributes;
    expect(attrs.role_id.primaryKey).toBe(true);
    expect(attrs.role_id.autoIncrement).toBe(true);
  });

  test("role_name tiene allowNull false y unique true", () => {
    const attrs = Role.rawAttributes;
    expect(attrs.role_name.allowNull).toBe(false);
    expect(attrs.role_name.unique).toBe(true);
  });

  test("role_description tiene allowNull false", () => {
    expect(Role.rawAttributes.role_description.allowNull).toBe(false);
  });

  test("no tiene timestamps", () => {
    expect(Role.options.timestamps).toBe(false);
  });

  test("freezeTableName está activo", () => {
    expect(Role.options.freezeTableName).toBe(true);
  });

  test("modelName es 'Role'", () => {
    expect(Role.name).toBe("Role");
  });
});
