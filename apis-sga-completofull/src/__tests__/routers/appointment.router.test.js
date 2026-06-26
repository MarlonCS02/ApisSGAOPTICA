import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";

jest.unstable_mockModule("../../middlewares/verifyToken.js", () => ({ verifyToken: (req, res, next) => next() }));
jest.unstable_mockModule("../../middlewares/isAdmin.js", () => ({ isAdmin: (req, res, next) => next() }));
jest.unstable_mockModule("../../middlewares/isAdminOrEmployee.js", () => ({ isAdminOrEmployee: (req, res, next) => next() }));
jest.unstable_mockModule("../../controllers/appointment.controller.js", () => ({
  getAppointments: jest.fn((req, res) => res.status(200).json([])),
  getAppointmentById: jest.fn((req, res) => res.status(200).json({})),
  getAppointmentsByCustomer: jest.fn((req, res) => res.status(200).json([])),
  getAppointmentsByOptometrist: jest.fn((req, res) => res.status(200).json([])),
  createAppointment: jest.fn((req, res) => res.status(201).json({})),
  updateAppointment: jest.fn((req, res) => res.status(200).json({})),
  cancelAppointment: jest.fn((req, res) => res.status(200).json({})),
  deleteAppointment: jest.fn((req, res) => res.status(200).json({})),
}));

const { default: appointmentRouter } = await import("../../routers/appointment.router.js");
const app = express();
app.use(express.json());
app.use(appointmentRouter);

describe("Appointment Router", () => {
  test("GET /appointment → 200", async () => expect((await request(app).get("/appointment")).status).toBe(200));
  test("GET /appointment/:id → 200", async () => expect((await request(app).get("/appointment/1")).status).toBe(200));
  test("GET /appointment/customer/:id → 200", async () => expect((await request(app).get("/appointment/customer/1")).status).toBe(200));
  test("GET /appointment/optometrist/:id → 200", async () => expect((await request(app).get("/appointment/optometrist/1")).status).toBe(200));
  test("POST /appointment → 201", async () => expect((await request(app).post("/appointment").send({})).status).toBe(201));
  test("PUT /appointment/:id → 200", async () => expect((await request(app).put("/appointment/1").send({})).status).toBe(200));
  test("PATCH /appointment/:id/cancel → 200", async () => expect((await request(app).patch("/appointment/1/cancel")).status).toBe(200));
  test("DELETE /appointment/:id → 200", async () => expect((await request(app).delete("/appointment/1")).status).toBe(200));
});
