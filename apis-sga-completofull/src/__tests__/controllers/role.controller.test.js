import { jest } from "@jest/globals";

const findAllMock = jest.fn();
const findByPkMock = jest.fn();
const createMock = jest.fn();

jest.unstable_mockModule("../../models/role.model.js", () => ({
  default: { findAll: findAllMock, findByPk: findByPkMock, create: createMock },
}));

const { getRoles, getRoleById, createRole, updateRole, deleteRole } = await import("../../controllers/role.controller.js");

const mockRes = () => { const r = {}; r.status = jest.fn().mockReturnValue(r); r.json = jest.fn().mockReturnValue(r); return r; };
afterEach(() => jest.clearAllMocks());

describe("RoleController - getRoles", () => {
  test("200: retorna todos los roles", async () => {
    findAllMock.mockResolvedValue([{ role_id: 1, role_name: "Administrador" }]);
    const res = mockRes();
    await getRoles({}, res);
    expect(res.json).toHaveBeenCalled();
  });
  test("500: maneja error", async () => {
    findAllMock.mockRejectedValue(new Error("DB fail"));
    const res = mockRes();
    await getRoles({}, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("RoleController - getRoleById", () => {
  test("200: retorna rol por ID", async () => {
    findByPkMock.mockResolvedValue({ role_id: 1, role_name: "Admin" });
    const res = mockRes();
    await getRoleById({ params: { id: 1 } }, res);
    expect(res.json).toHaveBeenCalled();
  });
  test("404: rol no encontrado", async () => {
    findByPkMock.mockResolvedValue(null);
    const res = mockRes();
    await getRoleById({ params: { id: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Role not found" }));
  });
});

describe("RoleController - createRole", () => {
  test("201: crea rol exitosamente", async () => {
    const newRole = { role_id: 3, role_name: "Empleado", role_description: "Empleado de ventas" };
    createMock.mockResolvedValue(newRole);
    const res = mockRes();
    await createRole({ body: { role_name: "Empleado", role_description: "Empleado de ventas" } }, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(newRole);
  });
  test("409: nombre duplicado", async () => {
    const err = new Error("Dup"); err.name = "SequelizeUniqueConstraintError"; err.errors = [{ message: "unique" }];
    createMock.mockRejectedValue(err);
    const res = mockRes();
    await createRole({ body: { role_name: "Admin", role_description: "Desc" } }, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });
  test("400: error de validación", async () => {
    const err = new Error("Val"); err.name = "SequelizeValidationError"; err.errors = [{ message: "val error" }];
    createMock.mockRejectedValue(err);
    const res = mockRes();
    await createRole({ body: { role_name: "", role_description: "" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe("RoleController - updateRole", () => {
  test("200: actualiza rol existente", async () => {
    const role = { role_id: 1, update: jest.fn().mockResolvedValue(true) };
    findByPkMock.mockResolvedValue(role);
    const res = mockRes();
    await updateRole({ params: { id: 1 }, body: { role_name: "Admin", role_description: "Desc" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
  test("404: rol no existe para actualizar", async () => {
    findByPkMock.mockResolvedValue(null);
    const res = mockRes();
    await updateRole({ params: { id: 99 }, body: { role_name: "X", role_description: "Y" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
  test("400: campos requeridos faltantes en update", async () => {
    const role = { role_id: 1, update: jest.fn() };
    findByPkMock.mockResolvedValue(role);
    const res = mockRes();
    await updateRole({ params: { id: 1 }, body: { role_name: "", role_description: "" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe("RoleController - deleteRole", () => {
  test("200: elimina rol exitosamente", async () => {
    const role = { role_id: 1, destroy: jest.fn().mockResolvedValue(true) };
    findByPkMock.mockResolvedValue(role);
    const res = mockRes();
    await deleteRole({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Role deleted successfully" }));
  });
  test("404: rol no encontrado para eliminar", async () => {
    findByPkMock.mockResolvedValue(null);
    const res = mockRes();
    await deleteRole({ params: { id: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
  test("500: error al eliminar (FK activa)", async () => {
    const role = { role_id: 1, destroy: jest.fn().mockRejectedValue(new Error("FK constraint")) };
    findByPkMock.mockResolvedValue(role);
    const res = mockRes();
    await deleteRole({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
