// src/routes/ecommerceRoutes.js - Agregar esta ruta
const express = require("express");
const router = express.Router();
const ecommerceController = require("../controllers/ecommerceController");

// Rutas para carruseles
router.get("/ecommerce/carruseles", ecommerceController.getCarruseles);
router.post("/ecommerce/carruseles", ecommerceController.createCarrusel);
router.put("/ecommerce/carruseles/:id", ecommerceController.updateCarrusel);
router.delete("/ecommerce/carruseles/:id", ecommerceController.deleteCarrusel);

// Rutas para variantes de carruseles
router.get("/ecommerce/carruseles/:id/variantes", ecommerceController.getCarruselVariantes);
router.post("/ecommerce/carruseles/:id/variantes", ecommerceController.addCarruselVariantes);
router.put("/ecommerce/carruseles/:id/variantes", ecommerceController.updateCarruselVariantes);

// Rutas para productos
router.get("/ecommerce/productos", ecommerceController.getProductos);
router.get("/ecommerce/productos/search", ecommerceController.searchProductos); // NUEVA RUTA
router.get("/ecommerce/productos/:id/categorias", ecommerceController.getProductoCategorias);
router.get("/ecommerce/productos/:id/tipos", ecommerceController.getProductoTipos);
router.get("/ecommerce/productos/:id/variantes", ecommerceController.getProductoVariantes);

// Rutas para variantes
router.get("/ecommerce/variantes/:id/imagenes", ecommerceController.getVarianteImagenes);

// Rutas para datos maestros
router.get("/ecommerce/colores-disenio/:id", ecommerceController.getColorDisenio);

module.exports = router;