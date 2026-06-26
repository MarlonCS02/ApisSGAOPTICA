import { jest } from "@jest/globals";

const UserMock = { findOne: jest.fn(), update: jest.fn() };
const sendPasswordResetEmailMock = jest.fn();
const hashSyncMock = jest.fn().mockReturnValue("hashed_new_pass");

jest.unstable_mockModule("../../models/user.model.js", () => ({ default: UserMock }));
jest.unstable_mockModule("../../models/userEntity.model.js", () => ({ default: {} }));
jest.unstable_mockModule("../../config/email.config.js", () => ({ sendPasswordResetEmail: sendPasswordResetEmailMock }));
jest.unstable_mockModule("bcryptjs", () => ({ default: { hashSync: hashSyncMock, compareSync: jest.fn() } }));

const { requestPasswordReset, verifyResetCode, resetPassword } = await import("../../controllers/password.controller.js");

const mockRes = () => { const r = {}; r.status = jest.fn().mockReturnValue(r); r.json = jest.fn().mockReturnValue(r); return r; };

describe("PasswordController - requestPasswordReset", () => {
  afterEach(() => jest.clearAllMocks());

  test("400: falta el correo", async () => {
    const res = mockRes();
    await requestPasswordReset({ body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: false }));
  });

  test("404: usuario no existe", async () => {
    UserMock.findOne.mockResolvedValue(null);
    const res = mockRes();
    await requestPasswordReset({ body: { correo: "no-existe@test.com" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: false, message: "No existe una cuenta con este correo electrónico" }));
  });

  test("200: correo de dominio de prueba (test.com) no envía email real", async () => {
    UserMock.findOne.mockResolvedValue({ user_id: "uuid-1", UserEntityInfo: { first_name: "Juan" } });
    const res = mockRes();
    await requestPasswordReset({ body: { correo: "juan@test.com" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: true, isRealEmail: false, emailSent: false }));
  });

  test("200: correo real intenta enviar email", async () => {
    UserMock.findOne.mockResolvedValue({ user_id: "uuid-2", UserEntityInfo: { first_name: "Ana" } });
    sendPasswordResetEmailMock.mockResolvedValue(true);
    const res = mockRes();
    await requestPasswordReset({ body: { correo: "ana@gmail.com" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: true, isRealEmail: true, emailSent: true }));
  });

  test("500: maneja error inesperado", async () => {
    UserMock.findOne.mockRejectedValue(new Error("DB crash"));
    const res = mockRes();
    await requestPasswordReset({ body: { correo: "cualquiera@test.com" } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("PasswordController - flujo completo (request → verify → reset)", () => {
  const correo = "flujo@test.com";
  let codigoCapturado;

  beforeAll(async () => {
    UserMock.findOne.mockResolvedValue({ user_id: "uuid-flujo", UserEntityInfo: { first_name: "Flujo" } });
    const res = mockRes();
    await requestPasswordReset({ body: { correo } }, res);
    const callArg = res.json.mock.calls[0][0];
    codigoCapturado = callArg.code;
  });

  test("400: verifyResetCode sin correo o code", async () => {
    const res = mockRes();
    await verifyResetCode({ body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("400: código incorrecto", async () => {
    const res = mockRes();
    await verifyResetCode({ body: { correo, code: "000000" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Código incorrecto" }));
  });

  test("200: código correcto se verifica exitosamente", async () => {
    const res = mockRes();
    await verifyResetCode({ body: { correo, code: codigoCapturado } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: true, userId: "uuid-flujo" }));
  });

  test("400: resetPassword con contraseñas que no coinciden", async () => {
    const res = mockRes();
    await resetPassword({ body: { correo, code: codigoCapturado, nueva_contrasena: "abc123", confirmar_contrasena: "xyz456" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Las contraseñas no coinciden" }));
  });

  test("400: resetPassword con contraseña muy corta", async () => {
    const res = mockRes();
    await resetPassword({ body: { correo, code: codigoCapturado, nueva_contrasena: "ab", confirmar_contrasena: "ab" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "La contraseña debe tener al menos 6 caracteres" }));
  });

  test("200: restablece la contraseña exitosamente", async () => {
    UserMock.update.mockResolvedValue([1]);
    const res = mockRes();
    await resetPassword({ body: { correo, code: codigoCapturado, nueva_contrasena: "nuevaPass123", confirmar_contrasena: "nuevaPass123" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: true, message: "Contraseña actualizada correctamente" }));
  });

  test("404: tras restablecer, el código ya no existe (reuso bloqueado)", async () => {
    const res = mockRes();
    await verifyResetCode({ body: { correo, code: codigoCapturado } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe("PasswordController - verifyResetCode sin solicitud activa", () => {
  test("404: no hay solicitud de recuperación activa", async () => {
    const res = mockRes();
    await verifyResetCode({ body: { correo: "sin-solicitud@test.com", code: "123456" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "No hay una solicitud de recuperación activa" }));
  });
});

describe("PasswordController - resetPassword sin todos los campos", () => {
  test("400: faltan campos requeridos", async () => {
    const res = mockRes();
    await resetPassword({ body: { correo: "x@test.com" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Todos los campos son requeridos" }));
  });
});
