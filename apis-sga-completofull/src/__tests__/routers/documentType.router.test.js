import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";

jest.unstable_mockModule("../../controllers/documentType.controller.js", () => ({
  getAllDocumentTypes: jest.fn((req, res) => res.status(200).json([])),
  getDocumentTypeById: jest.fn((req, res) => res.status(200).json({})),
  createDocumentType: jest.fn((req, res) => res.status(201).json({})),
  updateDocumentType: jest.fn((req, res) => res.status(200).json({})),
  deleteDocumentType: jest.fn((req, res) => res.status(200).json({})),
}));

const { default: documentTypeRouter } = await import("../../routers/documentType.router.js");
const app = express();
app.use(express.json());
app.use(documentTypeRouter);

describe("DocumentType Router", () => {
  test("GET /documentType → 200", async () => expect((await request(app).get("/documentType")).status).toBe(200));
  test("GET /documentType/:id → 200", async () => expect((await request(app).get("/documentType/1")).status).toBe(200));
  test("POST /documentType → 201", async () => expect((await request(app).post("/documentType").send({})).status).toBe(201));
  test("PUT /documentType/:id → 200", async () => expect((await request(app).put("/documentType/1").send({})).status).toBe(200));
  test("DELETE /documentType/:id → 200", async () => expect((await request(app).delete("/documentType/1")).status).toBe(200));
});
