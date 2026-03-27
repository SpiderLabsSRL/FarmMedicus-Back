const ManagementSectionService = require("../services/ManagementSectionService");

class ManagementSectionController {
  // Colores de Diseño
  static async getColoresDiseno(req, res) {
    try {
      const colores = await ManagementSectionService.getColoresDiseno();
      res.json(colores);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createColorDiseno(req, res) {
    try {
      const { nombre } = req.body;
      const nuevoColor = await ManagementSectionService.createColorDiseno(nombre);
      res.status(201).json(nuevoColor);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateColorDiseno(req, res) {
    try {
      const { id } = req.params;
      const { nombre } = req.body;
      const colorActualizado = await ManagementSectionService.updateColorDiseno(parseInt(id), nombre);
      res.json(colorActualizado);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteColorDiseno(req, res) {
    try {
      const { id } = req.params;
      await ManagementSectionService.deleteColorDiseno(parseInt(id));
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Colores de Luz
  static async getColoresLuz(req, res) {
    try {
      const colores = await ManagementSectionService.getColoresLuz();
      res.json(colores);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createColorLuz(req, res) {
    try {
      const { nombre } = req.body;
      const nuevoColor = await ManagementSectionService.createColorLuz(nombre);
      res.status(201).json(nuevoColor);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateColorLuz(req, res) {
    try {
      const { id } = req.params;
      const { nombre } = req.body;
      const colorActualizado = await ManagementSectionService.updateColorLuz(parseInt(id), nombre);
      res.json(colorActualizado);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteColorLuz(req, res) {
    try {
      const { id } = req.params;
      await ManagementSectionService.deleteColorLuz(parseInt(id));
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Tipos
  static async getTipos(req, res) {
    try {
      const tipos = await ManagementSectionService.getTipos();
      res.json(tipos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createTipo(req, res) {
    try {
      const { nombre } = req.body;
      const nuevoTipo = await ManagementSectionService.createTipo(nombre);
      res.status(201).json(nuevoTipo);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateTipo(req, res) {
    try {
      const { id } = req.params;
      const { nombre } = req.body;
      const tipoActualizado = await ManagementSectionService.updateTipo(parseInt(id), nombre);
      res.json(tipoActualizado);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteTipo(req, res) {
    try {
      const { id } = req.params;
      await ManagementSectionService.deleteTipo(parseInt(id));
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Categorías
  static async getCategorias(req, res) {
    try {
      const categorias = await ManagementSectionService.getCategorias();
      res.json(categorias);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createCategoria(req, res) {
    try {
      const { nombre } = req.body;
      const nuevaCategoria = await ManagementSectionService.createCategoria(nombre);
      res.status(201).json(nuevaCategoria);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateCategoria(req, res) {
    try {
      const { id } = req.params;
      const { nombre } = req.body;
      const categoriaActualizada = await ManagementSectionService.updateCategoria(parseInt(id), nombre);
      res.json(categoriaActualizada);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteCategoria(req, res) {
    try {
      const { id } = req.params;
      await ManagementSectionService.deleteCategoria(parseInt(id));
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Ubicaciones
  static async getUbicaciones(req, res) {
    try {
      const ubicaciones = await ManagementSectionService.getUbicaciones();
      res.json(ubicaciones);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createUbicacion(req, res) {
    try {
      const { nombre } = req.body;
      const nuevaUbicacion = await ManagementSectionService.createUbicacion(nombre);
      res.status(201).json(nuevaUbicacion);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateUbicacion(req, res) {
    try {
      const { id } = req.params;
      const { nombre } = req.body;
      const ubicacionActualizada = await ManagementSectionService.updateUbicacion(parseInt(id), nombre);
      res.json(ubicacionActualizada);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteUbicacion(req, res) {
    try {
      const { id } = req.params;
      await ManagementSectionService.deleteUbicacion(parseInt(id));
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Watts
  static async getWatts(req, res) {
    try {
      const watts = await ManagementSectionService.getWatts();
      res.json(watts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createWatt(req, res) {
    try {
      const { nombre } = req.body;
      const nuevoWatt = await ManagementSectionService.createWatt(nombre);
      res.status(201).json(nuevoWatt);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateWatt(req, res) {
    try {
      const { id } = req.params;
      const { nombre } = req.body;
      const wattActualizado = await ManagementSectionService.updateWatt(parseInt(id), nombre);
      res.json(wattActualizado);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteWatt(req, res) {
    try {
      const { id } = req.params;
      await ManagementSectionService.deleteWatt(parseInt(id));
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Tamaños
  static async getTamanos(req, res) {
    try {
      const tamanos = await ManagementSectionService.getTamanos();
      res.json(tamanos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createTamano(req, res) {
    try {
      const { nombre } = req.body;
      const nuevoTamano = await ManagementSectionService.createTamano(nombre);
      res.status(201).json(nuevoTamano);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateTamano(req, res) {
    try {
      const { id } = req.params;
      const { nombre } = req.body;
      const tamanoActualizado = await ManagementSectionService.updateTamano(parseInt(id), nombre);
      res.json(tamanoActualizado);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteTamano(req, res) {
    try {
      const { id } = req.params;
      await ManagementSectionService.deleteTamano(parseInt(id));
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = ManagementSectionController;