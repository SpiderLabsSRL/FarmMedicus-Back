const express = require("express");
const router = express.Router();
const ManagementSectionController = require("../controllers/ManagementSectionController");

// Rutas para Colores de Diseño
router.get("/management/colores-disenio", ManagementSectionController.getColoresDiseno);
router.post("/management/colores-disenio", ManagementSectionController.createColorDiseno);
router.put("/management/colores-disenio/:id", ManagementSectionController.updateColorDiseno);
router.delete("/management/colores-disenio/:id", ManagementSectionController.deleteColorDiseno);

// Rutas para Colores de Luz
router.get("/management/colores-luz", ManagementSectionController.getColoresLuz);
router.post("/management/colores-luz", ManagementSectionController.createColorLuz);
router.put("/management/colores-luz/:id", ManagementSectionController.updateColorLuz);
router.delete("/management/colores-luz/:id", ManagementSectionController.deleteColorLuz);

// Rutas para Tipos
router.get("/management/tipos", ManagementSectionController.getTipos);
router.post("/management/tipos", ManagementSectionController.createTipo);
router.put("/management/tipos/:id", ManagementSectionController.updateTipo);
router.delete("/management/tipos/:id", ManagementSectionController.deleteTipo);

// Rutas para Categorías
router.get("/management/categorias", ManagementSectionController.getCategorias);
router.post("/management/categorias", ManagementSectionController.createCategoria);
router.put("/management/categorias/:id", ManagementSectionController.updateCategoria);
router.delete("/management/categorias/:id", ManagementSectionController.deleteCategoria);

// Rutas para Ubicaciones
router.get("/management/ubicaciones", ManagementSectionController.getUbicaciones);
router.post("/management/ubicaciones", ManagementSectionController.createUbicacion);
router.put("/management/ubicaciones/:id", ManagementSectionController.updateUbicacion);
router.delete("/management/ubicaciones/:id", ManagementSectionController.deleteUbicacion);

// Rutas para Watts
router.get("/management/watts", ManagementSectionController.getWatts);
router.post("/management/watts", ManagementSectionController.createWatt);
router.put("/management/watts/:id", ManagementSectionController.updateWatt);
router.delete("/management/watts/:id", ManagementSectionController.deleteWatt);

// Rutas para Tamaños
router.get("/management/tamanos", ManagementSectionController.getTamanos);
router.post("/management/tamanos", ManagementSectionController.createTamano);
router.put("/management/tamanos/:id", ManagementSectionController.updateTamano);
router.delete("/management/tamanos/:id", ManagementSectionController.deleteTamano);

module.exports = router;