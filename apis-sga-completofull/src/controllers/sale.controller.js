// src/controllers/sale.controller.js
import Sale from "../models/sale.model.js";
import SaleProduct from "../models/saleProduct.model.js";
import Product from "../models/product.model.js";
import Customer from "../models/customer.model.js";
import PaymentType from "../models/paymentType.model.js";
import sequelize from "../config/connect.db.js";

// ----------------------------------------------------
// UTILITY: Manejador de Errores para Consistencia
// ----------------------------------------------------
const handleSequelizeError = (res, error, defaultMessage) => {
    // 409 Conflict: Problemas de unicidad (e.g., numberBill ya existe)
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ 
            message: "Conflict: The data is already registered (Bill Number).", 
            details: error.errors.map(err => err.message) 
        });
    }
    // 400 Bad Request: Fallo en la validación (allowNull: false)
    if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
            message: "Validation failed: Missing or incorrect data.", 
            details: error.errors.map(err => err.message) 
        });
    }
    // 409 Conflict: Violación de Clave Foránea (Al intentar borrar)
    if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(409).json({ 
            message: "Conflict: Cannot delete or update due to associated records.", 
            details: "This sale has associated products."
        });
    }
    
    // 500 Internal Server Error para otros errores
    console.error("Sequelize Error:", error);
    return res.status(500).json({ 
        message: defaultMessage, 
        error: error.message
    });
};

// ------ CREAR VENTAS COMPLETAS (TRANSACCIÓN ATÓMICA) ------ //
export const createSale = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        // Usamos los nombres de las FKs del body (snake_case)
        const { customerId, paymentTypeId, products } = req.body; 

        if (!products || products.length === 0) {
            return res.status(400).json({ message: "Must add products to the sale." });
        }

        // 1. Validar existencias de FKs
        const customerExists = await Customer.findByPk(customerId);
        if (!customerExists) {
            return res.status(400).json({ message: "Customer not found." });
        }
        const paymentTypeExists = await PaymentType.findByPk(paymentTypeId);
        if (!paymentTypeExists) {
            return res.status(400).json({ message: "Payment Type not found." });
        }

        // 2. Pre-cálculo y validación de stock
        let total = 0;
        const productsDB = []; // Almacenar productos de DB para el segundo loop

        for (let p of products) {
            // Buscamos por el PK (id) del modelo Product
            const productDB = await Product.findByPk(p.productId); 

            if (!productDB) {
                return res.status(404).json({ message: `Product ID ${p.productId} not found.` });
            }
            // CRÍTICO: Usamos 'stock' y 'quantity' consistentes
            if (productDB.stock < p.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${productDB.nameProduct}. Available: ${productDB.stock}, Requested: ${p.quantity}` });
            }

            // CRÍTICO: Usamos 'unitPrice' del modelo Product
            total += productDB.unitPrice * p.quantity;
            productsDB.push({ productDB, quantity: p.quantity });
        }

        // 3. Generar número de factura único (numberBill)
        // CRÍTICO: Implementar lógica de unicidad
        const numberBill = `FACT-${Date.now()}`; 

        // 4. Crear venta (Sale) - Usando nombres de atributos del modelo (camelCase)
        const sale = await Sale.create(
            {
                customerId,
                paymentTypeId,
                dateSale: new Date(), // Usamos el atributo del modelo (dateSale)
                numberBill,
                total,
            },
            { transaction: t }
        );

        // 5. Insertar detalles (SaleProduct) y reducir stock
        for (let p of productsDB) {
            // Insertar detalle de venta (SaleProduct)
            await SaleProduct.create(
                {
                    saleId: sale.id, // CRÍTICO: Usamos sale.id (PK)
                    productId: p.productDB.id, 
                    quantity: p.quantity, // CRÍTICO: Usamos quantity
                    sellPrice: p.productDB.unitPrice, 
                },
                { transaction: t }
            );

            // Reducir stock
            await Product.update(
                {
                    stock: p.productDB.stock - p.quantity,
                },
                { where: { id: p.productDB.id }, transaction: t }
            );
        }

        // 6. Finalizar transacción
        await t.commit();
        res.status(201).json({ message: "Sale created successfully", id: sale.id, numberBill: sale.numberBill });

    } catch (error) {
        await t.rollback();
        // Usamos el handler unificado para errores de DB (unicidad, validación, etc.)
        handleSequelizeError(res, error, "Error creating the sale");
    }
};

// ------------------------------------ //


// ------ VER TODAS LAS VENTAS (con asociaciones) ------ //
export const getSales = async (req, res) => {
    try {
        const sales = await Sale.findAll({
            include: [
                { model: Customer },
                { model: PaymentType },
            ],
            // Opcional: ordenar por fecha
            order: [['dateSale', 'DESC']]
        });

        res.status(200).json(sales);
    } catch (error) {
        handleSequelizeError(res, error, "Error fetching sales");
    }
};
// ---------------------------------- //


// ------ DETALLE VENTAS POR ID (con anidamiento de asociaciones) ------ //
export const getSaleById = async (req, res) => {
    try {
        const sale = await Sale.findByPk(req.params.id, {
            include: [
                { model: Customer },
                { model: PaymentType },
                // Asociación Sale -> SaleProduct -> Product
                {
                    model: SaleProduct,
                    include: [{ model: Product, attributes: { exclude: ['stock'] } }], // Excluimos stock del producto
                },
            ],
        });

        if (!sale) return res.status(404).json({ message: "Sale not found" });

        res.status(200).json(sale);
    } catch (error) {
        handleSequelizeError(res, error, "Error fetching sale details");
    }
};
// ----------------------------------- //


// ------ ELIMINAR UNA VENTA ------ //
export const deleteSale = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const sale = await Sale.findByPk(req.params.id, {
            include: [{ model: SaleProduct }]
        });

        if (!sale) {
            await t.rollback();
            return res.status(404).json({ message: "Sale not found" });
        }

        // 1. Revertir stock
        for (const detail of sale.SaleProducts) {
            const product = await Product.findByPk(detail.productId);

            if (product) {
                await product.update(
                    { stock: product.stock + detail.quantity },
                    { transaction: t }
                );
            }
        }

        // 2. Borrar detalles
        await SaleProduct.destroy({
            where: { saleId: sale.id },
            transaction: t
        });

        // 3. Borrar venta
        await sale.destroy({ transaction: t });

        await t.commit();

        res.status(200).json({ message: "Sale deleted and stock reverted successfully" });

    } catch (error) {
        await t.rollback();
        handleSequelizeError(res, error, "Error deleting sale");
    }
};

// -------------------------------- //