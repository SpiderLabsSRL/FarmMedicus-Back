const { query } = require("../../db");
const bcrypt = require("bcrypt");

class ManagementSectionService {
  // Colores de Diseño
  static async getColoresDiseno() {
    const result = await query("SELECT idcolor_disenio as id, nombre, estado FROM colores_disenio WHERE estado = 0 ORDER BY nombre");
    return result.rows;
  }

  static async createColorDiseno(nombre) {
    const result = await query(
      "INSERT INTO colores_disenio (nombre) VALUES ($1) RETURNING idcolor_disenio as id, nombre, estado",
      [nombre]
    );
    return result.rows[0];
  }

  static async updateColorDiseno(id, nombre) {
    const result = await query(
      "UPDATE colores_disenio SET nombre = $1 WHERE idcolor_disenio = $2 RETURNING idcolor_disenio as id, nombre, estado",
      [nombre, id]
    );
    if (result.rows.length === 0) {
      throw new Error("Color de diseño no encontrado");
    }
    return result.rows[0];
  }

  static async deleteColorDiseno(id) {
    const result = await query(
      "UPDATE colores_disenio SET estado = 1 WHERE idcolor_disenio = $1 RETURNING idcolor_disenio",
      [id]
    );
    if (result.rows.length === 0) {
      throw new Error("Color de diseño no encontrado");
    }
  }

  // Colores de Luz
  static async getColoresLuz() {
    const result = await query("SELECT idcolor_luz as id, nombre, estado FROM colores_luz WHERE estado = 0 ORDER BY nombre");
    return result.rows;
  }

  static async createColorLuz(nombre) {
    const result = await query(
      "INSERT INTO colores_luz (nombre) VALUES ($1) RETURNING idcolor_luz as id, nombre, estado",
      [nombre]
    );
    return result.rows[0];
  }

  static async updateColorLuz(id, nombre) {
    const result = await query(
      "UPDATE colores_luz SET nombre = $1 WHERE idcolor_luz = $2 RETURNING idcolor_luz as id, nombre, estado",
      [nombre, id]
    );
    if (result.rows.length === 0) {
      throw new Error("Color de luz no encontrado");
    }
    return result.rows[0];
  }

  static async deleteColorLuz(id) {
    const result = await query(
      "UPDATE colores_luz SET estado = 1 WHERE idcolor_luz = $1 RETURNING idcolor_luz",
      [id]
    );
    if (result.rows.length === 0) {
      throw new Error("Color de luz no encontrado");
    }
  }

  // Tipos
  static async getTipos() {
    const result = await query("SELECT idtipo as id, nombre, estado FROM tipos WHERE estado = 0 ORDER BY nombre");
    return result.rows;
  }

  static async createTipo(nombre) {
    const result = await query(
      "INSERT INTO tipos (nombre) VALUES ($1) RETURNING idtipo as id, nombre, estado",
      [nombre]
    );
    return result.rows[0];
  }

  static async updateTipo(id, nombre) {
    const result = await query(
      "UPDATE tipos SET nombre = $1 WHERE idtipo = $2 RETURNING idtipo as id, nombre, estado",
      [nombre, id]
    );
    if (result.rows.length === 0) {
      throw new Error("Tipo no encontrado");
    }
    return result.rows[0];
  }

  static async deleteTipo(id) {
    const result = await query(
      "UPDATE tipos SET estado = 1 WHERE idtipo = $1 RETURNING idtipo",
      [id]
    );
    if (result.rows.length === 0) {
      throw new Error("Tipo no encontrado");
    }
  }

  // Categorías
  static async getCategorias() {
    const result = await query("SELECT idcategoria as id, nombre, estado FROM categorias WHERE estado = 0 ORDER BY nombre");
    return result.rows;
  }

  static async createCategoria(nombre) {
    const result = await query(
      "INSERT INTO categorias (nombre) VALUES ($1) RETURNING idcategoria as id, nombre, estado",
      [nombre]
    );
    return result.rows[0];
  }

