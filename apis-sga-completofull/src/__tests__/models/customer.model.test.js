import { jest } from "@jest/globals";
import { Sequelize } from "sequelize";

jest.unstable_mockModule("../../config/connect.db.js", () => ({
  default: new Sequelize("mysql://root:pass@127.0.0.1/test", { logging: false }),
}));

const { default: Customer } = await import("../../models/customer.model.js");

describe("Customer Model - Definición de estructura", () => {
  test("el modelo Customer existe", () => expect(Customer).toBeDefined());
  test("tableName es 'customer'", () => expect(Customer.getTableName()).toBe("customer"));

  test("customer_id es primaryKey autoIncrement", () => {
    const attrs = Customer.rawAttributes;
    expect(attrs.customer_id.primaryKey).toBe(true);
    expect(attrs.customer_id.autoIncrement).toBe(true);
  });

  test("firstName tiene allowNull false", () => {
    expect(Customer.rawAttributes.firstName.allowNull).toBe(false);
  });

  test("firstLastName tiene allowNull false", () => {
    expect(Customer.rawAttributes.firstLastName.allowNull).toBe(false);
  });

  test("idUser tiene allowNull false", () => {
    expect(Customer.rawAttributes.idUser.allowNull).toBe(false);
  });

  test("secondName puede ser nulo", () => {
    expect(Customer.rawAttributes.secondName.allowNull).toBe(true);
  });

  test("secondLastName puede ser nulo", () => {
    expect(Customer.rawAttributes.secondLastName.allowNull).toBe(true);
  });

  test("email tiene allowNull true y validación de email", () => {
    const emailAttr = Customer.rawAttributes.email;
    expect(emailAttr.allowNull).toBe(true);
    expect(emailAttr.validate?.isEmail).toBe(true);
  });

  test("documentNumber tiene unique true", () => {
    expect(Customer.rawAttributes.documentNumber.unique).toBe(true);
  });

  test("tiene timestamps activados", () => {
    expect(Customer.options.timestamps).toBe(true);
  });

  test("freezeTableName está activo", () => {
    expect(Customer.options.freezeTableName).toBe(true);
  });
});
