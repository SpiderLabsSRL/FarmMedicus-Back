const express = require("express");
const router = express.Router();
const salesController = require("../controllers/salesController");

// Rutas de ventas - CORREGIDO: usar searchProducts en lugar de searchVariants
router.get("/sales/products/search", salesController.searchProducts);
router.get("/sales/cash-status", salesController.getCashStatus);
router.post("/sales/process", salesController.processSale);

module.exports = router;