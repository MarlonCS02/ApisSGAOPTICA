import { jest } from "@jest/globals";

const FormulaMock = { findAll: jest.fn(), findByPk: jest.fn(), findOne: jest.fn(), create: jest.fn() };
const CustomerMock = { findByPk: jest.fn(), findOne: jest.fn() };
const UserMock = { findByPk: jest.fn() };
const AppointmentMock = { findAll: jest.fn() };

jest.unstable_mockModule("../../models/formula.model.js", () => ({ default: FormulaMock }));
jest.unstable_mockModule("../../models/customer.model.js", () => ({ default: CustomerMock }));
jest.unstable_mockModule("../../models/user.model.js", () => ({ default: UserMock }));
jest.unstable_mockModule("../../models/appointment.model.js", () => ({ default: AppointmentMock }));

const {
  uploadFormula, uploadMyFormula, getMyFormulas, getFormulas,
  getFormulasWithCustomerInfo, getFormulaById, getFormulasByCustomer, deleteFormula
} = await import("../../controllers/formula.controller.js");

const mockRes = () => { const r = {}; r.status = jest.fn().mockReturnValue(r); r.json = jest.fn().mockReturnValue(r); return r; };
afterEach(() => jest.clearAllMocks());

describe("FormulaController - uploadFormula", () => {
  test("400: no se adjunta archivo", async () => {
    const res = mockRes();
    await uploadFormula({ body: { customerId: 1 }, file: null }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Debes subir un archivo (fórmula)." }));
  });

  test("404: cliente no existe", async () => {
    CustomerMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await uploadFormula({ body: { customerId: 99 }, file: { filename: "formula.pdf", originalname: "formula.pdf", mimetype: "application/pdf" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Cliente no encontrado." }));
  });

  test("201: sube fórmula exitosamente con uploadedById explícito", async () => {
    CustomerMock.findByPk.mockResolvedValue({ customer_id: 1 });
    const newFormula = { id: 1, filePath: "/uploads/formulas/f.pdf" };
    FormulaMock.create.mockResolvedValue(newFormula);
    const res = mockRes();
    await uploadFormula({
      body: { customerId: 1, uploadedById: "uuid-admin" },
      file: { filename: "f.pdf", originalname: "formula.pdf", mimetype: "application/pdf" }
    }, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Fórmula subida exitosamente.", formula: newFormula }));
  });

  test("201: sube fórmula usando req.user.user_id si no hay uploadedById", async () => {
    CustomerMock.findByPk.mockResolvedValue({ customer_id: 1 });
    FormulaMock.create.mockResolvedValue({ id: 2 });
    const res = mockRes();
    await uploadFormula({
      body: { customerId: 1 },
      file: { filename: "f.pdf", originalname: "formula.pdf", mimetype: "application/pdf" },
      user: { user_id: "uuid-logueado" }
    }, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(FormulaMock.create).toHaveBeenCalledWith(expect.objectContaining({ uploadedById: "uuid-logueado" }));
  });

  test("500: maneja error inesperado", async () => {
    CustomerMock.findByPk.mockRejectedValue(new Error("DB crash"));
    const res = mockRes();
    await uploadFormula({ body: { customerId: 1 }, file: { filename: "f.pdf", originalname: "f.pdf", mimetype: "application/pdf" } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("FormulaController - uploadMyFormula", () => {
  test("400: sin archivo adjunto", async () => {
    const res = mockRes();
    await uploadMyFormula({ user: { user_id: "uuid-1" }, body: {}, file: null }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Debes subir un archivo (fórmula)." }));
  });

  test("404: cliente no tiene perfil asociado", async () => {
    CustomerMock.findOne.mockResolvedValue(null);
    const res = mockRes();
    await uploadMyFormula({ user: { user_id: "uuid-1" }, body: {}, file: { filename: "f.pdf", originalname: "f.pdf", mimetype: "application/pdf" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "No se encontró un perfil de cliente para este usuario. Contacta al administrador." }));
  });

  test("201: sube su propia fórmula exitosamente", async () => {
    CustomerMock.findOne.mockResolvedValue({ customer_id: 1 });
    FormulaMock.create.mockResolvedValue({ id: 3 });
    const res = mockRes();
    await uploadMyFormula({ user: { user_id: "uuid-1" }, body: {}, file: { filename: "f.pdf", originalname: "f.pdf", mimetype: "application/pdf" } }, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Fórmula subida exitosamente." }));
  });

  test("500: maneja error inesperado", async () => {
    CustomerMock.findOne.mockRejectedValue(new Error("DB crash"));
    const res = mockRes();
    await uploadMyFormula({ user: { user_id: "uuid-1" }, body: {}, file: { filename: "f.pdf", originalname: "f.pdf", mimetype: "application/pdf" } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("FormulaController - getMyFormulas", () => {
  test("404: cliente sin perfil", async () => {
    CustomerMock.findOne.mockResolvedValue(null);
    const res = mockRes();
    await getMyFormulas({ user: { user_id: "uuid-no" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Perfil de cliente no encontrado." }));
  });

  test("200: retorna sus fórmulas ordenadas", async () => {
    CustomerMock.findOne.mockResolvedValue({ customer_id: 1 });
    FormulaMock.findAll.mockResolvedValue([{ id: 1 }]);
    const res = mockRes();
    await getMyFormulas({ user: { user_id: "uuid-1" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("500: maneja error de BD", async () => {
    CustomerMock.findOne.mockRejectedValue(new Error("DB"));
    const res = mockRes();
    await getMyFormulas({ user: { user_id: "uuid-1" } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("FormulaController - getFormulas", () => {
  test("200: retorna todas las fórmulas con includes", async () => {
    FormulaMock.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const res = mockRes();
    await getFormulas({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
  test("500: maneja error de BD", async () => {
    FormulaMock.findAll.mockRejectedValue(new Error("DB"));
    const res = mockRes();
    await getFormulas({}, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("FormulaController - getFormulasWithCustomerInfo", () => {
  test("200: retorna fórmulas con citas asociadas", async () => {
    const formulaInstance = { customerId: 1, toJSON: () => ({ id: 1, customerId: 1 }) };
    FormulaMock.findAll.mockResolvedValue([formulaInstance]);
    AppointmentMock.findAll.mockResolvedValue([{ appointment_id: 1 }]);
    const res = mockRes();
    await getFormulasWithCustomerInfo({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      expect.objectContaining({ id: 1, customerId: 1, appointments: [{ appointment_id: 1 }] }),
    ]);
  });

  test("500: maneja error de BD", async () => {
    FormulaMock.findAll.mockRejectedValue(new Error("DB"));
    const res = mockRes();
    await getFormulasWithCustomerInfo({}, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("FormulaController - getFormulaById", () => {
  test("200: retorna fórmula por ID", async () => {
    FormulaMock.findByPk.mockResolvedValue({ id: 1, filePath: "/formulas/f.pdf" });
    const res = mockRes();
    await getFormulaById({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("404: fórmula no encontrada", async () => {
    FormulaMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await getFormulaById({ params: { id: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Fórmula no encontrada." }));
  });

  test("500: maneja error de BD", async () => {
    FormulaMock.findByPk.mockRejectedValue(new Error("DB"));
    const res = mockRes();
    await getFormulaById({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("FormulaController - getFormulasByCustomer", () => {
  test("200: retorna fórmulas de un cliente", async () => {
    FormulaMock.findAll.mockResolvedValue([{ id: 1 }]);
    const res = mockRes();
    await getFormulasByCustomer({ params: { customerId: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
  test("500: maneja error", async () => {
    FormulaMock.findAll.mockRejectedValue(new Error("DB"));
    const res = mockRes();
    await getFormulasByCustomer({ params: { customerId: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("FormulaController - deleteFormula", () => {
  test("404: fórmula no encontrada", async () => {
    FormulaMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await deleteFormula({ params: { id: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Fórmula no encontrada." }));
  });

  test("200: elimina fórmula exitosamente", async () => {
    FormulaMock.findByPk.mockResolvedValue({ id: 1, destroy: jest.fn().mockResolvedValue(true) });
    const res = mockRes();
    await deleteFormula({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Fórmula eliminada exitosamente." }));
  });

  test("500: maneja error de BD", async () => {
    FormulaMock.findByPk.mockRejectedValue(new Error("DB"));
    const res = mockRes();
    await deleteFormula({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
