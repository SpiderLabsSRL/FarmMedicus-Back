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

  getTipos: async (req, res) => {
    try {
      const tipos = await productsService.getTipos();
      res.json(tipos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getColoresDiseno: async (req, res) => {
    try {
      const colores = await productsService.getColoresDiseno();
      res.json(colores);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getColoresLuz: async (req, res) => {
    try {
      const colores = await productsService.getColoresLuz();
      res.json(colores);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getWatts: async (req, res) => {
    try {
      const watts = await productsService.getWatts();
      res.json(watts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getTamanos: async (req, res) => {
    try {
      const tamanos = await productsService.getTamanos();
      res.json(tamanos);
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
      // Parsear datos del formulario
      const productoData = {
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        idubicacion: parseInt(req.body.idubicacion),
        categorias: JSON.parse(req.body.categorias || '[]'),
        tipos: JSON.parse(req.body.tipos || '[]'),
        variantes: []
      };

      // Procesar variantes del formulario
      const variantesKeys = Object.keys(req.body).filter(key => key.startsWith('variantes['));
      const variantesCount = new Set(variantesKeys.map(key => key.match(/variantes\[(\d+)\]/)[1])).size;
      
      for (let i = 0; i < variantesCount; i++) {
        const variante = {
          nombre_variante: req.body[`variantes[${i}][nombre_variante]`],
          precio_venta: parseFloat(req.body[`variantes[${i}][precio_venta]`]),
          precio_compra: parseFloat(req.body[`variantes[${i}][precio_compra]`]),
          idcolor_disenio: parseInt(req.body[`variantes[${i}][idcolor_disenio]`]),
          idcolor_luz: parseInt(req.body[`variantes[${i}][idcolor_luz]`]),
          idwatt: parseInt(req.body[`variantes[${i}][idwatt]`]),
          idtamano: parseInt(req.body[`variantes[${i}][idtamano]`]),
          stock: parseInt(req.body[`variantes[${i}][stock]`]),
          stock_minimo: parseInt(req.body[`variantes[${i}][stock_minimo]`]),
          imagenes: []
        };

        // Obtener imágenes de esta variante
        if (req.files) {
          const varianteImages = req.files.filter(file => 
            file.fieldname.startsWith(`variantes[${i}][imagenes]`)
          );
          variante.imagenes = varianteImages;
        }

        productoData.variantes.push(variante);
      }

      const producto = await productsService.createProducto(productoData, req.files);
      res.status(201).json(producto);
    } catch (error) {
      console.error("Error creating producto:", error);
      res.status(500).json({ error: error.message });
    }
  },

  updateProducto: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Parsear datos del formulario
      const productoData = {
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        idubicacion: parseInt(req.body.idubicacion),
        categorias: JSON.parse(req.body.categorias || '[]'),
        tipos: JSON.parse(req.body.tipos || '[]'),
        variantes: []
      };

      // Procesar variantes del formulario
      const variantesKeys = Object.keys(req.body).filter(key => key.startsWith('variantes['));
      const variantesCount = new Set(variantesKeys.map(key => key.match(/variantes\[(\d+)\]/)[1])).size;
      
      for (let i = 0; i < variantesCount; i++) {
        const variante = {
          nombre_variante: req.body[`variantes[${i}][nombre_variante]`],
          precio_venta: parseFloat(req.body[`variantes[${i}][precio_venta]`]),
          precio_compra: parseFloat(req.body[`variantes[${i}][precio_compra]`]),
          idcolor_disenio: parseInt(req.body[`variantes[${i}][idcolor_disenio]`]),
          idcolor_luz: parseInt(req.body[`variantes[${i}][idcolor_luz]`]),
          idwatt: parseInt(req.body[`variantes[${i}][idwatt]`]),
          idtamano: parseInt(req.body[`variantes[${i}][idtamano]`]),
          stock: parseInt(req.body[`variantes[${i}][stock]`]),
          stock_minimo: parseInt(req.body[`variantes[${i}][stock_minimo]`]),
          imagenes: []
        };

        // Obtener imágenes de esta variante
        if (req.files) {
          const varianteImages = req.files.filter(file => 
            file.fieldname.startsWith(`variantes[${i}][imagenes]`)
          );
          variante.imagenes = varianteImages;
        }

        productoData.variantes.push(variante);
      }

      const producto = await productsService.updateProducto(parseInt(id), productoData, req.files);
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

  updateStockVariante: async (req, res) => {
    try {
      const { id } = req.params;
      const { cantidad } = req.body;
      const variante = await productsService.updateStockVariante(parseInt(id), cantidad);
      res.json(variante);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = productsController;