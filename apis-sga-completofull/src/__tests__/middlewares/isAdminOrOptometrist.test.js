import { jest } from "@jest/globals";

const { isAdminOrOptometrist } = await import("../../middlewares/isAdminOrOptometrist.js");

describe("Middleware: isAdminOrOptometrist", () => {
  let res, next;

  beforeEach(() => {
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  test("debe llamar next() si el rol es 'administrador'", () => {
    const req = { user: { role_name: "Administrador" } };
    isAdminOrOptometrist(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test("debe llamar next() si el rol es 'optometra'", () => {
    const req = { user: { role_name: "optometra" } };
    isAdminOrOptometrist(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test("debe funcionar de forma case-insensitive", () => {
    const req = { user: { role_name: "OPTOMETRA" } };
    isAdminOrOptometrist(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test("debe retornar 403 si el rol es 'cliente'", () => {
    const req = { user: { role_name: "Cliente" } };
    isAdminOrOptometrist(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    expect(next).not.toHaveBeenCalled();
  });

  test("debe retornar 403 si el rol es 'empleado'", () => {
    const req = { user: { role_name: "Empleado" } };
    isAdminOrOptometrist(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("debe retornar 401 si req.user no está definido", () => {
    const req = {};
    isAdminOrOptometrist(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: "Usuario no autenticado" }));
  });
});
