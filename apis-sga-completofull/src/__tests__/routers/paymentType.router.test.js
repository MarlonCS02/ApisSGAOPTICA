import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";

jest.unstable_mockModule("../../middlewares/verifyToken.js", () => ({ verifyToken: (req, res, next) => next() }));
jest.unstable_mockModule("../../middlewares/isAdmin.js", () => ({ isAdmin: (req, res, next) => next() }));
jest.unstable_mockModule("../../controllers/paymentType.controller.js", () => ({
  getAllPaymentTypes: jest.fn((req, res) => res.status(200).json([])),
  getPaymentTypeById: jest.fn((req, res) => res.status(200).json({})),
  createPaymentType: jest.fn((req, res) => res.status(201).json({})),
  updatePaymentType: jest.fn((req, res) => res.status(200).json({})),
  deletePaymentType: jest.fn((req, res) => res.status(200).json({})),
}));

const { default: paymentTypeRouter } = await import("../../routers/paymentType.router.js");
const app = express();
app.use(express.json());
app.use(paymentTypeRouter);

describe("PaymentType Router", () => {
  test("GET /paymentType → 200", async () => expect((await request(app).get("/paymentType")).status).toBe(200));
  test("GET /paymentType/:id → 200", async () => expect((await request(app).get("/paymentType/1")).status).toBe(200));
  test("POST /paymentType → 201", async () => expect((await request(app).post("/paymentType").send({})).status).toBe(201));
  test("PUT /paymentType/:id → 200", async () => expect((await request(app).put("/paymentType/1").send({})).status).toBe(200));
  test("DELETE /paymentType/:id → 200", async () => expect((await request(app).delete("/paymentType/1")).status).toBe(200));
});
