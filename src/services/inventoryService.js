const { query } = require("../../db");

const getInventory = async (searchTerm = null, lowMarginOnly = false, categories = [], types = []) => {
  try {
    let sqlQuery = `
      SELECT DISTINCT
        v.idvariante,
        v.idproducto,
        p.nombre as nombre_producto,
        v.nombre_variante,
        v.precio_compra,
        v.precio_venta,
        v.stock,
        v.stock_minimo,
        v.estado,
        COALESCE(
          (SELECT MAX(fecha_hora) 
           FROM detalle_ventas dv 
           JOIN ventas ve ON dv.idventa = ve.idventa 
           WHERE dv.idvariante = v.idvariante),
          CURRENT_TIMESTAMP
        ) as ultima_edicion
      FROM variantes v
      INNER JOIN productos p ON v.idproducto = p.idproducto
      LEFT JOIN producto_categorias pc ON p.idproducto = pc.idproducto
      LEFT JOIN producto_tipos pt ON p.idproducto = pt.idproducto
      WHERE v.estado = 0 AND p.estado = 0
    `;

    const params = [];
    let paramCount = 0;

    if (searchTerm) {
      paramCount++;
      sqlQuery += ` AND (p.nombre ILIKE $${paramCount} OR v.nombre_variante ILIKE $${paramCount})`;
      params.push(`%${searchTerm}%`);
    }

    if (lowMarginOnly) {
      sqlQuery += ` AND ((v.precio_venta - v.precio_compra) / v.precio_compra * 100) < 50`;
    }

    if (categories.length > 0) {
      paramCount++;
      const placeholders = categories.map((_, index) => `$${paramCount + index}`).join(',');
      sqlQuery += ` AND pc.idcategoria IN (${placeholders})`;
      params.push(...categories);
      paramCount += categories.length - 1;
    }

    if (types.length > 0) {
      paramCount++;
      const placeholders = types.map((_, index) => `$${paramCount + index}`).join(',');
      sqlQuery += ` AND pt.idtipo IN (${placeholders})`;
      params.push(...types);
    }

    sqlQuery += ` ORDER BY p.nombre, v.nombre_variante`;

    const result = await query(sqlQuery, params);
    return result.rows;
  } catch (error) {
    console.error("Error en inventoryService.getInventory:", error);
    throw error;
  }
};

const getLowMarginCount = async () => {
  try {
    const sqlQuery = `
      SELECT COUNT(*) as count
      FROM variantes v
      INNER JOIN productos p ON v.idproducto = p.idproducto
      WHERE v.estado = 0 AND p.estado = 0
      AND ((v.precio_venta - v.precio_compra) / v.precio_compra * 100) < 50
    `;

    const result = await query(sqlQuery);
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error("Error en inventoryService.getLowMarginCount:", error);
    throw error;
  }
};

const getCategories = async () => {
  try {
    const sqlQuery = `
      SELECT 
        idcategoria as id,
        nombre
      FROM categorias 
      WHERE estado = 0
      ORDER BY nombre
    `;

    const result = await query(sqlQuery);
    return result.rows;
  } catch (error) {
    console.error("Error en inventoryService.getCategories:", error);
    throw error;
  }
};

const getTypes = async () => {
  try {
    const sqlQuery = `
      SELECT 
        idtipo as id,
        nombre
      FROM tipos 
      WHERE estado = 0
      ORDER BY nombre
    `;

    const result = await query(sqlQuery);
    return result.rows;
  } catch (error) {
    console.error("Error en inventoryService.getTypes:", error);
    throw error;
  }
};

module.exports = {
  getInventory,
  getLowMarginCount,
  getCategories,
  getTypes
};