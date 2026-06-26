import { jest } from "@jest/globals";

const PaymentTypeMock = { findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn() };
jest.unstable_mockModule("../../models/paymentType.model.js", () => ({ default: PaymentTypeMock }));

const { getAllPaymentTypes, getPaymentTypeById, createPaymentType, updatePaymentType, deletePaymentType } = await import("../../controllers/paymentType.controller.js");

const mockRes = () => { const r = {}; r.status = jest.fn().mockReturnValue(r); r.json = jest.fn().mockReturnValue(r); return r; };
afterEach(() => jest.clearAllMocks());

describe("PaymentTypeController - getAllPaymentTypes", () => {
  test("200: retorna todos los tipos de pago", async () => {
    PaymentTypeMock.findAll.mockResolvedValue([{ id: 1, name: "Efectivo" }]);
    const res = mockRes();
    await getAllPaymentTypes({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
  test("500: maneja error de BD", async () => {
    PaymentTypeMock.findAll.mockRejectedValue(new Error("DB"));
    const res = mockRes();
    await getAllPaymentTypes({}, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("PaymentTypeController - getPaymentTypeById", () => {
  test("200: retorna tipo de pago por ID", async () => {
    PaymentTypeMock.findByPk.mockResolvedValue({ id: 1, name: "Efectivo" });
    const res = mockRes();
    await getPaymentTypeById({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
  test("404: tipo no encontrado", async () => {
    PaymentTypeMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await getPaymentTypeById({ params: { id: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Payment Type not found" }));
  });
});

describe("PaymentTypeController - createPaymentType", () => {
  test("400: falta campo name", async () => {
    const res = mockRes();
    await createPaymentType({ body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Missing required field: name." }));
  });
  test("201: crea tipo de pago exitosamente", async () => {
    PaymentTypeMock.create.mockResolvedValue({ id: 3, name: "Transferencia" });
    const res = mockRes();
    await createPaymentType({ body: { name: "Transferencia" } }, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });
  test("409: nombre duplicado", async () => {
    const err = new Error("Dup"); err.name = "SequelizeUniqueConstraintError"; err.errors = [{ message: "unique" }];
    PaymentTypeMock.create.mockRejectedValue(err);
    const res = mockRes();
    await createPaymentType({ body: { name: "Efectivo" } }, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });
});

describe("PaymentTypeController - updatePaymentType", () => {
  test("200: actualiza tipo exitosamente", async () => {
    const pt = { id: 1, update: jest.fn().mockResolvedValue({ id: 1, name: "Nequi" }) };
    PaymentTypeMock.findByPk.mockResolvedValue(pt);
    const res = mockRes();
    await updatePaymentType({ params: { id: 1 }, body: { name: "Nequi" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
  test("404: tipo no encontrado", async () => {
    PaymentTypeMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await updatePaymentType({ params: { id: 99 }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe("PaymentTypeController - deletePaymentType", () => {
  test("200: elimina tipo exitosamente", async () => {
    const pt = { id: 1, destroy: jest.fn().mockResolvedValue(true) };
    PaymentTypeMock.findByPk.mockResolvedValue(pt);
    const res = mockRes();
    await deletePaymentType({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Payment Type deleted successfully" }));
  });
  test("404: tipo no encontrado", async () => {
    PaymentTypeMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await deletePaymentType({ params: { id: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
  test("409: no elimina si hay ventas asociadas (FK)", async () => {
    const err = new Error("FK"); err.name = "SequelizeForeignKeyConstraintError";
    const pt = { id: 1, destroy: jest.fn().mockRejectedValue(err) };
    PaymentTypeMock.findByPk.mockResolvedValue(pt);
    const res = mockRes();
    await deletePaymentType({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });
});
