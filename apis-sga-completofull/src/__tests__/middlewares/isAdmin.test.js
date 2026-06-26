import { jest } from "@jest/globals";

const { isAdmin } = await import("../../middlewares/isAdmin.js");

describe("Middleware: isAdmin", () => {
  let req, res, next;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test("debe llamar next() si el usuario tiene role 'Administrador'", () => {
    req = { user: { role_name: "Administrador" } };
    isAdmin(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test("debe funcionar con 'administrador' en minúsculas (case-insensitive)", () => {
    req = { user: { role_name: "administrador" } };
    isAdmin(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test("debe funcionar con 'ADMINISTRADOR' en mayúsculas", () => {
    req = { user: { role_name: "ADMINISTRADOR" } };
    isAdmin(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test("debe retornar 403 si el rol es 'Empleado'", () => {
    req = { user: { role_name: "Empleado" } };
    isAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    expect(next).not.toHaveBeenCalled();
  });

  test("debe retornar 403 si el rol es 'Optometrista'", () => {
    req = { user: { role_name: "Optometrista" } };
    isAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("debe retornar 401 si req.user no está definido", () => {
    req = {};
    isAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  test("no debe llamar next() si el usuario no es admin", () => {
    req = { user: { role_name: "Vendedor" } };
    isAdmin(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });
});
