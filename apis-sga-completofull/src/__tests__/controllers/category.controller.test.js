import { jest } from "@jest/globals";

const findAllMock = jest.fn();
const findByPkMock = jest.fn();
const createMock = jest.fn();

jest.unstable_mockModule("../../models/category.model.js", () => ({
  default: { findAll: findAllMock, findByPk: findByPkMock, create: createMock },
}));

const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = await import("../../controllers/category.controller.js");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

afterEach(() => jest.clearAllMocks());

describe("CategoryController - getCategories", () => {
  test("200: retorna lista de categorías", async () => {
    const data = [{ category_id: 1, category_name: "Armazones" }];
    findAllMock.mockResolvedValue(data);
    const res = mockRes();
    await getCategories({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(data);
  });

  test("500: maneja error de base de datos", async () => {
    findAllMock.mockRejectedValue(new Error("DB Error"));
    const res = mockRes();
    await getCategories({}, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("CategoryController - getCategoryById", () => {
  test("200: retorna categoría existente", async () => {
    const cat = { category_id: 1, category_name: "Lentes" };
    findByPkMock.mockResolvedValue(cat);
    const res = mockRes();
    await getCategoryById({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(cat);
  });

  test("404: categoría no encontrada", async () => {
    findByPkMock.mockResolvedValue(null);
    const res = mockRes();
    await getCategoryById({ params: { id: 999 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Category not found" }));
  });

  test("500: maneja error de base de datos", async () => {
    findByPkMock.mockRejectedValue(new Error("DB Error"));
    const res = mockRes();
    await getCategoryById({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("CategoryController - createCategory", () => {
  test("201: crea categoría exitosamente", async () => {
    const nueva = { category_id: 5, category_name: "Solares" };
    createMock.mockResolvedValue(nueva);
    const res = mockRes();
    await createCategory({ body: { category_name: "Solares" } }, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(nueva);
  });

  test("400: falla si no se provee category_name", async () => {
    const res = mockRes();
    await createCategory({ body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("category_name") }));
  });

  test("409: maneja nombre duplicado (UniqueConstraintError)", async () => {
    const err = new Error("Duplicate");
    err.name = "SequelizeUniqueConstraintError";
    err.errors = [{ message: "category_name must be unique" }];
    createMock.mockRejectedValue(err);
    const res = mockRes();
    await createCategory({ body: { category_name: "Duplicado" } }, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  test("400: maneja error de validación (ValidationError)", async () => {
    const err = new Error("Validation");
    err.name = "SequelizeValidationError";
    err.errors = [{ message: "category_name cannot be null" }];
    createMock.mockRejectedValue(err);
    const res = mockRes();
    await createCategory({ body: { category_name: "Test" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe("CategoryController - updateCategory", () => {
  test("200: actualiza categoría existente", async () => {
    const updated = { category_id: 1, category_name: "Actualizado", update: jest.fn().mockResolvedValue(true) };
    findByPkMock.mockResolvedValue(updated);
    const res = mockRes();
    await updateCategory({ params: { id: 1 }, body: { category_name: "Actualizado" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("404: categoría no encontrada para actualizar", async () => {
    findByPkMock.mockResolvedValue(null);
    const res = mockRes();
    await updateCategory({ params: { id: 99 }, body: { category_name: "X" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe("CategoryController - deleteCategory", () => {
  test("200: elimina categoría exitosamente", async () => {
    const cat = { category_id: 1, destroy: jest.fn().mockResolvedValue() };
    findByPkMock.mockResolvedValue(cat);
    const res = mockRes();
    await deleteCategory({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Category deleted successfully" }));
  });

  test("404: categoría no encontrada para eliminar", async () => {
    findByPkMock.mockResolvedValue(null);
    const res = mockRes();
    await deleteCategory({ params: { id: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("409: no elimina si hay FK (ForeignKeyConstraintError)", async () => {
    const err = new Error("FK");
    err.name = "SequelizeForeignKeyConstraintError";
    const cat = { category_id: 1, destroy: jest.fn().mockRejectedValue(err) };
    findByPkMock.mockResolvedValue(cat);
    const res = mockRes();
    await deleteCategory({ params: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });
});
