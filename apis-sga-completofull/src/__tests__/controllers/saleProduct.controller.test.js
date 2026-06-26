import { jest } from "@jest/globals";

const SaleProductMock = { findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn() };
jest.unstable_mockModule("../../models/saleProduct.model.js", () => ({ default: SaleProductMock }));
jest.unstable_mockModule("../../models/sale.model.js", () => ({ default: {} }));
jest.unstable_mockModule("../../models/product.model.js", () => ({ default: {} }));

const { getAllSaleProducts, getSaleProductById, createSaleProduct, updateSaleProduct, deleteSaleProduct } = await import("../../controllers/saleProduct.controller.js");

const mockRes = () => { const r = {}; r.status = jest.fn().mockReturnValue(r); r.json = jest.fn().mockReturnValue(r); return r; };
afterEach(() => jest.clearAllMocks());

describe("SaleProductController - getAllSaleProducts", () => {
  test("200: retorna todos los detalles de venta", async () => {
    SaleProductMock.findAll.mockResolvedValue([{ id: 1 }]);
    const res = mockRes();
    await getAllSaleProducts({}, res);
    expect(res.json).toHaveBeenCalled();
  });
  test("500: maneja error de BD", async () => {
    SaleProductMock.findAll.mockRejectedValue(new Error("DB"));
    const res = mockRes();
    await getAllSaleProducts({}, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("SaleProductController - getSaleProductById", () => {
  test("200: retorna detalle por ID", async () => {
    SaleProductMock.findByPk.mockResolvedValue({ id: 1 });
    const res = mockRes();
    await getSaleProductById({ params: { id: 1 } }, res);
    expect(res.json).toHaveBeenCalled();
  });
  test("404: detalle no encontrado", async () => {
    SaleProductMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await getSaleProductById({ params: { id: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Detalle de venta no encontrado" }));
  });
});

describe("SaleProductController - createSaleProduct", () => {
  test("400: faltan campos requeridos", async () => {
    const res = mockRes();
    await createSaleProduct({ body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
  test("201: crea detalle de venta exitosamente", async () => {
    const newSP = { id: 1, quantity: 2, sellPrice: 1000, saleId: 1, productId: 1 };
    SaleProductMock.create.mockResolvedValue(newSP);
    const res = mockRes();
    await createSaleProduct({ body: { quantity: 2, sellPrice: 1000, saleId: 1, productId: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(newSP);
  });
  test("409: producto ya agregado a la venta (duplicado)", async () => {
    const err = new Error("Dup"); err.name = "SequelizeUniqueConstraintError";
    SaleProductMock.create.mockRejectedValue(err);
    const res = mockRes();
    await createSaleProduct({ body: { quantity: 1, sellPrice: 500, saleId: 1, productId: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });
  test("500: maneja error inesperado", async () => {
    SaleProductMock.create.mockRejectedValue(new Error("DB crash"));
    const res = mockRes();
    await createSaleProduct({ body: { quantity: 1, sellPrice: 500, saleId: 1, productId: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("SaleProductController - updateSaleProduct", () => {
  test("404: detalle no encontrado", async () => {
    SaleProductMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await updateSaleProduct({ params: { id: 99 }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
  test("200: actualiza detalle exitosamente", async () => {
    const sp = { id: 1, update: jest.fn().mockResolvedValue(true) };
    SaleProductMock.findByPk.mockResolvedValue(sp);
    const res = mockRes();
    await updateSaleProduct({ params: { id: 1 }, body: { quantity: 5, sellPrice: 2000 } }, res);
    expect(res.json).toHaveBeenCalled();
  });
});

describe("SaleProductController - deleteSaleProduct", () => {
  test("404: detalle no encontrado", async () => {
    SaleProductMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await deleteSaleProduct({ params: { id: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
  test("200: elimina detalle exitosamente", async () => {
    const sp = { id: 1, destroy: jest.fn().mockResolvedValue(true) };
    SaleProductMock.findByPk.mockResolvedValue(sp);
    const res = mockRes();
    await deleteSaleProduct({ params: { id: 1 } }, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Detalle de venta eliminado correctamente" }));
  });
});
