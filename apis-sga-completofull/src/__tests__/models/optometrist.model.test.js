import { jest } from "@jest/globals";
import { Sequelize } from "sequelize";

jest.unstable_mockModule("../../config/connect.db.js", () => ({
  default: new Sequelize("mysql://root:pass@127.0.0.1/test", { logging: false }),
}));

const { default: Optometrist } = await import("../../models/optometrist.model.js");

describe("Optometrist Model - Definición de estructura", () => {
  test("el modelo Optometrist existe", () => expect(Optometrist).toBeDefined());
  test("tableName es 'optometrist'", () => expect(Optometrist.getTableName()).toBe("optometrist"));

  test("id es primaryKey autoIncrement", () => {
    expect(Optometrist.rawAttributes.id.primaryKey).toBe(true);
    expect(Optometrist.rawAttributes.id.autoIncrement).toBe(true);
  });

  test("documentNumber tiene allowNull false", () => {
    expect(Optometrist.rawAttributes.documentNumber.allowNull).toBe(false);
  });

  test("email es único y tiene validación isEmail", () => {
    const attrs = Optometrist.rawAttributes.email;
    expect(attrs.unique).toBe(true);
    expect(attrs.validate?.isEmail).toBe(true);
  });

  test("firstName y firstLastName son obligatorios", () => {
    expect(Optometrist.rawAttributes.firstName.allowNull).toBe(false);
    expect(Optometrist.rawAttributes.firstLastName.allowNull).toBe(false);
  });

  test("idUser es UUID, único (relación 1:1)", () => {
    const attrs = Optometrist.rawAttributes.idUser;
    expect(attrs.type.constructor.name).toBe("UUID");
    expect(attrs.unique).toBe(true);
  });

  test("professionalCardCode tiene allowNull false y unique true", () => {
    const attrs = Optometrist.rawAttributes.professionalCardCode;
    expect(attrs.allowNull).toBe(false);
    expect(attrs.unique).toBe(true);
  });

  test("no tiene timestamps", () => {
    expect(Optometrist.options.timestamps).toBe(false);
  });

  test("freezeTableName está activo", () => {
    expect(Optometrist.options.freezeTableName).toBe(true);
  });
});
