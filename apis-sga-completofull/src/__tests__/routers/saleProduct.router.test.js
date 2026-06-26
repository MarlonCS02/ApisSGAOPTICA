import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";

jest.unstable_mockModule("../../middlewares/verifyToken.js", () => ({ verifyToken: (req, res, next) => next() }));
jest.unstable_mockModule("../../middlewares/isAdmin.js", () => ({ isAdmin: (req, res, next) => next() }));
jest.unstable_mockModule("../../middlewares/isAdminOrEmployee.js", () => ({ isAdminOrEmployee: (req, res, next) => next() }));
jest.unstable_mockModule("../../controllers/saleProduct.controller.js", () => ({
  getAllSaleProducts: jest.fn((req, res) => res.status(200).json([])),
  getSaleProductById: jest.fn((req, res) => res.status(200).json({})),
  createSaleProduct: jest.fn((req, res) => res.status(201).json({})),
  updateSaleProduct: jest.fn((req, res) => res.status(200).json({})),
  deleteSaleProduct: jest.fn((req, res) => res.status(200).json({})),
}));

const { default: saleProductRouter } = await import("../../routers/saleProduct.router.js");
const app = express();
app.use(express.json());
app.use(saleProductRouter);

describe("SaleProduct Router", () => {
  test("GET /saleProduct → 200", async () => expect((await request(app).get("/saleProduct")).status).toBe(200));
  test("GET /saleProduct/:id → 200", async () => expect((await request(app).get("/saleProduct/1")).status).toBe(200));
  test("POST /saleProduct → 201", async () => expect((await request(app).post("/saleProduct").send({})).status).toBe(201));
  test("PUT /saleProduct/:id → 200", async () => expect((await request(app).put("/saleProduct/1").send({})).status).toBe(200));
  test("DELETE /saleProduct/:id → 200", async () => expect((await request(app).delete("/saleProduct/1")).status).toBe(200));
});
