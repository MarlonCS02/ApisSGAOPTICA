import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";

jest.unstable_mockModule("../../middlewares/verifyToken.js", () => ({ verifyToken: (req, res, next) => next() }));
jest.unstable_mockModule("../../middlewares/isAdmin.js", () => ({ isAdmin: (req, res, next) => next() }));
jest.unstable_mockModule("../../middlewares/isAdminOrOptometrist.js", () => ({ isAdminOrOptometrist: (req, res, next) => next() }));
jest.unstable_mockModule("../../middlewares/uploadFormula.js", () => ({
  default: { single: () => (req, res, next) => next() },
}));
jest.unstable_mockModule("../../controllers/formula.controller.js", () => ({
  uploadFormula: jest.fn((req, res) => res.status(201).json({})),
  getFormulas: jest.fn((req, res) => res.status(200).json([])),
  getFormulaById: jest.fn((req, res) => res.status(200).json({})),
  getFormulasByCustomer: jest.fn((req, res) => res.status(200).json([])),
  deleteFormula: jest.fn((req, res) => res.status(200).json({})),
  uploadMyFormula: jest.fn((req, res) => res.status(201).json({})),
  getMyFormulas: jest.fn((req, res) => res.status(200).json([])),
  getFormulasWithCustomerInfo: jest.fn((req, res) => res.status(200).json([])),
}));

const { default: formulaRouter } = await import("../../routers/formula.router.js");
const app = express();
app.use(express.json());
app.use(formulaRouter);

describe("Formula Router", () => {
  test("GET /formulas → 200", async () => expect((await request(app).get("/formulas")).status).toBe(200));
  test("GET /formulas/with-customers → 200", async () => expect((await request(app).get("/formulas/with-customers")).status).toBe(200));
  test("GET /formulas/my → 200", async () => expect((await request(app).get("/formulas/my")).status).toBe(200));
  test("GET /formulas/customer/:customerId → 200", async () => expect((await request(app).get("/formulas/customer/1")).status).toBe(200));
  test("GET /formulas/:id → 200", async () => expect((await request(app).get("/formulas/1")).status).toBe(200));
  test("POST /formulas/my → 201", async () => expect((await request(app).post("/formulas/my")).status).toBe(201));
  test("POST /formulas → 201", async () => expect((await request(app).post("/formulas")).status).toBe(201));
  test("DELETE /formulas/:id → 200", async () => expect((await request(app).delete("/formulas/1")).status).toBe(200));
});
