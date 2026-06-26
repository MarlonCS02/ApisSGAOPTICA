import { jest } from "@jest/globals";

const mockTransaction = { commit: jest.fn().mockResolvedValue(true), rollback: jest.fn().mockResolvedValue(true) };
const UserMock = { findAll: jest.fn(), findByPk: jest.fn(), findOne: jest.fn(), create: jest.fn() };
const UserEntityMock = { findOne: jest.fn(), create: jest.fn() };
const CustomerMock = { findOne: jest.fn(), create: jest.fn() };
const RoleMock = { findByPk: jest.fn(), findOne: jest.fn() };
const hashSyncMock = jest.fn().mockReturnValue("hashed_pass");

jest.unstable_mockModule("../../config/connect.db.js", () => ({
  default: { transaction: jest.fn().mockResolvedValue(mockTransaction) },
}));
jest.unstable_mockModule("../../models/user.model.js", () => ({ default: UserMock }));
jest.unstable_mockModule("../../models/userEntity.model.js", () => ({ default: UserEntityMock }));
jest.unstable_mockModule("../../models/customer.model.js", () => ({ default: CustomerMock }));
jest.unstable_mockModule("../../models/role.model.js", () => ({ default: RoleMock }));
jest.unstable_mockModule("bcryptjs", () => ({ default: { hashSync: hashSyncMock, compareSync: jest.fn() } }));

const { createUser, showUser, showUserId, deleteUser, registerUser } = await import("../../controllers/user.controller.js");

const mockRes = () => { const r = {}; r.status = jest.fn().mockReturnValue(r); r.json = jest.fn().mockReturnValue(r); return r; };
afterEach(() => jest.clearAllMocks());

describe("UserController - showUser", () => {
  test("200: retorna todos los usuarios sin password", async () => {
    UserMock.findAll.mockResolvedValue([{ user_id: "uuid1", user_user: "admin" }]);
    const res = mockRes();
    await showUser({}, res);
    expect(res.json).toHaveBeenCalled();
  });
  test("500: maneja error", async () => {
    UserMock.findAll.mockRejectedValue(new Error("DB"));
    const res = mockRes();
    await showUser({}, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("UserController - showUserId", () => {
  test("200: retorna usuario por ID", async () => {
    UserMock.findByPk.mockResolvedValue({ user_id: "uuid1", user_user: "admin" });
    const res = mockRes();
    await showUserId({ params: { id: "uuid1" } }, res);
    expect(res.json).toHaveBeenCalled();
  });
  test("404: usuario no encontrado", async () => {
    UserMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await showUserId({ params: { id: "uuid-inexistente" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "User not found." }));
  });
});

describe("UserController - createUser", () => {
  test("400: faltan campos requeridos", async () => {
    const res = mockRes();
    await createUser({ body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Missing required fields (user_user, user_password, role_id)." }));
  });
  test("400: rol no existe", async () => {
    RoleMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await createUser({ body: { user_user: "nuevo@test.com", user_password: "pass123", role_id: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Role does not exist." }));
  });
  test("201: crea usuario exitosamente", async () => {
    RoleMock.findByPk.mockResolvedValue({ role_id: 1 });
    UserMock.create.mockResolvedValue({ user_id: "new-uuid", user_user: "nuevo@test.com" });
    UserEntityMock.create.mockResolvedValue({});
    const res = mockRes();
    await createUser({ body: { user_user: "nuevo@test.com", user_password: "pass123", role_id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "User created successfully." }));
  });
  test("409: username duplicado", async () => {
    RoleMock.findByPk.mockResolvedValue({ role_id: 1 });
    const err = new Error("Dup"); err.name = "SequelizeUniqueConstraintError"; err.errors = [{ message: "unique" }];
    UserMock.create.mockRejectedValue(err);
    const res = mockRes();
    await createUser({ body: { user_user: "dup@test.com", user_password: "pass", role_id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });
});

describe("UserController - deleteUser", () => {
  test("200: elimina usuario exitosamente", async () => {
    UserMock.findByPk.mockResolvedValue({ user_id: "uuid1", destroy: jest.fn().mockResolvedValue(true) });
    const res = mockRes();
    await deleteUser({ params: { id: "uuid1" } }, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "User and entity deleted successfully." }));
  });
  test("404: usuario no encontrado", async () => {
    UserMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await deleteUser({ params: { id: "no-existe" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
  test("500: error al eliminar", async () => {
    UserMock.findByPk.mockResolvedValue({ user_id: "uuid1", destroy: jest.fn().mockRejectedValue(new Error("FK")) });
    const res = mockRes();
    await deleteUser({ params: { id: "uuid1" } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("UserController - registerUser", () => {
  test("400: campos obligatorios faltantes", async () => {
    const res = mockRes();
    await registerUser({ body: { nombre: "Juan" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("obligatorios") }));
  });
  test("400: contraseñas no coinciden", async () => {
    const res = mockRes();
    await registerUser({ body: { nombre: "Juan", correo: "j@t.com", contrasena: "abc", confirmar_contrasena: "xyz" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Las contraseñas no coinciden." }));
  });
  test("409: correo ya registrado", async () => {
    CustomerMock.findOne.mockResolvedValue({ email: "j@t.com" });
    const res = mockRes();
    await registerUser({ body: { nombre: "Juan", correo: "j@t.com", contrasena: "pass", confirmar_contrasena: "pass" } }, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Este correo ya está registrado." }));
  });
  test("500: rol cliente no configurado", async () => {
    CustomerMock.findOne.mockResolvedValue(null);
    RoleMock.findOne.mockResolvedValue(null);
    const res = mockRes();
    await registerUser({ body: { nombre: "Juan", correo: "nuevo@t.com", contrasena: "pass", confirmar_contrasena: "pass" } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("rol 'cliente'") }));
  });
  test("201: registro exitoso", async () => {
    CustomerMock.findOne.mockResolvedValue(null);
    RoleMock.findOne.mockResolvedValue({ role_id: 3 });
    UserMock.create.mockResolvedValue({ user_id: "new-uuid" });
    UserEntityMock.create.mockResolvedValue({});
    CustomerMock.create.mockResolvedValue({});
    const res = mockRes();
    await registerUser({ body: { nombre: "Juan", correo: "nuevo@t.com", contrasena: "pass", confirmar_contrasena: "pass", telefono: "3001234567" } }, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Registro exitoso. Ya puedes iniciar sesión." }));
  });
});
