import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";

jest.unstable_mockModule("../../middlewares/verifyToken.js", () => ({ verifyToken: (req, res, next) => next() }));
jest.unstable_mockModule("../../middlewares/isAdmin.js", () => ({ isAdmin: (req, res, next) => next() }));
jest.unstable_mockModule("../../controllers/role.controller.js", () => ({
  getRoles: jest.fn((req, res) => res.status(200).json([])),
  getRoleById: jest.fn((req, res) => res.status(200).json({})),
  createRole: jest.fn((req, res) => res.status(201).json({})),
  updateRole: jest.fn((req, res) => res.status(200).json({})),
  deleteRole: jest.fn((req, res) => res.status(200).json({})),
}));

const { default: roleRouter } = await import("../../routers/role.router.js");
const app = express();
app.use(express.json());
app.use(roleRouter);

describe("Role Router", () => {
  test("GET /roles → 200", async () => expect((await request(app).get("/roles")).status).toBe(200));
  test("GET /roles/:id → 200", async () => expect((await request(app).get("/roles/1")).status).toBe(200));
  test("POST /roles → 201", async () => expect((await request(app).post("/roles").send({})).status).toBe(201));
  test("PUT /roles/:id → 200", async () => expect((await request(app).put("/roles/1").send({})).status).toBe(200));
  test("DELETE /roles/:id → 200", async () => expect((await request(app).delete("/roles/1")).status).toBe(200));
});
