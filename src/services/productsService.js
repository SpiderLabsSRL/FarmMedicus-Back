// src/services/productsService.js
const { query, pool } = require("../../db");

const productsService = {
  // Obtener opciones de selección
  getUbicaciones: async () => {
    const result = await query(
      "SELECT * FROM ubicaciones WHERE estado = 0 ORDER BY nombre",
    );
    return result.rows;
  },

  getCategorias: async () => {
    const result = await query(
      "SELECT * FROM categorias WHERE estado = 0 ORDER BY nombre",
    );
    return result.rows;
  },

  // Obtener solo id y nombre para selects
  getTodosProductosSelect: async () => {
    const result = await query(`
      SELECT idproducto, nombre 
      FROM productos 
      WHERE estado = 0 
      ORDER BY nombre
    `);
    return result.rows;
  },

  getTodosProductos: async () => {
    const result = await query(`
      SELECT 
        p.idproducto,
        p.nombre,
        p.descripcion,
        p.idubicacion,
        u.nombre as ubicacion_nombre,
        p.estado,
        p.imagen,
        p.precio_venta,
        p.precio_compra,
        p.stock,
        p.stock_minimo,
        p.codigo_barras,
        ARRAY_AGG(DISTINCT c.nombre) as categorias
      FROM productos p
      LEFT JOIN ubicaciones u ON p.idubicacion = u.idubicacion
      LEFT JOIN producto_categorias pc ON p.idproducto = pc.idproducto
      LEFT JOIN categorias c ON pc.idcategoria = c.idcategoria
      WHERE p.estado = 0
      GROUP BY p.idproducto, u.nombre, u.idubicacion
      ORDER BY p.nombre
    `);

    const productos = await Promise.all(
      result.rows.map(async (producto) => {
        let imagenBase64 = "";
        if (producto.imagen) {
          try {
            const base64 = producto.imagen.toString("base64");
            imagenBase64 = `data:image/jpeg;base64,${base64}`;
          } catch (error) {
            console.error(
              `Error al convertir imagen del producto ${producto.idproducto}:`,
              error,
            );
            imagenBase64 = "";
          }
        }

        // Obtener productos similares
        const similaresResult = await query(
          `
          SELECT p.idproducto, p.nombre
          FROM productos_similares ps
          JOIN productos p ON ps.idproducto_similar = p.idproducto
          WHERE ps.idproducto = $1 AND p.estado = 0
        `,
          [producto.idproducto],
        );

        return {
          idproducto: producto.idproducto,
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          idubicacion: producto.idubicacion,
          ubicacion_nombre: producto.ubicacion_nombre,
          ubicacion: producto.ubicacion_nombre,
          categorias: producto.categorias?.filter((c) => c !== null) || [],
          estado: producto.estado,
          imagen: imagenBase64,
          precio_venta: producto.precio_venta,
          precio_compra: producto.precio_compra,
          stock: producto.stock,
          stock_minimo: producto.stock_minimo,
          codigo_barras: producto.codigo_barras,
          productos_similares: similaresResult.rows,
        };
      }),
    );

    return productos;
  },

  // Buscar productos por término
  buscarProductos: async (termino) => {
    const result = await query(
      `
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
             OR c.nombre ILIKE $1 OR tp.nombre ILIKE $1
             OR p.codigo_barras ILIKE $1)
      GROUP BY p.idproducto, u.nombre, u.idubicacion
      ORDER BY p.nombre
    `,
      [`%${termino}%`],
    );

    const productos = await Promise.all(
      result.rows.map(async (producto) => {
        let imagenBase64 = "";
        if (producto.imagen) {
          try {
            const base64 = producto.imagen.toString("base64");
            imagenBase64 = `data:image/jpeg;base64,${base64}`;
          } catch (error) {
            console.error(
              `Error al convertir imagen del producto ${producto.idproducto}:`,
              error,
            );
            imagenBase64 = "";
          }
        }

        // Obtener productos similares
        const similaresResult = await query(
          `
          SELECT p.idproducto, p.nombre
          FROM productos_similares ps
          JOIN productos p ON ps.idproducto_similar = p.idproducto
          WHERE ps.idproducto = $1 AND p.estado = 0
        `,
          [producto.idproducto],
        );

        return {
          idproducto: producto.idproducto,
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          idubicacion: producto.idubicacion,
          ubicacion_nombre: producto.ubicacion_nombre,
          ubicacion: producto.ubicacion_nombre,
          categorias: producto.categorias?.filter((c) => c !== null) || [],
          estado: producto.estado,
          imagen: imagenBase64,
          precio_venta: producto.precio_venta,
          precio_compra: producto.precio_compra,
          stock: producto.stock,
          stock_minimo: producto.stock_minimo,
          codigo_barras: producto.codigo_barras,
          productos_similares: similaresResult.rows,
        };
      }),
    );

    return productos;
  },

  getProductoById: async (id) => {
    const result = await query(
      `
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
    `,
      [id],
    );

    if (result.rows.length === 0) {
      throw new Error("Producto no encontrado");
    }

    const producto = result.rows[0];

    let imagenBase64 = "";
    if (producto.imagen) {
      try {
        const base64 = producto.imagen.toString("base64");
        imagenBase64 = `data:image/jpeg;base64,${base64}`;
      } catch (error) {
        console.error(
          `Error al convertir imagen del producto ${producto.idproducto}:`,
          error,
        );
        imagenBase64 = "";
      }
    }

    // Obtener productos similares
    const similaresResult = await query(
      `
      SELECT p.idproducto, p.nombre
      FROM productos_similares ps
      JOIN productos p ON ps.idproducto_similar = p.idproducto
      WHERE ps.idproducto = $1 AND p.estado = 0
    `,
      [id],
    );

    const productoProcesado = {
      idproducto: producto.idproducto,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      idubicacion: producto.idubicacion,
      ubicacion_nombre: producto.ubicacion_nombre,
      ubicacion: producto.ubicacion_nombre,
      categorias: producto.categorias?.filter((c) => c !== null) || [],
      estado: producto.estado,
      imagen: imagenBase64,
      precio_venta: producto.precio_venta,
      precio_compra: producto.precio_compra,
      stock: producto.stock,
      stock_minimo: producto.stock_minimo,
      codigo_barras: producto.codigo_barras,
      productos_similares: similaresResult.rows,
    };

    return productoProcesado;
  },

  createProducto: async (productoData, imagenFile) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      let imagenBuffer = null;
      if (imagenFile) {
        if (imagenFile.buffer) {
          imagenBuffer = imagenFile.buffer;
        } else if (imagenFile.data) {
          imagenBuffer = Buffer.from(imagenFile.data);
        } else {
          imagenBuffer = Buffer.from(imagenFile);
        }
      }

      const productoResult = await client.query(
        `INSERT INTO productos (
          nombre, descripcion, idubicacion, imagen, 
          precio_compra, precio_venta, stock, stock_minimo, codigo_barras, estado
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0) RETURNING *`,
        [
          productoData.nombre,
          productoData.descripcion,
          productoData.idubicacion,
          imagenBuffer,
          productoData.precio_compra,
          productoData.precio_venta,
          productoData.stock,
          productoData.stock_minimo || 0,
          productoData.codigo_barras || null,
        ],
      );

      const producto = productoResult.rows[0];

      if (productoData.categorias && productoData.categorias.length > 0) {
        for (const idcategoria of productoData.categorias) {
          await client.query(
            "INSERT INTO producto_categorias (idproducto, idcategoria) VALUES ($1, $2)",
            [producto.idproducto, idcategoria],
          );
        }
      }

      // Insertar productos similares
      if (
        productoData.productos_similares &&
        productoData.productos_similares.length > 0
      ) {
        for (const idSimilar of productoData.productos_similares) {
          if (idSimilar !== producto.idproducto) {
            await client.query(
              "INSERT INTO productos_similares (idproducto, idproducto_similar) VALUES ($1, $2)",
              [producto.idproducto, idSimilar],
            );
          }
        }
      }

      await client.query("COMMIT");

      return await productsService.getProductoById(producto.idproducto);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  updateProducto: async (id, productoData, imagenFile) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Verificar que el producto existe
      const productoExistente = await client.query(
        "SELECT * FROM productos WHERE idproducto = $1 AND estado = 0",
        [id],
      );

      if (productoExistente.rows.length === 0) {
        throw new Error("Producto no encontrado");
      }

      let imagenBuffer = null;
      if (imagenFile) {
        if (imagenFile.buffer) {
          imagenBuffer = imagenFile.buffer;
        } else if (imagenFile.data) {
          imagenBuffer = Buffer.from(imagenFile.data);
        } else {
          imagenBuffer = Buffer.from(imagenFile);
        }
      }

      // Construir la consulta de actualización
      let updateQuery = `
        UPDATE productos SET 
          nombre = $1, 
          descripcion = $2, 
          idubicacion = $3,
          precio_compra = $4, 
          precio_venta = $5, 
          stock = $6,
          stock_minimo = $7,
          codigo_barras = $8
      `;

      const queryParams = [
        productoData.nombre,
        productoData.descripcion,
        productoData.idubicacion,
        productoData.precio_compra,
        productoData.precio_venta,
        productoData.stock,
        productoData.stock_minimo || 0,
        productoData.codigo_barras || null,
      ];

      if (imagenBuffer) {
        updateQuery += `, imagen = $9 WHERE idproducto = $10`;
        queryParams.push(imagenBuffer, id);
      } else {
        updateQuery += ` WHERE idproducto = $9`;
        queryParams.push(id);
      }

      await client.query(updateQuery, queryParams);

      // Actualizar categorías (eliminar existentes y insertar nuevas)
      await client.query(
        "DELETE FROM producto_categorias WHERE idproducto = $1",
        [id],
      );
      if (productoData.categorias && productoData.categorias.length > 0) {
        for (const idcategoria of productoData.categorias) {
          await client.query(
            "INSERT INTO producto_categorias (idproducto, idcategoria) VALUES ($1, $2)",
            [id, idcategoria],
          );
        }
      }

      // Actualizar productos similares
      await client.query(
        "DELETE FROM productos_similares WHERE idproducto = $1",
        [id],
      );
      if (
        productoData.productos_similares &&
        productoData.productos_similares.length > 0
      ) {
        for (const idSimilar of productoData.productos_similares) {
          if (idSimilar !== id) {
            await client.query(
              "INSERT INTO productos_similares (idproducto, idproducto_similar) VALUES ($1, $2)",
              [id, idSimilar],
            );
          }
        }
      }

      await client.query("COMMIT");

      return await productsService.getProductoById(id);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  deleteProducto: async (id) => {
    // Soft delete - marcar como eliminado
    const result = await query(
      "UPDATE productos SET estado = 1 WHERE idproducto = $1",
      [id],
    );

    if (result.rowCount === 0) {
      throw new Error("Producto no encontrado");
    }
  },

  updateStockProducto: async (idproducto, cantidad) => {
    const result = await query(
      "UPDATE productos SET stock = stock + $1 WHERE idproducto = $2 AND estado = 0 RETURNING *",
      [cantidad, idproducto],
    );

    if (result.rows.length === 0) {
      throw new Error("Producto no encontrada");
    }

    return result.rows[0];
  },
};

module.exports = productsService;
