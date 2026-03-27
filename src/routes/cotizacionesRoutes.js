const express = require("express");
const router = express.Router();
const cotizacionesController = require("../controllers/cotizacionesController");

// RUTAS CORREGIDAS:
router.get("/cotizaciones/productos/search", cotizacionesController.searchProductos);
router.get("/cotizaciones/search", cotizacionesController.searchCotizaciones); // Búsqueda general

// Rutas específicas ANTES de las parámetros
router.get("/cotizaciones/productos", cotizacionesController.getProductos);

// Rutas con parámetros
router.get("/cotizaciones/:id", cotizacionesController.getCotizacionById);

// Otras rutas generales
router.post("/cotizaciones", cotizacionesController.createCotizacion);
router.get("/cotizaciones", cotizacionesController.getCotizaciones);
router.put("/cotizaciones/:id", cotizacionesController.updateCotizacion);
router.delete("/cotizaciones/:id", cotizacionesController.deleteCotizacion);

module.exports = router;