import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";

jest.unstable_mockModule("../../middlewares/verifyToken.js", () => ({ verifyToken: (req, res, next) => next() }));
jest.unstable_mockModule("../../middlewares/isAdmin.js", () => ({ isAdmin: (req, res, next) => next() }));
jest.unstable_mockModule("../../middlewares/isAdminOrEmployee.js", () => ({ isAdminOrEmployee: (req, res, next) => next() }));
jest.unstable_mockModule("../../controllers/sale.controller.js", () => ({
  createSale: jest.fn((req, res) => res.status(201).json({})),
  getSales: jest.fn((req, res) => res.status(200).json([])),
  getSaleById: jest.fn((req, res) => res.status(200).json({})),
  deleteSale: jest.fn((req, res) => res.status(200).json({})),
  createPublicSale: jest.fn((req, res) => res.status(201).json({})),
}));

const { default: saleRouter } = await import("../../routers/sale.router.js");
const app = express();
app.use(express.json());
app.use(saleRouter);

describe("Sale Router", () => {
  test("POST /public/sales → 201", async () => expect((await request(app).post("/public/sales").send({})).status).toBe(201));
  test("GET /sales → 200", async () => expect((await request(app).get("/sales")).status).toBe(200));
  test("GET /sales/:id → 200", async () => expect((await request(app).get("/sales/1")).status).toBe(200));
  test("POST /sales → 201", async () => expect((await request(app).post("/sales").send({})).status).toBe(201));
  test("DELETE /sales/:id → 200", async () => expect((await request(app).delete("/sales/1")).status).toBe(200));
});
