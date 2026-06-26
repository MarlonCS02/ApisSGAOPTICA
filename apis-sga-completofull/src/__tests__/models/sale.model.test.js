import { jest } from "@jest/globals";
import { Sequelize } from "sequelize";

jest.unstable_mockModule("../../config/connect.db.js", () => ({
  default: new Sequelize("mysql://root:pass@127.0.0.1/test", { logging: false }),
}));

const { default: Sale } = await import("../../models/sale.model.js");

describe("Sale Model - Definición de estructura", () => {
  test("el modelo Sale existe", () => expect(Sale).toBeDefined());
  test("tableName es 'sale'", () => expect(Sale.getTableName()).toBe("sale"));

  test("id es primaryKey autoIncrement", () => {
    expect(Sale.rawAttributes.id.primaryKey).toBe(true);
    expect(Sale.rawAttributes.id.autoIncrement).toBe(true);
  });

  test("dateSale tiene allowNull false", () => {
    expect(Sale.rawAttributes.dateSale.allowNull).toBe(false);
  });

  test("numberBill tiene allowNull false y unique true", () => {
    expect(Sale.rawAttributes.numberBill.allowNull).toBe(false);
    expect(Sale.rawAttributes.numberBill.unique).toBe(true);
  });

  test("total tiene defaultValue 0.00", () => {
    expect(Sale.rawAttributes.total.defaultValue).toBe(0.0);
  });

  test("customerId puede ser nulo (ventas anónimas)", () => {
    expect(Sale.rawAttributes.customerId.allowNull).toBe(true);
  });

  test("paymentTypeId tiene allowNull false", () => {
    expect(Sale.rawAttributes.paymentTypeId.allowNull).toBe(false);
  });

  test("guestName puede ser nulo", () => {
    expect(Sale.rawAttributes.guestName.allowNull).toBe(true);
  });

  test("guestEmail puede ser nulo", () => {
    expect(Sale.rawAttributes.guestEmail.allowNull).toBe(true);
  });

  test("no tiene timestamps", () => {
    expect(Sale.options.timestamps).toBe(false);
  });
});
