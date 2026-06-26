import { jest } from "@jest/globals";

const ProductMock = {
  findAll: jest.fn(),
  findAndCountAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};
const CategoryMock = { findByPk: jest.fn() };

jest.unstable_mockModule("../../models/product.model.js", () => ({ default: ProductMock }));
jest.unstable_mockModule("../../models/category.model.js", () => ({ default: CategoryMock }));

const {
  getProducts, getProductById, createProduct, updateStock, deleteProduct, restoreProduct,
} = await import("../../controllers/product.controller.js");

const mockRes = () => { const r = {}; r.status = jest.fn().mockReturnValue(r); r.json = jest.fn().mockReturnValue(r); return r; };
afterEach(() => jest.clearAllMocks());

describe("ProductController - getProducts", () => {
  test("200: retorna productos paginados", async () => {
    ProductMock.findAndCountAll.mockResolvedValue({ count: 2, rows: [{ id: 1, nameProduct: "Lente" }] });
    const res = mockRes();
    await getProducts({ query: { page: 1, limit: 10 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ totalItems: 2 }));
  });
  test("200: filtra por status ACTIVE", async () => {
    ProductMock.findAndCountAll.mockResolvedValue({ count: 1, rows: [] });
    const res = mockRes();
    await getProducts({ query: { status: "ACTIVE" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
  test("500: maneja error", async () => {
    ProductMock.findAndCountAll.mockRejectedValue(new Error("DB"));
    const res = mockRes();
    await getProducts({ query: {} }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("ProductController - getProductById", () => {
  test("200: retorna producto por ID", async () => {
    const prod = { id: 1, nameProduct: "Armazón" };
    ProductMock.findByPk.mockResolvedValue(prod);
    const res = mockRes();
    await getProductById({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(prod);
  });
  test("404: producto no encontrado", async () => {
    ProductMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await getProductById({ params: { id: 999 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe("ProductController - createProduct", () => {
  const validBody = { nameProduct: "Lente UV", unitPrice: 50000, stock: 10, categoryId: 1 };

  test("201: crea producto exitosamente", async () => {
    CategoryMock.findByPk.mockResolvedValue({ category_id: 1 });
    ProductMock.create.mockResolvedValue({ id: 1, ...validBody });
    ProductMock.findByPk.mockResolvedValue({ id: 1, ...validBody });
    const res = mockRes();
    await createProduct({ body: validBody, file: null }, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("400: faltan campos requeridos", async () => {
    const res = mockRes();
    await createProduct({ body: { nameProduct: "Lente" }, file: null }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("400: precio no positivo", async () => {
    const res = mockRes();
    await createProduct({ body: { ...validBody, unitPrice: -100 }, file: null }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("400: stock negativo", async () => {
    const res = mockRes();
    await createProduct({ body: { ...validBody, stock: -1 }, file: null }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("400: categoría no existe", async () => {
    CategoryMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await createProduct({ body: validBody, file: null }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Category ID does not exist" }));
  });

  test("201: asigna imagen correctamente si se sube archivo", async () => {
    CategoryMock.findByPk.mockResolvedValue({ category_id: 1 });
    ProductMock.create.mockResolvedValue({ id: 2, ...validBody });
    ProductMock.findByPk.mockResolvedValue({ id: 2, ...validBody, imagen: "/uploads/products/foto.jpg" });
    const res = mockRes();
    await createProduct({ body: validBody, file: { filename: "foto.jpg" } }, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe("ProductController - updateStock", () => {
  test("200: actualiza stock correctamente", async () => {
    const prod = { id: 1, nameProduct: "Lente", update: jest.fn().mockResolvedValue(true) };
    ProductMock.findByPk.mockResolvedValueOnce(prod).mockResolvedValueOnce({ ...prod, stock: 25 });
    const res = mockRes();
    await updateStock({ params: { id: 1 }, body: { stock: 25 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
  test("400: stock no enviado", async () => {
    const res = mockRes();
    await updateStock({ params: { id: 1 }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
  test("400: stock negativo", async () => {
    const res = mockRes();
    await updateStock({ params: { id: 1 }, body: { stock: -5 } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
  test("404: producto no existe", async () => {
    ProductMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await updateStock({ params: { id: 99 }, body: { stock: 10 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe("ProductController - deleteProduct (soft delete)", () => {
  test("200: cambia status a INACTIVE", async () => {
    const prod = { id: 1, update: jest.fn().mockResolvedValue(true) };
    ProductMock.findByPk.mockResolvedValueOnce(prod).mockResolvedValueOnce({ id: 1, status: "INACTIVE" });
    const res = mockRes();
    await deleteProduct({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Product deactivated successfully" }));
  });
  test("404: producto no existe", async () => {
    ProductMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await deleteProduct({ params: { id: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe("ProductController - restoreProduct", () => {
  test("200: restaura producto a ACTIVE", async () => {
    const prod = { id: 1, update: jest.fn().mockResolvedValue(true) };
    ProductMock.findByPk.mockResolvedValueOnce(prod).mockResolvedValueOnce({ id: 1, status: "ACTIVE" });
    const res = mockRes();
    await restoreProduct({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Product restored successfully" }));
  });
  test("404: producto no existe", async () => {
    ProductMock.findByPk.mockResolvedValue(null);
    const res = mockRes();
    await restoreProduct({ params: { id: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
