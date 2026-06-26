import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";

const { verifyToken } = await import("../../middlewares/verifyToken.js");

describe("Middleware: verifyToken", () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {}, path: "/products" };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    process.env.JWT_SECRET = "TEST_SECRET_SGA";
  });

  test("debe llamar next() en ruta pública /auth/login", () => {
    req.path = "/auth/login";
    verifyToken(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test("debe llamar next() en ruta pública /auth/register", () => {
    req.path = "/auth/register";
    verifyToken(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test("debe llamar next() en ruta /password/request-reset", () => {
    req.path = "/password/request-reset";
    verifyToken(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test("debe retornar 401 si no hay token en ruta protegida", () => {
    req.headers = {};
    verifyToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("debe retornar 401 si el token es inválido", () => {
    req.headers.authorization = "Bearer token_INVALIDO";
    verifyToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("debe llamar next() y adjuntar req.user con token válido", () => {
    const payload = { user_id: "uuid-123", role_name: "Administrador" };
    const token = jwt.sign(payload, "TEST_SECRET_SGA");
    req.headers.authorization = `Bearer ${token}`;
    verifyToken(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.role_name).toBe("Administrador");
  });

  test("debe retornar 401 con token expirado", () => {
    const token = jwt.sign({ user_id: "abc" }, "TEST_SECRET_SGA", { expiresIn: "1ms" });
    return new Promise((resolve) => {
      setTimeout(() => {
        req.headers.authorization = `Bearer ${token}`;
        verifyToken(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        resolve();
      }, 10);
    });
  });
});
