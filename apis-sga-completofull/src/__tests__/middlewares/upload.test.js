import { jest } from "@jest/globals";

const { default: upload } = await import("../../middlewares/upload.js");

describe("Middleware: upload (multer - productos)", () => {
  test("debe exportar una instancia de multer con método .single", () => {
    expect(upload).toBeDefined();
    expect(typeof upload.single).toBe("function");
  });

  test("debe exponer método .array para múltiples archivos", () => {
    expect(typeof upload.array).toBe("function");
  });
});