  static async updateCategoria(id, nombre) {
    const result = await query(
      "UPDATE categorias SET nombre = $1 WHERE idcategoria = $2 RETURNING idcategoria as id, nombre, estado",
      [nombre, id]
    );
    if (result.rows.length === 0) {
      throw new Error("Categoría no encontrada");
    }
    return result.rows[0];
  }

  static async deleteCategoria(id) {
    const result = await query(
      "UPDATE categorias SET estado = 1 WHERE idcategoria = $1 RETURNING idcategoria",
      [id]
    );
    if (result.rows.length === 0) {
      throw new Error("Categoría no encontrada");
    }
  }

  // Ubicaciones
  static async getUbicaciones() {
    const result = await query("SELECT idubicacion as id, nombre, estado FROM ubicaciones WHERE estado = 0 ORDER BY nombre");
    return result.rows;
  }

  static async createUbicacion(nombre) {
    const result = await query(
      "INSERT INTO ubicaciones (nombre) VALUES ($1) RETURNING idubicacion as id, nombre, estado",
      [nombre]
    );
    return result.rows[0];
  }

  static async updateUbicacion(id, nombre) {
    const result = await query(
      "UPDATE ubicaciones SET nombre = $1 WHERE idubicacion = $2 RETURNING idubicacion as id, nombre, estado",
      [nombre, id]
    );
    if (result.rows.length === 0) {
      throw new Error("Ubicación no encontrada");
    }
    return result.rows[0];
  }

  static async deleteUbicacion(id) {
    const result = await query(
      "UPDATE ubicaciones SET estado = 1 WHERE idubicacion = $1 RETURNING idubicacion",
      [id]
    );
    if (result.rows.length === 0) {
      throw new Error("Ubicación no encontrada");
    }
  }

  // Watts
  static async getWatts() {
    const result = await query("SELECT idwatt as id, nombre, estado FROM watts WHERE estado = 0 ORDER BY nombre");
    return result.rows;
  }

  static async createWatt(nombre) {
    const result = await query(
      "INSERT INTO watts (nombre) VALUES ($1) RETURNING idwatt as id, nombre, estado",
      [nombre]
    );
    return result.rows[0];
  }

  static async updateWatt(id, nombre) {
    const result = await query(
      "UPDATE watts SET nombre = $1 WHERE idwatt = $2 RETURNING idwatt as id, nombre, estado",
      [nombre, id]
    );
    if (result.rows.length === 0) {
      throw new Error("Watt no encontrado");
    }
    return result.rows[0];
  }

  static async deleteWatt(id) {
    const result = await query(
      "UPDATE watts SET estado = 1 WHERE idwatt = $1 RETURNING idwatt",
      [id]
    );
    if (result.rows.length === 0) {
      throw new Error("Watt no encontrado");
    }
  }

  // Tamaños
  static async getTamanos() {
    const result = await query("SELECT idtamano as id, nombre, estado FROM tamanos WHERE estado = 0 ORDER BY nombre");
    return result.rows;
  }

  static async createTamano(nombre) {
    const result = await query(
      "INSERT INTO tamanos (nombre) VALUES ($1) RETURNING idtamano as id, nombre, estado",
      [nombre]
    );
    return result.rows[0];
  }

  static async updateTamano(id, nombre) {
    const result = await query(
      "UPDATE tamanos SET nombre = $1 WHERE idtamano = $2 RETURNING idtamano as id, nombre, estado",
      [nombre, id]
    );
    if (result.rows.length === 0) {
      throw new Error("Tamaño no encontrado");
    }
    return result.rows[0];
  }

  static async deleteTamano(id) {
    const result = await query(
      "UPDATE tamanos SET estado = 1 WHERE idtamano = $1 RETURNING idtamano",
      [id]
    );
    if (result.rows.length === 0) {
      throw new Error("Tamaño no encontrado");
    }
  }
}

module.exports = ManagementSectionService;