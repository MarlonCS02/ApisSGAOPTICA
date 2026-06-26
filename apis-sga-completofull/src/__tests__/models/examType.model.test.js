import { jest } from "@jest/globals";
import { Sequelize } from "sequelize";

jest.unstable_mockModule("../../config/connect.db.js", () => ({
  default: new Sequelize("mysql://root:pass@127.0.0.1/test", { logging: false }),
}));

const { default: ExamType } = await import("../../models/examType.model.js");

describe("ExamType Model - Definición de estructura", () => {
  test("el modelo ExamType existe", () => expect(ExamType).toBeDefined());
  test("tableName es 'exam_type'", () => expect(ExamType.getTableName()).toBe("exam_type"));

  test("id es primaryKey autoIncrement", () => {
    expect(ExamType.rawAttributes.id.primaryKey).toBe(true);
    expect(ExamType.rawAttributes.id.autoIncrement).toBe(true);
  });

  test("name tiene allowNull false", () => {
    expect(ExamType.rawAttributes.name.allowNull).toBe(false);
  });

  test("description tiene allowNull true", () => {
    expect(ExamType.rawAttributes.description.allowNull).toBe(true);
  });

  test("no tiene timestamps", () => {
    expect(ExamType.options.timestamps).toBe(false);
  });

  test("freezeTableName está activo", () => {
    expect(ExamType.options.freezeTableName).toBe(true);
  });
});
