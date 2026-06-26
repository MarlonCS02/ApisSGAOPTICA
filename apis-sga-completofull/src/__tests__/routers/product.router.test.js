import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";

jest.unstable_mockModule("../../middlewares/verifyToken.js", () => ({ verifyToken: (req, res, next) => next() }));
jest.unstable_mockModule("../../middlewares/isAdmin.js", () => ({ isAdmin: (req, res, next) => next() }));
jest.unstable_mockModule("../../middlewares/upload.js", () => ({
  default: { single: () => (req, res, next) => next() },
}));
jest.unstable_mockModule("../../controllers/product.controller.js", () => ({
  getProducts: jest.fn((req, res) => res.status(200).json({})),
  getProductById: jest.fn((req, res) => res.status(200).json({})),
  createProduct: jest.fn((req, res) => res.status(201).json({})),
  updateProduct: jest.fn((req, res) => res.status(200).json({})),
  updateStock: jest.fn((req, res) => res.status(200).json({})),
  deleteProduct: jest.fn((req, res) => res.status(200).json({})),
  restoreProduct: jest.fn((req, res) => res.status(200).json({})),
}));

const { default: productRouter } = await import("../../routers/product.router.js");
const app = express();
app.use(express.json());
app.use(productRouter);

describe("Product Router", () => {
  test("GET /products → 200", async () => expect((await request(app).get("/products")).status).toBe(200));
  test("GET /products/:id → 200", async () => expect((await request(app).get("/products/1")).status).toBe(200));
  test("POST /products → 201", async () => expect((await request(app).post("/products")).status).toBe(201));
  test("PUT /products/:id → 200", async () => expect((await request(app).put("/products/1")).status).toBe(200));
  test("PATCH /products/:id/stock → 200", async () => expect((await request(app).patch("/products/1/stock")).status).toBe(200));
  test("DELETE /products/:id → 200", async () => expect((await request(app).delete("/products/1")).status).toBe(200));
  test("PATCH /products/:id/restore → 200", async () => expect((await request(app).patch("/products/1/restore")).status).toBe(200));
});
