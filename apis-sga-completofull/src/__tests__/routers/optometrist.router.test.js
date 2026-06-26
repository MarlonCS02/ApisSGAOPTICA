import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";

jest.unstable_mockModule("../../middlewares/verifyToken.js", () => ({ verifyToken: (req, res, next) => next() }));
jest.unstable_mockModule("../../middlewares/isAdmin.js", () => ({ isAdmin: (req, res, next) => next() }));
jest.unstable_mockModule("../../controllers/optometrist.controller.js", () => ({
  getAllOptometrists: jest.fn((req, res) => res.status(200).json([])),
  getOptometristById: jest.fn((req, res) => res.status(200).json({})),
  createOptometrist: jest.fn((req, res) => res.status(201).json({})),
  updateOptometrist: jest.fn((req, res) => res.status(200).json({})),
  deleteOptometrist: jest.fn((req, res) => res.status(200).json({})),
}));

const { default: optometristRouter } = await import("../../routers/optometrist.router.js");
const app = express();
app.use(express.json());
app.use(optometristRouter);

describe("Optometrist Router", () => {
  test("GET /optometrist → 200", async () => expect((await request(app).get("/optometrist")).status).toBe(200));
  test("GET /optometrist/:id → 200", async () => expect((await request(app).get("/optometrist/1")).status).toBe(200));
  test("POST /optometrist → 201", async () => expect((await request(app).post("/optometrist").send({})).status).toBe(201));
  test("PUT /optometrist/:id → 200", async () => expect((await request(app).put("/optometrist/1").send({})).status).toBe(200));
  test("DELETE /optometrist/:id → 200", async () => expect((await request(app).delete("/optometrist/1")).status).toBe(200));
});
