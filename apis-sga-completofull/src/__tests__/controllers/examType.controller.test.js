import { jest } from "@jest/globals";

const ExamTypeMock = { findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn() };
jest.unstable_mockModule("../../models/examType.model.js", () => ({ default: ExamTypeMock }));

const { getAllExamTypes, getExamTypeById, createExamType, updateExamType, deleteExamType } = await import("../../controllers/examType.controller.js");

const mockRes = () => { const r = {}; r.status = jest.fn().mockReturnValue(r); r.json = jest.fn().mockReturnValue(r); return r; };
afterEach(() => jest.clearAllMocks());

describe("ExamTypeController - getAllExamTypes", () => {
  test("200: retorna todos los tipos de examen", async () => {
    ExamTypeMock.findAll.mockResolvedValue([{ id: 1, name: "Examen Visual" }]);
    const res = mockRes();
    await getAllExamTypes({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
  test("500: maneja error de BD", async () => {
    ExamTypeMock.findAll.mockRejectedValue(new Error("DB"));
    const res = mockRes();
    await getAllExamTypes({}, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("ExamTypeController - getExamTypeById", () => {
  test("200: retorna tipo de examen por ID", async () => {
    ExamTypeMock.findByPk.mockResolvedValue({ id: 1, name: "Tonometría" });
    const res = mockRes();
    await getExamTypeById({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
  test("404: tipo no encontrado", async () => {
    ExamTypeMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await getExamTypeById({ params: { id: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Exam Type not found" }));
  });
});

describe("ExamTypeController - createExamType", () => {
  test("400: falta campo name", async () => {
    const res = mockRes();
    await createExamType({ body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Missing required field: name." }));
  });
  test("201: crea tipo exitosamente", async () => {
    ExamTypeMock.create.mockResolvedValue({ id: 4, name: "Topografía Corneal" });
    const res = mockRes();
    await createExamType({ body: { name: "Topografía Corneal" } }, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });
  test("409: nombre duplicado", async () => {
    const err = new Error("Dup"); err.name = "SequelizeUniqueConstraintError"; err.errors = [{ message: "unique" }];
    ExamTypeMock.create.mockRejectedValue(err);
    const res = mockRes();
    await createExamType({ body: { name: "Examen Visual" } }, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });
});

describe("ExamTypeController - updateExamType", () => {
  test("200: actualiza tipo exitosamente", async () => {
    const et = { id: 1, update: jest.fn().mockResolvedValue({ id: 1, name: "Nuevo nombre" }) };
    ExamTypeMock.findByPk.mockResolvedValue(et);
    const res = mockRes();
    await updateExamType({ params: { id: 1 }, body: { name: "Nuevo nombre" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
  test("404: tipo no encontrado", async () => {
    ExamTypeMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await updateExamType({ params: { id: 99 }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe("ExamTypeController - deleteExamType", () => {
  test("200: elimina tipo exitosamente", async () => {
    const et = { id: 1, destroy: jest.fn().mockResolvedValue(true) };
    ExamTypeMock.findByPk.mockResolvedValue(et);
    const res = mockRes();
    await deleteExamType({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Exam Type deleted successfully" }));
  });
  test("404: tipo no encontrado", async () => {
    ExamTypeMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await deleteExamType({ params: { id: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
  test("409: no elimina si hay citas asociadas (FK)", async () => {
    const err = new Error("FK"); err.name = "SequelizeForeignKeyConstraintError";
    const et = { id: 1, destroy: jest.fn().mockRejectedValue(err) };
    ExamTypeMock.findByPk.mockResolvedValue(et);
    const res = mockRes();
    await deleteExamType({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });
});
