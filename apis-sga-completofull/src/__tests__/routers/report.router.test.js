import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";

jest.unstable_mockModule("../../middlewares/verifyToken.js", () => ({ verifyToken: (req, res, next) => next() }));
jest.unstable_mockModule("../../middlewares/isAdmin.js", () => ({ isAdmin: (req, res, next) => next() }));
jest.unstable_mockModule("../../controllers/report.controller.js", () => ({
  getAppointmentNotificationsReport: jest.fn((req, res) => res.status(200).json({})),
  getAppointmentsStatusReport: jest.fn((req, res) => res.status(200).json({})),
  getRemindersHistory: jest.fn((req, res) => res.status(200).json({})),
}));

const { default: reportRouter } = await import("../../routers/report.router.js");
const app = express();
app.use(express.json());
app.use(reportRouter);

describe("Report Router", () => {
  test("GET /reports/notifications → 200", async () => expect((await request(app).get("/reports/notifications")).status).toBe(200));
  test("GET /reports/appointments/status → 200", async () => expect((await request(app).get("/reports/appointments/status")).status).toBe(200));
  test("GET /reports/reminders → 200", async () => expect((await request(app).get("/reports/reminders")).status).toBe(200));
});
