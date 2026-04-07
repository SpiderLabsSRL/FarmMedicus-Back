// src/controllers/productsController.js
const productsService = require("../services/productsService");

const productsController = {
  // Obtener opciones de selección
  getUbicaciones: async (req, res) => {
    try {
      const ubicaciones = await productsService.getUbicaciones();
      res.json(ubicaciones);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getCategorias: async (req, res) => {
    try {
      const categorias = await productsService.getCategorias();
      res.json(categorias);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // CRUD de productos - MODIFICADO para búsqueda
  getProductos: async (req, res) => {
    try {
      const { termino } = req.query;
      let productos;
      
      if (termino && termino.trim().length >= 2) {
        productos = await productsService.buscarProductos(termino);
      } else {
        productos = [];
      }
      
      res.json(productos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener todos los productos
  getTodosProductos: async (req, res) => {
    try {
      const productos = await productsService.getTodosProductos();
      res.json(productos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Búsqueda específica
  buscarProductos: async (req, res) => {
    try {
      const { termino } = req.query;
      if (!termino || termino.trim().length < 2) {
        return res.json([]);
      }
      
      const productos = await productsService.buscarProductos(termino);
      res.json(productos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getProductoById: async (req, res) => {
    try {
      const { id } = req.params;
      const producto = await productsService.getProductoById(parseInt(id));
      res.json(producto);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  createProducto: async (req, res) => {
    try {
      const productoData = {
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        idubicacion: parseInt(req.body.idubicacion),
        categorias: JSON.parse(req.body.categorias || '[]'),
        precio_compra: parseFloat(req.body.precio_compra),
        precio_venta: parseFloat(req.body.precio_venta),
        stock: parseInt(req.body.stock)
      };

      let imagenFile = null;
      if (req.file) {
        imagenFile = req.file;
      } else if (req.files && req.files.imagen) {
        imagenFile = req.files.imagen;
      }

      const producto = await productsService.createProducto(productoData, imagenFile);
      res.status(201).json(producto);
    } catch (error) {
      console.error("Error creating producto:", error);
      res.status(500).json({ error: error.message });
    }
  },

  updateProducto: async (req, res) => {
    try {
      const { id } = req.params;
      
      const productoData = {
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        idubicacion: parseInt(req.body.idubicacion),
        categorias: JSON.parse(req.body.categorias || '[]'),
        precio_compra: parseFloat(req.body.precio_compra),
        precio_venta: parseFloat(req.body.precio_venta),
        stock: parseInt(req.body.stock)
      };

      let imagenFile = null;
      if (req.file) {
        imagenFile = req.file;
      } else if (req.files && req.files.imagen) {
        imagenFile = req.files.imagen;
      }

      const producto = await productsService.updateProducto(parseInt(id), productoData, imagenFile);
      res.json(producto);
    } catch (error) {
      console.error("Error updating producto:", error);
      res.status(500).json({ error: error.message });
    }
  },

  deleteProducto: async (req, res) => {
    try {
      const { id } = req.params;
      await productsService.deleteProducto(parseInt(id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateStockProducto: async (req, res) => {
    try {
      const { id } = req.params;
      const { cantidad } = req.body;
      const producto = await productsService.updateStockProducto(parseInt(id), cantidad);
      res.json(producto);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = productsController;