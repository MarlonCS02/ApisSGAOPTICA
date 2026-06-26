import { jest } from "@jest/globals";
import { Sequelize } from "sequelize";

jest.unstable_mockModule("../../config/connect.db.js", () => ({
  default: new Sequelize("mysql://root:pass@127.0.0.1/test", { logging: false }),
}));

const { default: PaymentType } = await import("../../models/paymentType.model.js");

describe("PaymentType Model - Definición de estructura", () => {
  test("el modelo PaymentType existe", () => expect(PaymentType).toBeDefined());
  test("tableName es 'payment_type'", () => expect(PaymentType.getTableName()).toBe("payment_type"));

  test("id es primaryKey autoIncrement", () => {
    expect(PaymentType.rawAttributes.id.primaryKey).toBe(true);
    expect(PaymentType.rawAttributes.id.autoIncrement).toBe(true);
  });

  test("name está definido", () => {
    expect(PaymentType.rawAttributes.name).toBeDefined();
  });

  test("no tiene timestamps", () => {
    expect(PaymentType.options.timestamps).toBe(false);
  });

  test("freezeTableName está activo", () => {
    expect(PaymentType.options.freezeTableName).toBe(true);
  });
});
