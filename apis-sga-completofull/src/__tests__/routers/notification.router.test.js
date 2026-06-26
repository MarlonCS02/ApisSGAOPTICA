import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";

jest.unstable_mockModule("../../middlewares/verifyToken.js", () => ({ verifyToken: (req, res, next) => next() }));
jest.unstable_mockModule("../../middlewares/isAdmin.js", () => ({ isAdmin: (req, res, next) => next() }));
jest.unstable_mockModule("../../middlewares/isAdminOrEmployee.js", () => ({ isAdminOrEmployee: (req, res, next) => next() }));
jest.unstable_mockModule("../../controllers/notification.controller.js", () => ({
  getAllNotifications: jest.fn((req, res) => res.status(200).json([])),
  getNotificationById: jest.fn((req, res) => res.status(200).json({})),
  getNotificationsByCustomer: jest.fn((req, res) => res.status(200).json([])),
  createNotification: jest.fn((req, res) => res.status(201).json({})),
  updateNotification: jest.fn((req, res) => res.status(200).json({})),
  markAsSent: jest.fn((req, res) => res.status(200).json({})),
  markAsRead: jest.fn((req, res) => res.status(200).json({})),
  deleteNotification: jest.fn((req, res) => res.status(200).json({})),
  permanentDeleteNotification: jest.fn((req, res) => res.status(200).json({})),
}));

const { default: notificationRouter } = await import("../../routers/notification.router.js");
const app = express();
app.use(express.json());
app.use(notificationRouter);

describe("Notification Router", () => {
  test("GET /notification → 200", async () => expect((await request(app).get("/notification")).status).toBe(200));
  test("GET /notification/:id → 200", async () => expect((await request(app).get("/notification/1")).status).toBe(200));
  test("GET /notification/customer/:id → 200", async () => expect((await request(app).get("/notification/customer/1")).status).toBe(200));
  test("POST /notification → 201", async () => expect((await request(app).post("/notification").send({})).status).toBe(201));
  test("PUT /notification/:id → 200", async () => expect((await request(app).put("/notification/1").send({})).status).toBe(200));
  test("PATCH /notification/:id/sent → 200", async () => expect((await request(app).patch("/notification/1/sent")).status).toBe(200));
  test("PATCH /notification/:id/read → 200", async () => expect((await request(app).patch("/notification/1/read")).status).toBe(200));
  test("DELETE /notification/:id → 200", async () => expect((await request(app).delete("/notification/1")).status).toBe(200));
  test("DELETE /notification/:id/permanent → 200", async () => expect((await request(app).delete("/notification/1/permanent")).status).toBe(200));
});
