// src/services/productsService.js
const { query, pool } = require("../../db");

const productsService = {
  // Obtener opciones de selección
  getUbicaciones: async () => {
    const result = await query("SELECT * FROM ubicaciones WHERE estado = 0 ORDER BY nombre");
    return result.rows;
  },

  getCategorias: async () => {
    const result = await query("SELECT * FROM categorias WHERE estado = 0 ORDER BY nombre");
    return result.rows;
  },

  getTipos: async () => {
    const result = await query("SELECT * FROM tipos WHERE estado = 0 ORDER BY nombre");
    return result.rows;
  },

  getColoresDiseno: async () => {
    const result = await query("SELECT * FROM colores_disenio WHERE estado = 0 ORDER BY nombre");
    return result.rows;
  },

  getColoresLuz: async () => {
    const result = await query("SELECT * FROM colores_luz WHERE estado = 0 ORDER BY nombre");
    return result.rows;
  },

  getWatts: async () => {
    const result = await query("SELECT * FROM watts WHERE estado = 0 ORDER BY nombre");
    return result.rows;
  },

  getTamanos: async () => {
    const result = await query("SELECT * FROM tamanos WHERE estado = 0 ORDER BY nombre");
    return result.rows;
  },

  // Obtener todos los productos
  getTodosProductos: async () => {
    const result = await query(`
      SELECT 
        p.*,
        u.nombre as ubicacion_nombre,
        u.idubicacion,
        ARRAY_AGG(DISTINCT c.nombre) as categorias,
        ARRAY_AGG(DISTINCT tp.nombre) as tipos
      FROM productos p
      LEFT JOIN ubicaciones u ON p.idubicacion = u.idubicacion
      LEFT JOIN producto_categorias pc ON p.idproducto = pc.idproducto
      LEFT JOIN categorias c ON pc.idcategoria = c.idcategoria
      LEFT JOIN producto_tipos pt ON p.idproducto = pt.idproducto
      LEFT JOIN tipos tp ON pt.idtipo = tp.idtipo
      WHERE p.estado = 0
      GROUP BY p.idproducto, u.nombre, u.idubicacion
      ORDER BY p.nombre
    `);

    // Obtener variantes para cada producto
    const productos = await Promise.all(
      result.rows.map(async (producto) => {
        const variantesResult = await query(`
          SELECT 
            v.*,
            cd.nombre as color_disenio,
            cl.nombre as color_luz,
            w.nombre as watt,
            tm.nombre as tamano
          FROM variantes v
          LEFT JOIN colores_disenio cd ON v.idcolor_disenio = cd.idcolor_disenio
          LEFT JOIN colores_luz cl ON v.idcolor_luz = cl.idcolor_luz
          LEFT JOIN watts w ON v.idwatt = w.idwatt
          LEFT JOIN tamanos tm ON v.idtamano = tm.idtamano
          WHERE v.idproducto = $1 AND v.estado = 0
          ORDER BY v.nombre_variante
        `, [producto.idproducto]);

        // Obtener imágenes para cada variante
        const variantes = await Promise.all(
          variantesResult.rows.map(async (variante) => {
            const imagenesResult = await query(
              "SELECT imagen FROM imagenes_variantes WHERE idvariante = $1",
              [variante.idvariante]
            );
            
            // Convertir BYTEA a base64
            const imagenes = imagenesResult.rows.map(img => {
              if (img.imagen) {
                const base64 = img.imagen.toString('base64');
                return `data:image/jpeg;base64,${base64}`;
              }
              return null;
            }).filter(img => img !== null);
            
            return {
              ...variante,
              imagenes
            };
          })
        );

        return {
          ...producto,
          ubicacion: producto.ubicacion_nombre,
          categorias: producto.categorias.filter(c => c !== null),
          tipos: producto.tipos.filter(t => t !== null),
          variantes
        };
      })
    );

    return productos;
  },

  // Buscar productos por término
  buscarProductos: async (termino) => {
    const result = await query(`
      SELECT 
        p.*,
        u.nombre as ubicacion_nombre,
        u.idubicacion,
        ARRAY_AGG(DISTINCT c.nombre) as categorias,
        ARRAY_AGG(DISTINCT tp.nombre) as tipos
      FROM productos p
      LEFT JOIN ubicaciones u ON p.idubicacion = u.idubicacion
      LEFT JOIN producto_categorias pc ON p.idproducto = pc.idproducto
      LEFT JOIN categorias c ON pc.idcategoria = c.idcategoria
      LEFT JOIN producto_tipos pt ON p.idproducto = pt.idproducto
      LEFT JOIN tipos tp ON pt.idtipo = tp.idtipo
      WHERE p.estado = 0 
        AND (p.nombre ILIKE $1 OR p.descripcion ILIKE $1 
             OR c.nombre ILIKE $1 OR tp.nombre ILIKE $1)
      GROUP BY p.idproducto, u.nombre, u.idubicacion
      ORDER BY p.nombre
    `, [`%${termino}%`]);

    // Obtener variantes para cada producto
    const productos = await Promise.all(
      result.rows.map(async (producto) => {
        const variantesResult = await query(`
          SELECT 
            v.*,
            cd.nombre as color_disenio,
            cl.nombre as color_luz,
            w.nombre as watt,
            tm.nombre as tamano
          FROM variantes v
          LEFT JOIN colores_disenio cd ON v.idcolor_disenio = cd.idcolor_disenio
          LEFT JOIN colores_luz cl ON v.idcolor_luz = cl.idcolor_luz
          LEFT JOIN watts w ON v.idwatt = w.idwatt
          LEFT JOIN tamanos tm ON v.idtamano = tm.idtamano
          WHERE v.idproducto = $1 AND v.estado = 0
          ORDER BY v.nombre_variante
        `, [producto.idproducto]);

        // Obtener imágenes para cada variante
        const variantes = await Promise.all(
          variantesResult.rows.map(async (variante) => {
            const imagenesResult = await query(
              "SELECT imagen FROM imagenes_variantes WHERE idvariante = $1",
              [variante.idvariante]
            );
            
            // Convertir BYTEA a base64
            const imagenes = imagenesResult.rows.map(img => {
              if (img.imagen) {
                const base64 = img.imagen.toString('base64');
                return `data:image/jpeg;base64,${base64}`;
              }
              return null;
            }).filter(img => img !== null);
            
            return {
              ...variante,
              imagenes
            };
          })
        );

        return {
          ...producto,
          ubicacion: producto.ubicacion_nombre,
          categorias: producto.categorias.filter(c => c !== null),
          tipos: producto.tipos.filter(t => t !== null),
          variantes
        };
      })
    );

    return productos;
  },

  getProductoById: async (id) => {
    const result = await query(`
      SELECT 
        p.*,
        u.nombre as ubicacion_nombre,
        u.idubicacion,
        ARRAY_AGG(DISTINCT c.nombre) as categorias,
        ARRAY_AGG(DISTINCT tp.nombre) as tipos
      FROM productos p
      LEFT JOIN ubicaciones u ON p.idubicacion = u.idubicacion
      LEFT JOIN producto_categorias pc ON p.idproducto = pc.idproducto
      LEFT JOIN categorias c ON pc.idcategoria = c.idcategoria
      LEFT JOIN producto_tipos pt ON p.idproducto = pt.idproducto
      LEFT JOIN tipos tp ON pt.idtipo = tp.idtipo
      WHERE p.idproducto = $1 AND p.estado = 0
      GROUP BY p.idproducto, u.nombre, u.idubicacion
    `, [id]);

    if (result.rows.length === 0) {
      throw new Error("Producto no encontrado");
    }

    const producto = result.rows[0];

    // Obtener variantes
    const variantesResult = await query(`
      SELECT 
        v.*,
        cd.nombre as color_disenio,
        cl.nombre as color_luz,
        w.nombre as watt,
        tm.nombre as tamano
      FROM variantes v
      LEFT JOIN colores_disenio cd ON v.idcolor_disenio = cd.idcolor_disenio
      LEFT JOIN colores_luz cl ON v.idcolor_luz = cl.idcolor_luz
      LEFT JOIN watts w ON v.idwatt = w.idwatt
      LEFT JOIN tamanos tm ON v.idtamano = tm.idtamano
      WHERE v.idproducto = $1 AND v.estado = 0
      ORDER BY v.nombre_variante
    `, [id]);

    // Obtener imágenes para cada variante
    const variantes = await Promise.all(
      variantesResult.rows.map(async (variante) => {
        const imagenesResult = await query(
          "SELECT imagen FROM imagenes_variantes WHERE idvariante = $1",
          [variante.idvariante]
        );
        
        // Convertir BYTEA a base64
        const imagenes = imagenesResult.rows.map(img => {
          if (img.imagen) {
            const base64 = img.imagen.toString('base64');
            return `data:image/jpeg;base64,${base64}`;
          }
          return null;
        }).filter(img => img !== null);
        
        return {
          ...variante,
          imagenes
        };
      })
    );

    return {
      ...producto,
      ubicacion: producto.ubicacion_nombre,
      categorias: producto.categorias.filter(c => c !== null),
      tipos: producto.tipos.filter(t => t !== null),
      variantes
    };
  },

  createProducto: async (productoData, files) => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Insertar producto principal
      const productoResult = await client.query(
        `INSERT INTO productos (nombre, descripcion, idubicacion, estado) 
         VALUES ($1, $2, $3, 0) RETURNING *`,
        [productoData.nombre, productoData.descripcion, productoData.idubicacion]
      );

      const producto = productoResult.rows[0];

      // Insertar relaciones de categorías
      if (productoData.categorias && productoData.categorias.length > 0) {
        for (const idcategoria of productoData.categorias) {
          await client.query(
            'INSERT INTO producto_categorias (idproducto, idcategoria) VALUES ($1, $2)',
            [producto.idproducto, idcategoria]
          );
        }
      }

      // Insertar relaciones de tipos
      if (productoData.tipos && productoData.tipos.length > 0) {
        for (const idtipo of productoData.tipos) {
          await client.query(
            'INSERT INTO producto_tipos (idproducto, idtipo) VALUES ($1, $2)',
            [producto.idproducto, idtipo]
          );
        }
      }

      // Insertar variantes
      if (productoData.variantes && productoData.variantes.length > 0) {
        for (const variante of productoData.variantes) {
          const varianteResult = await client.query(
            `INSERT INTO variantes (
              idproducto, nombre_variante, precio_venta, precio_compra, 
              idcolor_disenio, idcolor_luz, idwatt, idtamano, stock, stock_minimo, estado
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0) RETURNING *`,
            [
              producto.idproducto, variante.nombre_variante, variante.precio_venta, variante.precio_compra,
              variante.idcolor_disenio, variante.idcolor_luz, variante.idwatt, variante.idtamano,
              variante.stock, variante.stock_minimo
            ]
          );

          // Procesar imágenes si existen
          if (variante.imagenes && variante.imagenes.length > 0) {
            for (const imagen of variante.imagenes) {
              let imagenBuffer;
              if (imagen.buffer) {
                imagenBuffer = imagen.buffer;
              } else if (imagen.data) {
                imagenBuffer = Buffer.from(imagen.data);
              } else {
                imagenBuffer = Buffer.from(imagen);
              }
              
              await client.query(
                'INSERT INTO imagenes_variantes (idvariante, imagen) VALUES ($1, $2)',
                [varianteResult.rows[0].idvariante, imagenBuffer]
              );
            }
          }
        }
      }

      await client.query('COMMIT');
      
      // Devolver el producto creado con todas sus relaciones
      return await productsService.getProductoById(producto.idproducto);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  updateProducto: async (id, productoData, files) => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Verificar que el producto existe
      const productoExistente = await client.query(
        'SELECT * FROM productos WHERE idproducto = $1 AND estado = 0',
        [id]
      );

      if (productoExistente.rows.length === 0) {
        throw new Error("Producto no encontrado");
      }

      // Actualizar producto principal
      await client.query(
        `UPDATE productos SET nombre = $1, descripcion = $2, idubicacion = $3 
         WHERE idproducto = $4`,
        [productoData.nombre, productoData.descripcion, productoData.idubicacion, id]
      );

      // Actualizar categorías (eliminar existentes y insertar nuevas)
      await client.query('DELETE FROM producto_categorias WHERE idproducto = $1', [id]);
      if (productoData.categorias && productoData.categorias.length > 0) {
        for (const idcategoria of productoData.categorias) {
          await client.query(
            'INSERT INTO producto_categorias (idproducto, idcategoria) VALUES ($1, $2)',
            [id, idcategoria]
          );
        }
      }

      // Actualizar tipos
      await client.query('DELETE FROM producto_tipos WHERE idproducto = $1', [id]);
      if (productoData.tipos && productoData.tipos.length > 0) {
        for (const idtipo of productoData.tipos) {
          await client.query(
            'INSERT INTO producto_tipos (idproducto, idtipo) VALUES ($1, $2)',
            [id, idtipo]
          );
        }
      }

      // Manejar variantes - para simplificar, eliminamos las existentes y creamos nuevas
      await client.query('UPDATE variantes SET estado = 1 WHERE idproducto = $1', [id]);
      
      if (productoData.variantes && productoData.variantes.length > 0) {
        for (const variante of productoData.variantes) {
          const varianteResult = await client.query(
            `INSERT INTO variantes (
              idproducto, nombre_variante, precio_venta, precio_compra, 
              idcolor_disenio, idcolor_luz, idwatt, idtamano, stock, stock_minimo, estado
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0) RETURNING *`,
            [
              id, variante.nombre_variante, variante.precio_venta, variante.precio_compra,
              variante.idcolor_disenio, variante.idcolor_luz, variante.idwatt, variante.idtamano,
              variante.stock, variante.stock_minimo
            ]
          );

          // Procesar imágenes si existen
          if (variante.imagenes && variante.imagenes.length > 0) {
            for (const imagen of variante.imagenes) {
              let imagenBuffer;
              if (imagen.buffer) {
                imagenBuffer = imagen.buffer;
              } else if (imagen.data) {
                imagenBuffer = Buffer.from(imagen.data);
              } else {
                imagenBuffer = Buffer.from(imagen);
              }
              
              await client.query(
                'INSERT INTO imagenes_variantes (idvariante, imagen) VALUES ($1, $2)',
                [varianteResult.rows[0].idvariante, imagenBuffer]
              );
            }
          }
        }
      }

      await client.query('COMMIT');
      
      return await productsService.getProductoById(id);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  deleteProducto: async (id) => {
    // Soft delete - marcar como eliminado
    const result = await query(
      'UPDATE productos SET estado = 1 WHERE idproducto = $1',
      [id]
    );

    if (result.rowCount === 0) {
      throw new Error("Producto no encontrado");
    }
  },

  updateStockVariante: async (idvariante, cantidad) => {
    const result = await query(
      'UPDATE variantes SET stock = stock + $1 WHERE idvariante = $2 AND estado = 0 RETURNING *',
      [cantidad, idvariante]
    );

    if (result.rows.length === 0) {
      throw new Error("Variante no encontrada");
    }

    return result.rows[0];
  }
};

module.exports = productsService;