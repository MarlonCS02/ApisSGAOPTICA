import { jest } from "@jest/globals";
import { Sequelize } from "sequelize";

jest.unstable_mockModule("../../config/connect.db.js", () => ({
  default: new Sequelize("mysql://root:pass@127.0.0.1/test", { logging: false }),
}));

const { default: Appointment } = await import("../../models/appointment.model.js");

describe("Appointment Model - Definición de estructura", () => {
  test("el modelo Appointment existe", () => expect(Appointment).toBeDefined());
  test("tableName es 'appointment'", () => expect(Appointment.getTableName()).toBe("appointment"));

  test("appointment_id es primaryKey autoIncrement", () => {
    const attrs = Appointment.rawAttributes;
    expect(attrs.appointment_id.primaryKey).toBe(true);
    expect(attrs.appointment_id.autoIncrement).toBe(true);
  });

  test("date tiene allowNull false", () => {
    expect(Appointment.rawAttributes.date.allowNull).toBe(false);
  });

  test("time tiene allowNull false", () => {
    expect(Appointment.rawAttributes.time.allowNull).toBe(false);
  });

  test("status tiene defaultValue 'PENDING'", () => {
    expect(Appointment.rawAttributes.status.defaultValue).toBe("PENDING");
  });

  test("status tiene allowNull false", () => {
    expect(Appointment.rawAttributes.status.allowNull).toBe(false);
  });

  test("customer_id tiene allowNull false", () => {
    expect(Appointment.rawAttributes.customer_id.allowNull).toBe(false);
  });

  test("exam_type_id tiene allowNull false", () => {
    expect(Appointment.rawAttributes.exam_type_id.allowNull).toBe(false);
  });

  test("tiene timestamps activados", () => {
    expect(Appointment.options.timestamps).toBe(true);
  });

  test("freezeTableName está activo", () => {
    expect(Appointment.options.freezeTableName).toBe(true);
  });
});
