import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";

jest.unstable_mockModule("../../controllers/password.controller.js", () => ({
  requestPasswordReset: jest.fn((req, res) => res.status(200).json({})),
  verifyResetCode: jest.fn((req, res) => res.status(200).json({})),
  resetPassword: jest.fn((req, res) => res.status(200).json({})),
}));

const { default: passwordRouter } = await import("../../routers/password.router.js");
const app = express();
app.use(express.json());
app.use(passwordRouter);

describe("Password Router", () => {
  test("POST /password/request-reset → 200", async () => expect((await request(app).post("/password/request-reset").send({})).status).toBe(200));
  test("POST /password/verify-code → 200", async () => expect((await request(app).post("/password/verify-code").send({})).status).toBe(200));
  test("POST /password/reset → 200", async () => expect((await request(app).post("/password/reset").send({})).status).toBe(200));
});
