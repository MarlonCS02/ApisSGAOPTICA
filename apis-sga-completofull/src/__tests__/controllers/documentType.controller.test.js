import { jest } from "@jest/globals";

const DocumentTypeMock = { findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn() };
jest.unstable_mockModule("../../models/documentType.model.js", () => ({ default: DocumentTypeMock }));

const { getAllDocumentTypes, getDocumentTypeById, createDocumentType, updateDocumentType, deleteDocumentType } = await import("../../controllers/documentType.controller.js");

const mockRes = () => { const r = {}; r.status = jest.fn().mockReturnValue(r); r.json = jest.fn().mockReturnValue(r); return r; };
afterEach(() => jest.clearAllMocks());

describe("DocumentTypeController - getAllDocumentTypes", () => {
  test("200: retorna todos los tipos", async () => {
    DocumentTypeMock.findAll.mockResolvedValue([{ id_doc_type: 1, type_document: "CC" }]);
    const res = mockRes();
    await getAllDocumentTypes({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
  test("500: maneja error", async () => {
    DocumentTypeMock.findAll.mockRejectedValue(new Error("DB"));
    const res = mockRes();
    await getAllDocumentTypes({}, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("DocumentTypeController - getDocumentTypeById", () => {
  test("200: retorna tipo por ID", async () => {
    DocumentTypeMock.findByPk.mockResolvedValue({ id_doc_type: 1, type_document: "CC" });
    const res = mockRes();
    await getDocumentTypeById({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
  test("404: tipo no encontrado", async () => {
    DocumentTypeMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await getDocumentTypeById({ params: { id: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Document Type not found" }));
  });
});

describe("DocumentTypeController - createDocumentType", () => {
  test("400: faltan campos requeridos", async () => {
    const res = mockRes();
    await createDocumentType({ body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Missing required fields: type_document and document_name." }));
  });
  test("400: falta document_name", async () => {
    const res = mockRes();
    await createDocumentType({ body: { type_document: "TI" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
  test("201: crea tipo exitosamente", async () => {
    const dt = { id_doc_type: 3, type_document: "PAS", document_name: "Pasaporte" };
    DocumentTypeMock.create.mockResolvedValue(dt);
    const res = mockRes();
    await createDocumentType({ body: { type_document: "PAS", document_name: "Pasaporte" } }, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(dt);
  });
  test("409: nombre duplicado", async () => {
    const err = new Error("Dup"); err.name = "SequelizeUniqueConstraintError"; err.errors = [{ message: "unique" }];
    DocumentTypeMock.create.mockRejectedValue(err);
    const res = mockRes();
    await createDocumentType({ body: { type_document: "CC", document_name: "Cédula" } }, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });
});

describe("DocumentTypeController - updateDocumentType", () => {
  test("200: actualiza tipo exitosamente", async () => {
    const dt = { id_doc_type: 1, update: jest.fn().mockResolvedValue({ id_doc_type: 1, status: "INACTIVE" }) };
    DocumentTypeMock.findByPk.mockResolvedValue(dt);
    const res = mockRes();
    await updateDocumentType({ params: { id: 1 }, body: { status: "INACTIVE" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
  test("404: tipo no encontrado", async () => {
    DocumentTypeMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await updateDocumentType({ params: { id: 99 }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe("DocumentTypeController - deleteDocumentType (soft delete)", () => {
  test("200: desactiva tipo exitosamente", async () => {
    const dt = { id_doc_type: 1, update: jest.fn().mockResolvedValue(true) };
    DocumentTypeMock.findByPk.mockResolvedValue(dt);
    const res = mockRes();
    await deleteDocumentType({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Document Type deactivated successfully (Soft Deleted)" }));
  });
  test("404: tipo no encontrado", async () => {
    DocumentTypeMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await deleteDocumentType({ params: { id: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
