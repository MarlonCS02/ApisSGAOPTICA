import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";

jest.unstable_mockModule("../../middlewares/verifyToken.js", () => ({ verifyToken: (req, res, next) => next() }));
jest.unstable_mockModule("../../middlewares/isAdmin.js", () => ({ isAdmin: (req, res, next) => next() }));
jest.unstable_mockModule("../../middlewares/isAdminOrEmployee.js", () => ({ isAdminOrEmployee: (req, res, next) => next() }));
jest.unstable_mockModule("../../controllers/customer.controller.js", () => ({
  getAllCustomers: jest.fn((req, res) => res.status(200).json([])),
  getCustomerById: jest.fn((req, res) => res.status(200).json({})),
  getCustomerByUserId: jest.fn((req, res) => res.status(200).json({})),
  createCustomer: jest.fn((req, res) => res.status(201).json({})),
  updateCustomer: jest.fn((req, res) => res.status(200).json({})),
  updateCustomerProfile: jest.fn((req, res) => res.status(200).json({})),
  deleteCustomer: jest.fn((req, res) => res.status(200).json({})),
}));

const { default: customerRouter } = await import("../../routers/customer.router.js");
const app = express();
app.use(express.json());
app.use(customerRouter);

describe("Customer Router", () => {
  test("GET /customer → 200", async () => expect((await request(app).get("/customer")).status).toBe(200));
  test("GET /customer/user/:userId → 200", async () => expect((await request(app).get("/customer/user/uuid-1")).status).toBe(200));
  test("GET /customer/:id → 200", async () => expect((await request(app).get("/customer/1")).status).toBe(200));
  test("POST /customer → 201", async () => expect((await request(app).post("/customer").send({})).status).toBe(201));
  test("PUT /customer/profile → 200", async () => expect((await request(app).put("/customer/profile").send({})).status).toBe(200));
  test("PUT /customer/:id → 200", async () => expect((await request(app).put("/customer/1").send({})).status).toBe(200));
  test("DELETE /customer/:id → 200", async () => expect((await request(app).delete("/customer/1")).status).toBe(200));
});
