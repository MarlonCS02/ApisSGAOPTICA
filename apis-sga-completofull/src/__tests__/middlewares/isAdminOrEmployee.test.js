import { jest } from "@jest/globals";

const { isAdminOrEmployee } = await import("../../middlewares/isAdminOrEmployee.js");

describe("Middleware: isAdminOrEmployee", () => {
  let res, next;

  beforeEach(() => {
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  test("debe llamar next() si el rol es 'administrador'", () => {
    const req = { user: { role_name: "Administrador" } };
    isAdminOrEmployee(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test("debe llamar next() si el rol es 'empleado'", () => {
    const req = { user: { role_name: "Empleado" } };
    isAdminOrEmployee(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test("debe llamar next() si el rol es 'cliente'", () => {
    const req = { user: { role_name: "Cliente" } };
    isAdminOrEmployee(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test("debe funcionar de forma case-insensitive", () => {
    const req = { user: { role_name: "ADMINISTRADOR" } };
    isAdminOrEmployee(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test("debe retornar 403 si el rol no está permitido", () => {
    const req = { user: { role_name: "Optometrista" } };
    isAdminOrEmployee(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    expect(next).not.toHaveBeenCalled();
  });

  test("debe retornar 401 si req.user no está definido", () => {
    const req = {};
    isAdminOrEmployee(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: "Usuario no autenticado" }));
  });
});
