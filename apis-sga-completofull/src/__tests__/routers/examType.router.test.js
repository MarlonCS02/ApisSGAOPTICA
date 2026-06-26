import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";

jest.unstable_mockModule("../../controllers/examType.controller.js", () => ({
  getAllExamTypes: jest.fn((req, res) => res.status(200).json([])),
  getExamTypeById: jest.fn((req, res) => res.status(200).json({})),
  createExamType: jest.fn((req, res) => res.status(201).json({})),
  updateExamType: jest.fn((req, res) => res.status(200).json({})),
  deleteExamType: jest.fn((req, res) => res.status(200).json({})),
}));

const { default: examTypeRouter } = await import("../../routers/examType.js");
const app = express();
app.use(express.json());
app.use(examTypeRouter);

describe("ExamType Router", () => {
  test("GET /examType → 200", async () => expect((await request(app).get("/examType")).status).toBe(200));
  test("GET /examType/:id → 200", async () => expect((await request(app).get("/examType/1")).status).toBe(200));
  test("POST /examType → 201", async () => expect((await request(app).post("/examType").send({})).status).toBe(201));
  test("PUT /examType/:id → 200", async () => expect((await request(app).put("/examType/1").send({})).status).toBe(200));
  test("DELETE /examType/:id → 200", async () => expect((await request(app).delete("/examType/1")).status).toBe(200));
});
