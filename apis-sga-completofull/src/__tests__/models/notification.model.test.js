import { jest } from "@jest/globals";
import { Sequelize } from "sequelize";

jest.unstable_mockModule("../../config/connect.db.js", () => ({
  default: new Sequelize("mysql://root:pass@127.0.0.1/test", { logging: false }),
}));

const { default: Notification } = await import("../../models/notification.model.js");

describe("Notification Model - Definición de estructura", () => {
  test("el modelo Notification existe", () => expect(Notification).toBeDefined());
  test("tableName es 'notification'", () => expect(Notification.getTableName()).toBe("notification"));

  test("notification_id es primaryKey autoIncrement", () => {
    expect(Notification.rawAttributes.notification_id.primaryKey).toBe(true);
    expect(Notification.rawAttributes.notification_id.autoIncrement).toBe(true);
  });

  test("type tiene allowNull false", () => {
    expect(Notification.rawAttributes.type.allowNull).toBe(false);
  });

  test("subject tiene allowNull false", () => {
    expect(Notification.rawAttributes.subject.allowNull).toBe(false);
  });

  test("message tiene allowNull false", () => {
    expect(Notification.rawAttributes.message.allowNull).toBe(false);
  });

  test("status tiene defaultValue 'SENT'", () => {
    expect(Notification.rawAttributes.status.defaultValue).toBe("SENT");
  });

  test("appointment_id tiene allowNull true (SET NULL)", () => {
    expect(Notification.rawAttributes.appointment_id.allowNull).toBe(true);
  });

  test("customer_id tiene allowNull false", () => {
    expect(Notification.rawAttributes.customer_id.allowNull).toBe(false);
  });

  test("no tiene timestamps", () => {
    expect(Notification.options.timestamps).toBe(false);
  });
});
