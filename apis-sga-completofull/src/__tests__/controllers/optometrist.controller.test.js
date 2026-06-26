import { jest } from "@jest/globals";

const OptometristMock = { findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn() };
const UserMock = { findByPk: jest.fn() };
const DocumentTypeMock = { findByPk: jest.fn() };

jest.unstable_mockModule("../../models/optometrist.model.js", () => ({ default: OptometristMock }));
jest.unstable_mockModule("../../models/user.model.js", () => ({ default: UserMock }));
jest.unstable_mockModule("../../models/documentType.model.js", () => ({ default: DocumentTypeMock }));

const { getAllOptometrists, getOptometristById, createOptometrist, updateOptometrist, deleteOptometrist } = await import("../../controllers/optometrist.controller.js");

const mockRes = () => { const r = {}; r.status = jest.fn().mockReturnValue(r); r.json = jest.fn().mockReturnValue(r); return r; };
afterEach(() => jest.clearAllMocks());

describe("OptometristController - getAllOptometrists", () => {
  test("200: retorna lista de optometristas", async () => {
    OptometristMock.findAll.mockResolvedValue([{ id: 1, firstName: "Laura" }]);
    const res = mockRes();
    await getAllOptometrists({}, res);
    expect(res.json).toHaveBeenCalled();
  });
  test("500: maneja error de BD", async () => {
    OptometristMock.findAll.mockRejectedValue(new Error("DB fail"));
    const res = mockRes();
    await getAllOptometrists({}, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("OptometristController - getOptometristById", () => {
  test("200: retorna optometrista por ID", async () => {
    OptometristMock.findByPk.mockResolvedValue({ id: 1, firstName: "Laura" });
    const res = mockRes();
    await getOptometristById({ params: { id: 1 } }, res);
    expect(res.json).toHaveBeenCalled();
  });
  test("404: optometrista no encontrado", async () => {
    OptometristMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await getOptometristById({ params: { id: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Optometrist not found" }));
  });
});

describe("OptometristController - createOptometrist", () => {
  const validBody = { idUser: "uuid-1", idDocType: 1, documentNumber: "12345", firstName: "Laura", firstLastName: "Gómez", professionalCardCode: "TP-999" };

  test("400: faltan campos requeridos", async () => {
    const res = mockRes();
    await createOptometrist({ body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Missing required fields" }));
  });
  test("400: usuario no existe", async () => {
    UserMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await createOptometrist({ body: validBody }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "User does not exist" }));
  });
  test("400: tipo de documento no existe", async () => {
    UserMock.findByPk.mockResolvedValue({ user_id: "uuid-1" });
    DocumentTypeMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await createOptometrist({ body: validBody }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Document Type does not exist" }));
  });
  test("201: crea optometrista exitosamente", async () => {
    UserMock.findByPk.mockResolvedValue({ user_id: "uuid-1" });
    DocumentTypeMock.findByPk.mockResolvedValue({ id_doc_type: 1 });
    OptometristMock.create.mockResolvedValue({ id: 5, ...validBody });
    const res = mockRes();
    await createOptometrist({ body: validBody }, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });
  test("409: documento o tarjeta profesional duplicada", async () => {
    UserMock.findByPk.mockResolvedValue({ user_id: "uuid-1" });
    DocumentTypeMock.findByPk.mockResolvedValue({ id_doc_type: 1 });
    const err = new Error("Dup"); err.name = "SequelizeUniqueConstraintError"; err.errors = [{ message: "unique" }];
    OptometristMock.create.mockRejectedValue(err);
    const res = mockRes();
    await createOptometrist({ body: validBody }, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });
});

describe("OptometristController - updateOptometrist", () => {
  test("404: optometrista no encontrado", async () => {
    OptometristMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await updateOptometrist({ params: { id: 99 }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
  test("200: actualiza optometrista", async () => {
    const opt = { id: 1, update: jest.fn().mockResolvedValue({ id: 1, firstName: "Nuevo" }) };
    OptometristMock.findByPk.mockResolvedValue(opt);
    const res = mockRes();
    await updateOptometrist({ params: { id: 1 }, body: { firstName: "Nuevo" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("OptometristController - deleteOptometrist (soft delete)", () => {
  test("404: optometrista no encontrado", async () => {
    OptometristMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await deleteOptometrist({ params: { id: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
  test("200: desactiva optometrista", async () => {
    const opt = { id: 1, update: jest.fn().mockResolvedValue(true) };
    OptometristMock.findByPk.mockResolvedValue(opt);
    const res = mockRes();
    await deleteOptometrist({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Optometrist deactivated successfully (Soft Deleted)" }));
  });
});
