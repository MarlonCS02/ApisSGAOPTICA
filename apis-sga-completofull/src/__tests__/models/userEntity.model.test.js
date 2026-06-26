import { jest } from "@jest/globals";
import { Sequelize } from "sequelize";

jest.unstable_mockModule("../../config/connect.db.js", () => ({
  default: new Sequelize("mysql://root:pass@127.0.0.1/test", { logging: false }),
}));

const { default: UserEntity } = await import("../../models/userEntity.model.js");

describe("UserEntity Model - Definición de estructura", () => {
  test("el modelo UserEntity existe", () => expect(UserEntity).toBeDefined());
  test("tableName es 'user_entity'", () => expect(UserEntity.getTableName()).toBe("user_entity"));

  test("id es primaryKey autoIncrement", () => {
    expect(UserEntity.rawAttributes.id.primaryKey).toBe(true);
    expect(UserEntity.rawAttributes.id.autoIncrement).toBe(true);
  });

  test("user_id es UUID, obligatorio y único (relación 1:1)", () => {
    const attrs = UserEntity.rawAttributes.user_id;
    expect(attrs.allowNull).toBe(false);
    expect(attrs.unique).toBe(true);
    expect(attrs.type.constructor.name).toBe("UUID");
  });

  test("first_name y last_name son obligatorios", () => {
    expect(UserEntity.rawAttributes.first_name.allowNull).toBe(false);
    expect(UserEntity.rawAttributes.last_name.allowNull).toBe(false);
  });

  test("phone y address son opcionales", () => {
    expect(UserEntity.rawAttributes.phone.allowNull).toBe(true);
    expect(UserEntity.rawAttributes.address.allowNull).toBe(true);
  });

  test("no tiene timestamps", () => {
    expect(UserEntity.options.timestamps).toBe(false);
  });

  test("freezeTableName está activo", () => {
    expect(UserEntity.options.freezeTableName).toBe(true);
  });
});
