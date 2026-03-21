import SaleProduct from "../models/saleProduct.model.js";
import Sale from "../models/sale.model.js";
import Product from "../models/product.model.js";

// Inclusiones
const saleProductIncludeOptions = [
  {
    model: Sale,
    attributes: ["id", "date_sale", "number_bill", "Total"],
  },
  {
    model: Product,
    attributes: ["id", "name_product", "unit_price"],
  },
];

// ---------- GET ALL ----------
export const getAllSaleProducts = async (req, res) => {
  try {
    const saleProducts = await SaleProduct.findAll({
      include: saleProductIncludeOptions,
    });
    res.json(saleProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching all sale products", error: error.message });
  }
};

// ---------- GET BY ID ----------
export const getSaleProductById = async (req, res) => {
  try {
    const saleProduct = await SaleProduct.findByPk(req.params.id, {
      include: saleProductIncludeOptions,
    });

    if (!saleProduct) {
      return res.status(404).json({ message: "Detalle de venta no encontrado" });
    }

    res.json(saleProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching sale product by ID", error: error.message });
  }
};

// ---------- CREATE ----------
export const createSaleProduct = async (req, res) => {
  try {
    const { quantity, sellPrice, saleId, productId } = req.body;

    if (!quantity || !sellPrice || !saleId || !productId) {
      return res.status(400).json({
        message: "Faltan campos requeridos: quantity, sellPrice, saleId, productId",
      });
    }

    const newSaleProduct = await SaleProduct.create({
      quantity,
      sellPrice,
      saleId,
      productId,
    });

    res.status(201).json(newSaleProduct);
  } catch (error) {
    console.error(error);

    // Error por producto duplicado en la misma venta
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "Este producto ya fue agregado a esta venta",
      });
    }

    res.status(500).json({ message: "Error creating sale product", error: error.message });
  }
};

// ---------- UPDATE ----------
export const updateSaleProduct = async (req, res) => {
  try {
    const saleProduct = await SaleProduct.findByPk(req.params.id);

    if (!saleProduct) {
      return res.status(404).json({ message: "Detalle de venta no encontrado" });
    }

    // SOLO se actualiza quantity y sellPrice
    const { quantity, sellPrice } = req.body;

    await saleProduct.update({ quantity, sellPrice });

    res.json(saleProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating sale product", error: error.message });
  }
};

// ---------- DELETE ----------
export const deleteSaleProduct = async (req, res) => {
  try {
    const saleProduct = await SaleProduct.findByPk(req.params.id);

    if (!saleProduct) {
      return res.status(404).json({ message: "Detalle de venta no encontrado" });
    }

    await saleProduct.destroy();
    res.json({ message: "Detalle de venta eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting sale product", error: error.message });
  }
};
