import { jest } from "@jest/globals";
import { Sequelize } from "sequelize";

jest.unstable_mockModule("../../config/connect.db.js", () => ({
  default: new Sequelize("mysql://root:pass@127.0.0.1/test", { logging: false }),
}));

const { default: User } = await import("../../models/user.model.js");

describe("User Model - Definición de estructura", () => {
  test("el modelo User existe", () => expect(User).toBeDefined());
  test("tableName es 'user'", () => expect(User.getTableName()).toBe("user"));

  test("user_id es UUID y primaryKey", () => {
    const attrs = User.rawAttributes;
    expect(attrs.user_id.primaryKey).toBe(true);
    expect(attrs.user_id.type.constructor.name).toBe("UUID");
  });

  test("user_id tiene defaultValue UUIDV4", () => {
    expect(User.rawAttributes.user_id.defaultValue).toBeDefined();
  });

  test("user_user tiene allowNull false y unique true", () => {
    const attrs = User.rawAttributes;
    expect(attrs.user_user.allowNull).toBe(false);
    expect(attrs.user_user.unique).toBe(true);
  });

  test("user_password tiene allowNull false", () => {
    expect(User.rawAttributes.user_password.allowNull).toBe(false);
  });

  test("role_id tiene allowNull false", () => {
    expect(User.rawAttributes.role_id.allowNull).toBe(false);
  });

  test("tiene timestamps activados", () => {
    expect(User.options.timestamps).toBe(true);
  });

  test("freezeTableName está activo", () => {
    expect(User.options.freezeTableName).toBe(true);
  });
});
