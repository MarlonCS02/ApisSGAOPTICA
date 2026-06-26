import { jest } from "@jest/globals";

const UserMock = { findOne: jest.fn(), findByPk: jest.fn() };
const compareSyncMock = jest.fn();
const signMock = jest.fn().mockReturnValue("fake-token-xyz");

jest.unstable_mockModule("../../models/user.model.js", () => ({ default: UserMock }));
jest.unstable_mockModule("../../models/userEntity.model.js", () => ({ default: {} }));
jest.unstable_mockModule("../../models/role.model.js", () => ({ default: {} }));
jest.unstable_mockModule("bcryptjs", () => ({ default: { compareSync: compareSyncMock, hashSync: jest.fn() } }));
jest.unstable_mockModule("jsonwebtoken", () => ({ default: { sign: signMock, verify: jest.fn() } }));

const { loginUser } = await import("../../controllers/auth.controller.js");

const mockRes = () => { const r = {}; r.status = jest.fn().mockReturnValue(r); r.json = jest.fn().mockReturnValue(r); return r; };
afterEach(() => jest.clearAllMocks());

describe("AuthController - loginUser", () => {
  test("400: faltan credenciales", async () => {
    const res = mockRes();
    await loginUser({ body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("400: falta user_user", async () => {
    const res = mockRes();
    await loginUser({ body: { user_password: "pass" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("400: falta user_password", async () => {
    const res = mockRes();
    await loginUser({ body: { user_user: "admin" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("401: usuario no existe", async () => {
    UserMock.findOne.mockResolvedValue(null);
    const res = mockRes();
    await loginUser({ body: { user_user: "noexiste", user_password: "pass" } }, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Invalid username or password" }));
  });

  test("401: contraseña incorrecta", async () => {
    const fakeUser = { user_id: "uuid", user_user: "admin", user_password: "hashed", role_id: 1, Role: { role_name: "Administrador" } };
    UserMock.findOne.mockResolvedValue(fakeUser);
    compareSyncMock.mockReturnValue(false);
    const res = mockRes();
    await loginUser({ body: { user_user: "admin", user_password: "wrongpass" } }, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("200: login exitoso retorna token", async () => {
    const fakeUser = { user_id: "uuid-abc", user_user: "admin@optica.com", user_password: "hashed", role_id: 1, Role: { role_name: "Administrador" }, UserEntityInfo: { first_name: "Admin" } };
    UserMock.findOne.mockResolvedValue(fakeUser);
    compareSyncMock.mockReturnValue(true);
    process.env.JWT_SECRET = "TEST_SECRET";
    const res = mockRes();
    await loginUser({ body: { user_user: "admin@optica.com", user_password: "correctpass" } }, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: "fake-token-xyz", message: "Login successful" }));
  });

  test("500: maneja error inesperado", async () => {
    UserMock.findOne.mockRejectedValue(new Error("DB crash"));
    const res = mockRes();
    await loginUser({ body: { user_user: "admin", user_password: "pass" } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
