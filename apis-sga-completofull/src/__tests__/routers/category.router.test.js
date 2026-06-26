import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";

jest.unstable_mockModule("../../middlewares/verifyToken.js", () => ({ verifyToken: (req, res, next) => next() }));
jest.unstable_mockModule("../../middlewares/isAdmin.js", () => ({ isAdmin: (req, res, next) => next() }));
jest.unstable_mockModule("../../controllers/category.controller.js", () => ({
  getCategories: jest.fn((req, res) => res.status(200).json([])),
  getCategoryById: jest.fn((req, res) => res.status(200).json({})),
  createCategory: jest.fn((req, res) => res.status(201).json({})),
  updateCategory: jest.fn((req, res) => res.status(200).json({})),
  deleteCategory: jest.fn((req, res) => res.status(200).json({})),
}));

const { default: categoryRouter } = await import("../../routers/category.router.js");
const app = express();
app.use(express.json());
app.use(categoryRouter);

describe("Category Router", () => {
  test("GET /category → 200", async () => expect((await request(app).get("/category")).status).toBe(200));
  test("GET /category/:id → 200", async () => expect((await request(app).get("/category/1")).status).toBe(200));
  test("POST /category → 201", async () => expect((await request(app).post("/category").send({ category_name: "Lentes" })).status).toBe(201));
  test("PUT /category/:id → 200", async () => expect((await request(app).put("/category/1").send({ category_name: "X" })).status).toBe(200));
  test("DELETE /category/:id → 200", async () => expect((await request(app).delete("/category/1")).status).toBe(200));
});
