// src/services/ecommerceService.js
const { query, pool } = require("../../db");

const getCarruseles = async () => {
  const result = await query(
    "SELECT idcarrusel, nombre, estado FROM carruseles WHERE estado = 0 ORDER BY idcarrusel DESC"
  );
  return result.rows;
};

const createCarrusel = async (nombre) => {
  const result = await query(
    "INSERT INTO carruseles (nombre, estado) VALUES ($1, 0) RETURNING idcarrusel, nombre, estado",
    [nombre]
  );
  return result.rows[0];
};

const updateCarrusel = async (id, nombre) => {
  const result = await query(
    "UPDATE carruseles SET nombre = $1 WHERE idcarrusel = $2 AND estado = 0 RETURNING idcarrusel, nombre, estado",
    [nombre, id]
  );
  
  if (result.rows.length === 0) {
    throw new Error("Carrusel no encontrado");
  }
  
  return result.rows[0];
};

const deleteCarrusel = async (id) => {
  const result = await query(
    "UPDATE carruseles SET estado = 2 WHERE idcarrusel = $1 RETURNING idcarrusel",
    [id]
  );
  
  if (result.rows.length === 0) {
    throw new Error("Carrusel no encontrado");
  }
};

const getCarruselVariantes = async (idCarrusel) => {
  const result = await query(
    `SELECT cv.idcarrusel_variante, cv.idcarrusel, cv.idproducto 
     FROM carrusel_variantes cv 
     INNER JOIN carruseles c ON cv.idcarrusel = c.idcarrusel 
     WHERE cv.idcarrusel = $1 AND c.estado = 0`,
    [idCarrusel]
  );
  return result.rows;
};

const addCarruselVariantes = async (idCarrusel, productos) => {
  // Verificar que el carrusel existe y está activo
  const carruselCheck = await query(
    "SELECT idcarrusel FROM carruseles WHERE idcarrusel = $1 AND estado = 0",
    [idCarrusel]
  );
  
  if (carruselCheck.rows.length === 0) {
    throw new Error("Carrusel no encontrado o inactivo");
  }
  
  // Validar que productos sea un array
  if (!Array.isArray(productos)) {
    throw new Error("El parámetro 'productos' debe ser un array");
  }
  
  // Insertar cada producto si el array no está vacío
  if (productos.length > 0) {
    const values = productos.map((idProducto, index) => 
      `($${index * 2 + 1}, $${index * 2 + 2})`
    ).join(', ');
    
    const params = productos.flatMap(idProducto => [idCarrusel, idProducto]);
    
    const queryText = `
      INSERT INTO carrusel_variantes (idcarrusel, idproducto) 
      VALUES ${values} 
      ON CONFLICT (idcarrusel, idproducto) DO NOTHING
    `;
    
    await query(queryText, params);
  }
};

