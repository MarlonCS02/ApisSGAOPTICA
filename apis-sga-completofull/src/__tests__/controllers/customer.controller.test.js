import { jest } from "@jest/globals";

const CustomerMock = { findAll: jest.fn(), findByPk: jest.fn(), findOne: jest.fn(), create: jest.fn() };
const UserMock = { findByPk: jest.fn() };
const UserEntityMock = { findOne: jest.fn() };
const DocumentTypeMock = { findByPk: jest.fn() };

jest.unstable_mockModule("../../models/customer.model.js", () => ({ default: CustomerMock }));
jest.unstable_mockModule("../../models/user.model.js", () => ({ default: UserMock }));
jest.unstable_mockModule("../../models/userEntity.model.js", () => ({ default: UserEntityMock }));
jest.unstable_mockModule("../../models/documentType.model.js", () => ({ default: DocumentTypeMock }));
jest.unstable_mockModule("../../config/connect.db.js", () => ({
  default: { transaction: jest.fn().mockResolvedValue({ commit: jest.fn(), rollback: jest.fn() }) },
}));
jest.unstable_mockModule("bcryptjs", () => ({ default: { hashSync: jest.fn(), compareSync: jest.fn() } }));

const {
  getAllCustomers, getCustomerById, getCustomerByUserId,
  createCustomer, updateCustomer, deleteCustomer, updateCustomerProfile
} = await import("../../controllers/customer.controller.js");

const mockRes = () => { const r = {}; r.status = jest.fn().mockReturnValue(r); r.json = jest.fn().mockReturnValue(r); return r; };
afterEach(() => jest.clearAllMocks());

