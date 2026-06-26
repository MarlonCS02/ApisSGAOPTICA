import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";

jest.unstable_mockModule("../../middlewares/verifyToken.js", () => ({ verifyToken: (req, res, next) => next() }));
jest.unstable_mockModule("../../middlewares/isAdmin.js", () => ({ isAdmin: (req, res, next) => next() }));
jest.unstable_mockModule("../../controllers/user.controller.js", () => ({
  registerUser: jest.fn((req, res) => res.status(201).json({})),
  createUser: jest.fn((req, res) => res.status(201).json({})),
  showUser: jest.fn((req, res) => res.status(200).json([])),
  showUserId: jest.fn((req, res) => res.status(200).json({})),
  updateUser: jest.fn((req, res) => res.status(200).json({})),
  updateOwnProfile: jest.fn((req, res) => res.status(200).json({})),
  deleteUser: jest.fn((req, res) => res.status(200).json({})),
}));
jest.unstable_mockModule("../../controllers/auth.controller.js", () => ({
  loginUser: jest.fn((req, res) => res.status(200).json({ token: "fake" })),
}));

const { default: userRouter } = await import("../../routers/user.router.js");
const app = express();
app.use(express.json());
app.use(userRouter);

describe("User Router", () => {
  test("POST /auth/register → 201", async () => expect((await request(app).post("/auth/register").send({})).status).toBe(201));
  test("POST /auth/login → 200", async () => expect((await request(app).post("/auth/login").send({})).status).toBe(200));
  test("POST /user/register → 201", async () => expect((await request(app).post("/user/register").send({})).status).toBe(201));
  test("GET /user → 200", async () => expect((await request(app).get("/user")).status).toBe(200));
  test("GET /user/:id → 200", async () => expect((await request(app).get("/user/uuid-1")).status).toBe(200));
  test("PUT /user/profile → 200", async () => expect((await request(app).put("/user/profile").send({})).status).toBe(200));
  test("PUT /user/:id → 200", async () => expect((await request(app).put("/user/uuid-1").send({})).status).toBe(200));
  test("DELETE /user/:id → 200", async () => expect((await request(app).delete("/user/uuid-1")).status).toBe(200));
});
