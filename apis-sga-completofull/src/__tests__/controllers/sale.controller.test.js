import { jest } from "@jest/globals";

const mockTransaction = { commit: jest.fn().mockResolvedValue(true), rollback: jest.fn().mockResolvedValue(true) };
const SaleMock = { findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn() };
const SaleProductMock = { create: jest.fn(), destroy: jest.fn() };
const ProductMock = { findByPk: jest.fn(), update: jest.fn() };
const CustomerMock = { findByPk: jest.fn() };
const PaymentTypeMock = { findByPk: jest.fn() };

jest.unstable_mockModule("../../config/connect.db.js", () => ({
  default: { transaction: jest.fn().mockResolvedValue(mockTransaction) },
}));
jest.unstable_mockModule("../../models/sale.model.js", () => ({ default: SaleMock }));
jest.unstable_mockModule("../../models/saleProduct.model.js", () => ({ default: SaleProductMock }));
jest.unstable_mockModule("../../models/product.model.js", () => ({ default: ProductMock }));
jest.unstable_mockModule("../../models/customer.model.js", () => ({ default: CustomerMock }));
jest.unstable_mockModule("../../models/paymentType.model.js", () => ({ default: PaymentTypeMock }));

const { createSale, getSales, getSaleById, deleteSale } = await import("../../controllers/sale.controller.js");

const mockRes = () => { const r = {}; r.status = jest.fn().mockReturnValue(r); r.json = jest.fn().mockReturnValue(r); return r; };
afterEach(() => jest.clearAllMocks());

describe("SaleController - getSales", () => {
  test("200: retorna todas las ventas", async () => {
    SaleMock.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const res = mockRes();
    await getSales({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
  test("500: maneja error de BD", async () => {
    SaleMock.findAll.mockRejectedValue(new Error("DB"));
    const res = mockRes();
    await getSales({}, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("SaleController - getSaleById", () => {
  test("200: retorna venta por ID", async () => {
    SaleMock.findByPk.mockResolvedValue({ id: 1, numberBill: "FACT-001" });
    const res = mockRes();
    await getSaleById({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
  test("404: venta no encontrada", async () => {
    SaleMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await getSaleById({ params: { id: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Sale not found" }));
  });
});

describe("SaleController - createSale", () => {
  test("400: no se enviaron productos", async () => {
    const res = mockRes();
    await createSale({ body: { customerId: 1, paymentTypeId: 1, products: [] } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Must add products to the sale." }));
  });
  test("400: cliente no existe", async () => {
    CustomerMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await createSale({ body: { customerId: 99, paymentTypeId: 1, products: [{ productId: 1, quantity: 1 }] } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Customer not found." }));
  });
  test("400: tipo de pago no existe", async () => {
    CustomerMock.findByPk.mockResolvedValue({ customer_id: 1 });
    PaymentTypeMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await createSale({ body: { customerId: 1, paymentTypeId: 99, products: [{ productId: 1, quantity: 1 }] } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Payment Type not found." }));
  });
  test("404: producto no existe", async () => {
    CustomerMock.findByPk.mockResolvedValue({ customer_id: 1 });
    PaymentTypeMock.findByPk.mockResolvedValue({ id: 1 });
    ProductMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await createSale({ body: { customerId: 1, paymentTypeId: 1, products: [{ productId: 999, quantity: 1 }] } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("not found") }));
  });
  test("400: stock insuficiente", async () => {
    CustomerMock.findByPk.mockResolvedValue({ customer_id: 1 });
    PaymentTypeMock.findByPk.mockResolvedValue({ id: 1 });
    ProductMock.findByPk.mockResolvedValue({ id: 1, nameProduct: "Lente", stock: 2, unitPrice: 50000 });
    const res = mockRes();
    await createSale({ body: { customerId: 1, paymentTypeId: 1, products: [{ productId: 1, quantity: 10 }] } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("Insufficient stock") }));
  });
  test("201: crea venta exitosamente", async () => {
    CustomerMock.findByPk.mockResolvedValue({ customer_id: 1 });
    PaymentTypeMock.findByPk.mockResolvedValue({ id: 1 });
    ProductMock.findByPk.mockResolvedValue({ id: 1, nameProduct: "Lente", stock: 20, unitPrice: 50000 });
    SaleMock.create.mockResolvedValue({ id: 10, numberBill: "FACT-123456" });
    SaleProductMock.create.mockResolvedValue({});
    ProductMock.update.mockResolvedValue([1]);
    const res = mockRes();
    await createSale({ body: { customerId: 1, paymentTypeId: 1, products: [{ productId: 1, quantity: 1 }] } }, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Sale created successfully" }));
  });
});

describe("SaleController - deleteSale", () => {
  test("404: venta no encontrada", async () => {
    SaleMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await deleteSale({ params: { id: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Sale not found" }));
  });
  test("200: elimina venta exitosamente y revierte stock", async () => {
    const product = { id: 1, stock: 5, update: jest.fn().mockResolvedValue(true) };
    const sale = {
      id: 1,
      SaleProducts: [{ productId: 1, quantity: 3 }],
      destroy: jest.fn().mockResolvedValue(true),
    };
    SaleMock.findByPk.mockResolvedValue(sale);
    ProductMock.findByPk.mockResolvedValue(product);
    SaleProductMock.destroy.mockResolvedValue(1);
    const res = mockRes();
    await deleteSale({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Sale deleted and stock reverted successfully" }));
  });
  test("500: maneja error inesperado en la transacción", async () => {
    const sale = {
      id: 1,
      SaleProducts: [],
      destroy: jest.fn().mockRejectedValue(new Error("Unexpected DB error")),
    };
    SaleMock.findByPk.mockResolvedValue(sale);
    const res = mockRes();
    await deleteSale({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
