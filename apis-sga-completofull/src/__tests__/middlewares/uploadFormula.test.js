import { jest } from "@jest/globals";

const { default: uploadFormula } = await import("../../middlewares/uploadFormula.js");

describe("Middleware: uploadFormula (multer - fórmulas)", () => {
  test("debe exportar una instancia de multer con método .single", () => {
    expect(uploadFormula).toBeDefined();
    expect(typeof uploadFormula.single).toBe("function");
  });

  test("debe exponer método .array para múltiples archivos", () => {
    expect(typeof uploadFormula.array).toBe("function");
  });
});