const updateCarruselVariantes = async (idCarrusel, productos) => {
  // Verificar que el carrusel existe y está activo
  const carruselCheck = await query(
    "SELECT idcarrusel FROM carruseles WHERE idcarrusel = $1 AND estado = 0",
    [idCarrusel]
  );
  
  if (carruselCheck.rows.length === 0) {
    throw new Error("Carrusel no encontrado o inactivo");
  }
  
  // Validar que productos sea un array
  if (!Array.isArray(productos)) {
    throw new Error("El parámetro 'productos' debe ser un array");
  }
  
  // Usar transacción para asegurar consistencia
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Eliminar todas las variantes actuales
    await client.query(
      "DELETE FROM carrusel_variantes WHERE idcarrusel = $1",
      [idCarrusel]
    );
    
    // Insertar los nuevos productos si el array no está vacío
    if (productos.length > 0) {
      const values = productos.map((idProducto, index) => 
        `($${index * 2 + 1}, $${index * 2 + 2})`
      ).join(', ');
      
      const params = productos.flatMap(idProducto => [idCarrusel, idProducto]);
      
      const queryText = `
        INSERT INTO carrusel_variantes (idcarrusel, idproducto) 
        VALUES ${values}
      `;
      
      await client.query(queryText, params);
    }
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const getProductos = async () => {
  const result = await query(
    "SELECT idproducto, nombre, descripcion, idubicacion, estado FROM productos WHERE estado = 0 ORDER BY idproducto DESC"
  );
  return result.rows;
};

const getProductoCategorias = async (idProducto) => {
  const result = await query(
    `SELECT c.nombre 
     FROM categorias c 
     INNER JOIN producto_categorias pc ON c.idcategoria = pc.idcategoria 
     WHERE pc.idproducto = $1 AND c.estado = 0`,
    [idProducto]
  );
  return result.rows.map(row => row.nombre);
};

const getProductoTipos = async (idProducto) => {
  const result = await query(
    `SELECT t.nombre 
     FROM tipos t 
     INNER JOIN producto_tipos pt ON t.idtipo = pt.idtipo 
     WHERE pt.idproducto = $1 AND t.estado = 0`,
    [idProducto]
  );
  return result.rows.map(row => row.nombre);
};

const getProductoVariantes = async (idProducto) => {
  const result = await query(
    `SELECT idvariante, idproducto, nombre_variante, precio_venta, precio_compra, 
            idcolor_disenio, idcolor_luz, idwatt, idtamano, stock, stock_minimo, estado 
     FROM variantes 
     WHERE idproducto = $1 AND estado = 0 
     ORDER BY idvariante`,
    [idProducto]
  );
  return result.rows;
};

const getVarianteImagenes = async (idVariante) => {
  const result = await query(
    "SELECT idimagen, idvariante, ENCODE(imagen, 'base64') as imagen FROM imagenes_variantes WHERE idvariante = $1",
    [idVariante]
  );
  return result.rows;
};

const getColorDisenio = async (id) => {
  // Si el ID es null o no válido, retornar objeto por defecto
  if (!id || typeof id !== 'number' || isNaN(id) || id <= 0) {
    return {
      idcolor_disenio: null,
      nombre: "Sin color",
      estado: 0
    };
  }
  
  try {
    const result = await query(
      "SELECT idcolor_disenio, nombre, estado FROM colores_disenio WHERE idcolor_disenio = $1 AND estado = 0",
      [id]
    );
    
    // Si no se encuentra el color, NO lanzar error, retornar objeto por defecto
    if (result.rows.length === 0) {
      return {
        idcolor_disenio: id,
        nombre: "Color no disponible",
        estado: 0
      };
    }
    
    return result.rows[0];
  } catch (error) {
    console.error("Error en getColorDisenio service:", error);
    // En caso de error de base de datos, retornar objeto por defecto
    return {
      idcolor_disenio: id,
      nombre: "Error en base de datos",
      estado: 0
    };
  }
};
const searchProductos = async (searchTerm) => {
  const searchPattern = `%${searchTerm}%`;
  
  const result = await query(
    `SELECT DISTINCT p.idproducto, p.nombre, p.descripcion, p.idubicacion, p.estado 
     FROM productos p
     LEFT JOIN producto_categorias pc ON p.idproducto = pc.idproducto
     LEFT JOIN categorias c ON pc.idcategoria = c.idcategoria
     LEFT JOIN producto_tipos pt ON p.idproducto = pt.idproducto
     LEFT JOIN tipos t ON pt.idtipo = t.idtipo
     LEFT JOIN variantes v ON p.idproducto = v.idproducto
     LEFT JOIN colores_disenio cd ON v.idcolor_disenio = cd.idcolor_disenio
     WHERE p.estado = 0 
       AND (p.nombre ILIKE $1 
         OR p.descripcion ILIKE $1
         OR c.nombre ILIKE $1
         OR t.nombre ILIKE $1
         OR cd.nombre ILIKE $1)
     ORDER BY p.idproducto DESC
     LIMIT 50`,
    [searchPattern]
  );
  
  return result.rows;
};

module.exports = {
  getCarruseles,
  createCarrusel,
  updateCarrusel,
  deleteCarrusel,
  getCarruselVariantes,
  addCarruselVariantes,
  updateCarruselVariantes,
  getProductos,
  getProductoCategorias,
  getProductoTipos,
  getProductoVariantes,
  getVarianteImagenes,
  getColorDisenio,
  searchProductos
};