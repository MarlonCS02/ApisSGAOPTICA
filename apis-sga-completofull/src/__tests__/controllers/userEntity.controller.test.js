import { jest } from "@jest/globals";

const UserEntityMock = { findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn() };
const UserMock = { findByPk: jest.fn() };

jest.unstable_mockModule("../../models/userEntity.model.js", () => ({ default: UserEntityMock }));
jest.unstable_mockModule("../../models/user.model.js", () => ({ default: UserMock }));

const { createUserEntity, getAllUserEntities, getUserEntityById, updateUserEntity, deleteUserEntity } = await import("../../controllers/userEntity.controller.js");

const mockRes = () => { const r = {}; r.status = jest.fn().mockReturnValue(r); r.json = jest.fn().mockReturnValue(r); return r; };
afterEach(() => jest.clearAllMocks());

describe("UserEntityController - createUserEntity", () => {
  test("400: usuario no existe", async () => {
    UserMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await createUserEntity({ body: { user_id: "no-existe" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: false, message: "El usuario no existe" }));
  });
  test("201: crea entidad exitosamente", async () => {
    UserMock.findByPk.mockResolvedValue({ user_id: "uuid-1" });
    UserEntityMock.create.mockResolvedValue({ id: 1, user_id: "uuid-1", first_name: "Juan" });
    const res = mockRes();
    await createUserEntity({ body: { user_id: "uuid-1", first_name: "Juan", last_name: "Pérez" } }, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: true }));
  });
  test("500: maneja error de BD", async () => {
    UserMock.findByPk.mockRejectedValue(new Error("DB"));
    const res = mockRes();
    await createUserEntity({ body: { user_id: "uuid-1" } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("UserEntityController - getAllUserEntities", () => {
  test("200: retorna todas las entidades", async () => {
    UserEntityMock.findAll.mockResolvedValue([{ id: 1 }]);
    const res = mockRes();
    await getAllUserEntities({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: true }));
  });
  test("500: maneja error", async () => {
    UserEntityMock.findAll.mockRejectedValue(new Error("DB"));
    const res = mockRes();
    await getAllUserEntities({}, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("UserEntityController - getUserEntityById", () => {
  test("200: retorna entidad por ID", async () => {
    UserEntityMock.findByPk.mockResolvedValue({ id: 1, first_name: "Ana" });
    const res = mockRes();
    await getUserEntityById({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
  test("404: entidad no encontrada", async () => {
    UserEntityMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await getUserEntityById({ params: { id: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: false, message: "UserEntity not found" }));
  });
});

describe("UserEntityController - updateUserEntity", () => {
  test("404: entidad no encontrada", async () => {
    UserEntityMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await updateUserEntity({ params: { id: 99 }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
  test("200: actualiza entidad exitosamente", async () => {
    const entity = { id: 1, update: jest.fn().mockResolvedValue(true) };
    UserEntityMock.findByPk.mockResolvedValue(entity);
    const res = mockRes();
    await updateUserEntity({ params: { id: 1 }, body: { first_name: "Nuevo" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: true }));
  });
});

describe("UserEntityController - deleteUserEntity", () => {
  test("404: entidad no encontrada", async () => {
    UserEntityMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await deleteUserEntity({ params: { id: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
  test("200: elimina entidad exitosamente", async () => {
    const entity = { id: 1, destroy: jest.fn().mockResolvedValue(true) };
    UserEntityMock.findByPk.mockResolvedValue(entity);
    const res = mockRes();
    await deleteUserEntity({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: true, message: "UserEntity deleted" }));
  });
});