describe("CustomerController - getAllCustomers", () => {
  test("200: retorna lista de clientes", async () => {
    CustomerMock.findAll.mockResolvedValue([{ customer_id: 1, firstName: "Juan" }]);
    const res = mockRes();
    await getAllCustomers({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
  test("500: maneja error", async () => {
    CustomerMock.findAll.mockRejectedValue(new Error("DB"));
    const res = mockRes();
    await getAllCustomers({}, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("CustomerController - getCustomerById", () => {
  test("200: retorna cliente por ID", async () => {
    CustomerMock.findByPk.mockResolvedValue({ customer_id: 1, firstName: "Ana" });
    const res = mockRes();
    await getCustomerById({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
  test("404: cliente no encontrado", async () => {
    CustomerMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await getCustomerById({ params: { id: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Customer not found" }));
  });
});

describe("CustomerController - createCustomer", () => {
  const validBody = { idUser: "uuid-1", idDocType: 1, documentNumber: "123", firstName: "Carlos", firstLastName: "García" };

  test("400: faltan campos requeridos", async () => {
    const res = mockRes();
    await createCustomer({ body: { firstName: "Juan" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("400: usuario no existe", async () => {
    UserMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await createCustomer({ body: validBody }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("User") }));
  });

  test("400: tipo de documento no existe", async () => {
    UserMock.findByPk.mockResolvedValue({ user_id: "uuid-1" });
    DocumentTypeMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await createCustomer({ body: validBody }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("Document Type") }));
  });

  test("201: crea cliente exitosamente", async () => {
    UserMock.findByPk.mockResolvedValue({ user_id: "uuid-1" });
    DocumentTypeMock.findByPk.mockResolvedValue({ id_doc_type: 1 });
    CustomerMock.create.mockResolvedValue({ customer_id: 5, ...validBody });
    const res = mockRes();
    await createCustomer({ body: validBody }, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe("CustomerController - updateCustomer", () => {
  test("200: actualiza cliente", async () => {
    const cust = { customer_id: 1, update: jest.fn().mockResolvedValue({ customer_id: 1, firstName: "Nuevo" }) };
    CustomerMock.findByPk.mockResolvedValue(cust);
    const res = mockRes();
    await updateCustomer({ params: { id: 1 }, body: { firstName: "Nuevo" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
  test("404: cliente no encontrado", async () => {
    CustomerMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await updateCustomer({ params: { id: 99 }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe("CustomerController - deleteCustomer", () => {
  test("200: elimina cliente", async () => {
    const cust = { customer_id: 1, destroy: jest.fn().mockResolvedValue(true) };
    CustomerMock.findByPk.mockResolvedValue(cust);
    const res = mockRes();
    await deleteCustomer({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Customer deleted successfully" }));
  });
  test("404: cliente no encontrado", async () => {
    CustomerMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await deleteCustomer({ params: { id: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
  test("409: no elimina si tiene registros asociados", async () => {
    const err = new Error("FK"); err.name = "SequelizeForeignKeyConstraintError";
    const cust = { customer_id: 1, destroy: jest.fn().mockRejectedValue(err) };
    CustomerMock.findByPk.mockResolvedValue(cust);
    const res = mockRes();
    await deleteCustomer({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });
});

describe("CustomerController - getCustomerByUserId", () => {
  test("200: retorna cliente por user_id", async () => {
    CustomerMock.findOne.mockResolvedValue({ customer_id: 1, idUser: "uuid-1" });
    const res = mockRes();
    await getCustomerByUserId({ params: { userId: "uuid-1" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("404: cliente no encontrado para ese usuario", async () => {
    CustomerMock.findOne.mockResolvedValue(null);
    const res = mockRes();
    await getCustomerByUserId({ params: { userId: "uuid-no-existe" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Customer not found for this user" }));
  });

  test("500: maneja error de BD", async () => {
    CustomerMock.findOne.mockRejectedValue(new Error("DB"));
    const res = mockRes();
    await getCustomerByUserId({ params: { userId: "uuid-1" } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("CustomerController - updateCustomerProfile", () => {
  const mockTransaction = { commit: jest.fn().mockResolvedValue(true), rollback: jest.fn().mockResolvedValue(true) };

  test("404: no se encontró perfil de cliente para el usuario", async () => {
    CustomerMock.findOne.mockResolvedValue(null);
    const res = mockRes();
    await updateCustomerProfile({ user: { user_id: "uuid-1" }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "No se encontró el perfil de cliente para este usuario." }));
  });

  test("200: actualiza datos básicos del perfil sin cambiar contraseña", async () => {
    const customerInstance = {
      firstName: "Juan", secondName: null, firstLastName: "Pérez", secondLastName: null,
      phoneNumber: null, email: null, save: jest.fn().mockResolvedValue(true),
    };
    CustomerMock.findOne.mockResolvedValue(customerInstance);
    UserEntityMock.findOne.mockResolvedValue(null);
    const res = mockRes();
    await updateCustomerProfile({ user: { user_id: "uuid-1" }, body: { firstName: "NuevoNombre" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Perfil actualizado correctamente" }));
  });

  test("400: cambio de contraseña sin enviar currentPassword", async () => {
    const customerInstance = { firstName: "Juan", save: jest.fn().mockResolvedValue(true) };
    CustomerMock.findOne.mockResolvedValue(customerInstance);
    UserEntityMock.findOne.mockResolvedValue(null);
    const res = mockRes();
    await updateCustomerProfile({ user: { user_id: "uuid-1" }, body: { newPassword: "nueva123", confirmNewPassword: "nueva123" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Debes ingresar tu contraseña actual para cambiarla." }));
  });

  test("400: nueva contraseña y confirmación no coinciden", async () => {
    const customerInstance = { firstName: "Juan", save: jest.fn().mockResolvedValue(true) };
    CustomerMock.findOne.mockResolvedValue(customerInstance);
    UserEntityMock.findOne.mockResolvedValue(null);
    const res = mockRes();
    await updateCustomerProfile({
      user: { user_id: "uuid-1" },
      body: { currentPassword: "actual123", newPassword: "nueva123", confirmNewPassword: "otraCosa" }
    }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "La nueva contraseña y la confirmación no coinciden." }));
  });

  test("400: nueva contraseña muy corta", async () => {
    const customerInstance = { firstName: "Juan", save: jest.fn().mockResolvedValue(true) };
    CustomerMock.findOne.mockResolvedValue(customerInstance);
    UserEntityMock.findOne.mockResolvedValue(null);
    const res = mockRes();
    await updateCustomerProfile({
      user: { user_id: "uuid-1" },
      body: { currentPassword: "actual123", newPassword: "abc", confirmNewPassword: "abc" }
    }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "La contraseña debe tener al menos 6 caracteres." }));
  });

  test("400: contraseña actual incorrecta", async () => {
    const customerInstance = { firstName: "Juan", save: jest.fn().mockResolvedValue(true) };
    CustomerMock.findOne.mockResolvedValue(customerInstance);
    UserEntityMock.findOne.mockResolvedValue(null);
    UserMock.findByPk.mockResolvedValue({ user_password: "hashed_pass" });
    const bcrypt = (await import("bcryptjs")).default;
    bcrypt.compareSync.mockReturnValue(false);
    const res = mockRes();
    await updateCustomerProfile({
      user: { user_id: "uuid-1" },
      body: { currentPassword: "incorrecta", newPassword: "nueva123", confirmNewPassword: "nueva123" }
    }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "La contraseña actual es incorrecta." }));
  });

  test("200: cambia la contraseña exitosamente", async () => {
    const customerInstance = { firstName: "Juan", save: jest.fn().mockResolvedValue(true) };
    CustomerMock.findOne.mockResolvedValue(customerInstance);
    UserEntityMock.findOne.mockResolvedValue(null);
    UserMock.findByPk.mockResolvedValue({ user_password: "hashed_pass", save: jest.fn().mockResolvedValue(true) });
    const bcrypt = (await import("bcryptjs")).default;
    bcrypt.compareSync.mockReturnValue(true);
    bcrypt.hashSync.mockReturnValue("nuevo_hash");
    const res = mockRes();
    await updateCustomerProfile({
      user: { user_id: "uuid-1" },
      body: { currentPassword: "actual123", newPassword: "nuevaPass123", confirmNewPassword: "nuevaPass123" }
    }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("409: correo ya en uso por otro usuario", async () => {
    const err = new Error("Dup"); err.name = "SequelizeUniqueConstraintError";
    const customerInstance = { firstName: "Juan", save: jest.fn().mockRejectedValue(err) };
    CustomerMock.findOne.mockResolvedValue(customerInstance);
    const res = mockRes();
    await updateCustomerProfile({ user: { user_id: "uuid-1" }, body: { email: "duplicado@test.com" } }, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "El correo electrónico ya está en uso por otro usuario." }));
  });

  test("500: maneja error inesperado", async () => {
    CustomerMock.findOne.mockRejectedValue(new Error("DB crash"));
    const res = mockRes();
    await updateCustomerProfile({ user: { user_id: "uuid-1" }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
