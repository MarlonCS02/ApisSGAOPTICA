import { jest } from "@jest/globals";
import { Sequelize } from "sequelize";

jest.unstable_mockModule("../../config/connect.db.js", () => ({
  default: new Sequelize("mysql://root:pass@127.0.0.1/test", { logging: false }),
}));

const { default: DocumentType } = await import("../../models/documentType.model.js");

describe("DocumentType Model - Definición de estructura", () => {
  test("el modelo DocumentType existe", () => expect(DocumentType).toBeDefined());
  test("tableName es 'document_type'", () => expect(DocumentType.getTableName()).toBe("document_type"));

  test("id_doc_type es primaryKey autoIncrement", () => {
    expect(DocumentType.rawAttributes.id_doc_type.primaryKey).toBe(true);
    expect(DocumentType.rawAttributes.id_doc_type.autoIncrement).toBe(true);
  });

  test("type_document tiene allowNull false", () => {
    expect(DocumentType.rawAttributes.type_document.allowNull).toBe(false);
  });

  test("document_name tiene allowNull false", () => {
    expect(DocumentType.rawAttributes.document_name.allowNull).toBe(false);
  });

  test("status tiene defaultValue 'ACTIVE'", () => {
    expect(DocumentType.rawAttributes.status.defaultValue).toBe("ACTIVE");
  });

  test("status tiene allowNull false", () => {
    expect(DocumentType.rawAttributes.status.allowNull).toBe(false);
  });

  test("no tiene timestamps", () => {
    expect(DocumentType.options.timestamps).toBe(false);
  });
});
