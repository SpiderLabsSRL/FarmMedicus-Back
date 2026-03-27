const { query, pool } = require("../../db");

const cotizacionesService = {
  // Obtener productos con variantes e imágenes - OPTIMIZADO
  getProductosConVariantes: async () => {
    try {
      const sql = `
        SELECT 
          p.idproducto,
          p.nombre as nombre_producto,
          p.descripcion as producto_descripcion,
          p.estado as producto_estado,
          u.nombre as nombre_ubicacion,
          COALESCE(
            json_agg(
              json_build_object(
                'idvariante', v.idvariante,
                'nombre_variante', v.nombre_variante,
                'precio_venta', v.precio_venta,
                'precio_compra', v.precio_compra,
                'stock', v.stock,
                'stock_minimo', v.stock_minimo,
                'estado', v.estado,
                'color_disenio', COALESCE(NULLIF(cd.nombre, ''), ''),
                'color_luz', COALESCE(NULLIF(cl.nombre, ''), ''),
                'watt', COALESCE(NULLIF(w.nombre, ''), ''),
                'tamano', COALESCE(NULLIF(t.nombre, ''), ''),
                'imagenes', (
                  SELECT COALESCE(array_agg(encode(iv.imagen, 'base64')), ARRAY[]::text[])
                  FROM imagenes_variantes iv
                  WHERE iv.idvariante = v.idvariante
                )
              ) ORDER BY v.nombre_variante
            ) FILTER (WHERE v.idvariante IS NOT NULL),
            '[]'::json
          ) as variantes
        FROM productos p
        LEFT JOIN ubicaciones u ON p.idubicacion = u.idubicacion
        LEFT JOIN variantes v ON p.idproducto = v.idproducto AND v.estado = 0
        LEFT JOIN colores_disenio cd ON v.idcolor_disenio = cd.idcolor_disenio
        LEFT JOIN colores_luz cl ON v.idcolor_luz = cl.idcolor_luz
        LEFT JOIN watts w ON v.idwatt = w.idwatt
        LEFT JOIN tamanos t ON v.idtamano = t.idtamano
        WHERE p.estado = 0
        GROUP BY 
          p.idproducto,
          p.nombre,
          p.descripcion,
          p.estado,
          p.idubicacion,
          u.nombre
        ORDER BY p.nombre, p.idproducto;
      `;
      
      const result = await query(sql);
      
      // Mapear resultados
      return result.rows.map(row => ({
        idproducto: row.idproducto,
        nombre: row.nombre_producto,
        descripcion: row.producto_descripcion,
        estado: row.producto_estado,
        nombre_ubicacion: row.nombre_ubicacion,
        variantes: row.variantes.map(v => ({
          idvariante: v.idvariante,
          idproducto: row.idproducto,
          nombre_variante: v.nombre_variante,
          precio_venta: parseFloat(v.precio_venta),
          precio_compra: parseFloat(v.precio_compra),
          stock: v.stock,
          stock_minimo: v.stock_minimo,
          estado: v.estado,
          color_disenio: v.color_disenio || '',
          color_luz: v.color_luz || '',
          watt: v.watt || '',
          tamano: v.tamano || '',
          imagenes: v.imagenes ? v.imagenes.map(img => `data:image/jpeg;base64,${img}`) : []
        }))
      }));
      
    } catch (error) {
      console.error("Error en getProductosConVariantes:", error);
      throw error;
    }
  },

  // Buscar productos - OPTIMIZADO (igual que en ventas)
  searchProductos: async (searchQuery) => {
    try {
      if (!searchQuery || searchQuery.trim() === "") {
        return [];
      }

      // Consulta optimizada: Una sola consulta con JOINS
      const productsSql = `
        SELECT 
          p.idproducto,
          p.nombre,
          p.descripcion,
          p.estado,
          p.idubicacion,
          u.nombre as nombre_ubicacion,
          COALESCE(
            json_agg(
              json_build_object(
                'idvariante', v.idvariante,
                'idproducto', v.idproducto,
                'nombre_variante', v.nombre_variante,
                'precio_venta', v.precio_venta,
                'precio_compra', v.precio_compra,
                'stock', v.stock,
                'stock_minimo', v.stock_minimo,
                'estado', v.estado,
                'color_disenio', cd.nombre,
                'color_luz', cl.nombre,
                'watt', w.nombre,
                'tamano', t.nombre,
                'imagenes', (
                  SELECT COALESCE(array_agg(encode(iv.imagen, 'base64')), ARRAY[]::text[])
                  FROM imagenes_variantes iv
                  WHERE iv.idvariante = v.idvariante
                )
              ) ORDER BY v.nombre_variante
            ) FILTER (WHERE v.idvariante IS NOT NULL),
            '[]'::json
          ) as variantes
        FROM productos p
        LEFT JOIN ubicaciones u ON p.idubicacion = u.idubicacion
        LEFT JOIN variantes v ON p.idproducto = v.idproducto 
          AND v.estado = 0
        LEFT JOIN colores_disenio cd ON v.idcolor_disenio = cd.idcolor_disenio
        LEFT JOIN colores_luz cl ON v.idcolor_luz = cl.idcolor_luz
        LEFT JOIN watts w ON v.idwatt = w.idwatt
        LEFT JOIN tamanos t ON v.idtamano = t.idtamano
        WHERE p.estado = 0 
          AND (p.nombre ILIKE $1 OR p.descripcion ILIKE $1)
        GROUP BY 
          p.idproducto,
          p.nombre,
          p.descripcion,
          p.estado,
          p.idubicacion,
          u.nombre
        ORDER BY p.nombre
        LIMIT 10;
      `;

      const searchTerm = `%${searchQuery}%`;
      const productsResult = await query(productsSql, [searchTerm]);
      
      return productsResult.rows.map(row => ({
        idproducto: row.idproducto,
        nombre: row.nombre,
        descripcion: row.descripcion,
        estado: row.estado,
        idubicacion: row.idubicacion,
        nombre_ubicacion: row.nombre_ubicacion,
        variantes: row.variantes.map(v => ({
          idvariante: v.idvariante,
          idproducto: v.idproducto,
          nombre_variante: v.nombre_variante,
          precio_venta: parseFloat(v.precio_venta),
          precio_compra: parseFloat(v.precio_compra),
          stock: v.stock,
          stock_minimo: v.stock_minimo,
          estado: v.estado,
          color_disenio: v.color_disenio || '',
          color_luz: v.color_luz || '',
          watt: v.watt || '',
          tamano: v.tamano || '',
          imagenes: v.imagenes ? v.imagenes.map(img => `data:image/jpeg;base64,${img}`) : []
        }))
      }));
    } catch (error) {
      console.error("Error en searchProductos:", error);
      throw error;
    }
  },

  // El resto de métodos se mantienen igual...
  createCotizacion: async (cotizacionData) => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const usuarioSql = 'SELECT idusuario FROM usuarios WHERE estado = 0 LIMIT 1';
      const usuarioResult = await client.query(usuarioSql);
      
      if (usuarioResult.rows.length === 0) {
        throw new Error("No se encontró usuario activo");
      }
      
      const idusuario = usuarioResult.rows[0].idusuario;
      
      const insertCotizacionSql = `
        INSERT INTO cotizaciones (
          vigencia, cliente_nombre, cliente_telefono, cliente_direccion,
          tipo_pago, sub_total, descuento, total, abono, saldo, idusuario
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;
      
      const cotizacionValues = [
        cotizacionData.vigencia,
        cotizacionData.cliente_nombre,
        cotizacionData.cliente_telefono || '',
        cotizacionData.cliente_direccion || '',
        cotizacionData.tipo_pago,
        cotizacionData.sub_total,
        cotizacionData.descuento || 0,
        cotizacionData.total,
        cotizacionData.abono || 0,
        cotizacionData.saldo || 0,
        idusuario
      ];
      
      const cotizacionResult = await client.query(insertCotizacionSql, cotizacionValues);
      const nuevaCotizacion = cotizacionResult.rows[0];
      
      for (let item of cotizacionData.items) {
        const insertDetalleSql = `
          INSERT INTO detalle_cotizaciones (
            idcotizacion, idvariante, cantidad, precio_unitario, subtotal_linea
          ) VALUES ($1, $2, $3, $4, $5)
        `;
        
        await client.query(insertDetalleSql, [
          nuevaCotizacion.idcotizacion,
          item.idvariante,
          item.cantidad,
          item.precio_unitario,
          item.subtotal_linea
        ]);
        
        const insertPendienteSql = `
          INSERT INTO productos_pendientes_cotizacion (
            idcotizacion, idvariante, cantidad_pendiente
          ) VALUES ($1, $2, $3)
        `;
        
        await client.query(insertPendienteSql, [
          nuevaCotizacion.idcotizacion,
          item.idvariante,
          item.cantidad
        ]);
      }
      
      await client.query('COMMIT');
      return nuevaCotizacion;
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error("Error en createCotizacion:", error);
      throw error;
    } finally {
      client.release();
    }
  },

  getCotizaciones: async () => {
    try {
      const sql = `
        SELECT 
          c.*,
          u.nombres as usuario_nombre,
          u.apellidos as usuario_apellido
        FROM cotizaciones c
        LEFT JOIN usuarios u ON c.idusuario = u.idusuario
        WHERE c.estado = 0
        ORDER BY c.fecha_creacion DESC, c.idcotizacion DESC
      `;
      
      const result = await query(sql);
      return result.rows;
    } catch (error) {
      console.error("Error en getCotizaciones:", error);
      throw error;
    }
  },

  getCotizacionById: async (id) => {
    try {
      const cotizacionSql = `
        SELECT 
          c.*,
          u.nombres as usuario_nombre,
          u.apellidos as usuario_apellido
        FROM cotizaciones c
        LEFT JOIN usuarios u ON c.idusuario = u.idusuario
        WHERE c.idcotizacion = $1 AND c.estado = 0
      `;
      
      const cotizacionResult = await query(cotizacionSql, [id]);
      
      if (cotizacionResult.rows.length === 0) {
        return null;
      }
      
      const detallesSql = `
        SELECT 
          dc.*,
          v.nombre_variante,
          p.nombre as producto_nombre,
          cd.nombre as color_disenio
        FROM detalle_cotizaciones dc
        JOIN variantes v ON dc.idvariante = v.idvariante
        JOIN productos p ON v.idproducto = p.idproducto
        LEFT JOIN colores_disenio cd ON v.idcolor_disenio = cd.idcolor_disenio
        WHERE dc.idcotizacion = $1
      `;
      
      const detallesResult = await query(detallesSql, [id]);
      
      return {
        cotizacion: cotizacionResult.rows[0],
        detalles: detallesResult.rows
      };
    } catch (error) {
      console.error("Error en getCotizacionById:", error);
      throw error;
    }
  },

  updateCotizacion: async (id, updateData) => {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;
      
      for (const [key, value] of Object.entries(updateData)) {
        if (key !== 'items' && value !== undefined) {
          fields.push(`${key} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      }
      
      if (fields.length === 0) {
        throw new Error("No hay campos para actualizar");
      }
      
      values.push(id);
      
      const updateSql = `
        UPDATE cotizaciones 
        SET ${fields.join(', ')} 
        WHERE idcotizacion = $${paramCount} AND estado = 0
        RETURNING *
      `;
      
      const result = await query(updateSql, values);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error("Error en updateCotizacion:", error);
      throw error;
    }
  },

  deleteCotizacion: async (id) => {
    try {
      const sql = `
        UPDATE cotizaciones 
        SET estado = 1 
        WHERE idcotizacion = $1
      `;
      
      await query(sql, [id]);
    } catch (error) {
      console.error("Error en deleteCotizacion:", error);
      throw error;
    }
  },

  searchCotizaciones: async (searchQuery) => {
    try {
      console.log("🔍 Buscando cotizaciones con query:", searchQuery);
      
      if (!searchQuery || searchQuery.trim() === "") {
        return [];
      }

      const searchTerm = `%${searchQuery}%`;
      
      const sql = `
        SELECT 
          c.*,
          u.nombres as usuario_nombre,
          u.apellidos as usuario_apellido
        FROM cotizaciones c
        LEFT JOIN usuarios u ON c.idusuario = u.idusuario
        WHERE c.estado = 0 
          AND (
            c.cliente_nombre ILIKE $1 OR 
            c.cliente_telefono ILIKE $1 OR
            c.idcotizacion::TEXT ILIKE $1
          )
        ORDER BY c.fecha_creacion DESC, c.idcotizacion DESC
        LIMIT 20
      `;
      
      const result = await query(sql, [searchTerm]);
      console.log(`✅ Encontradas ${result.rows.length} cotizaciones`);
      return result.rows;
      
    } catch (error) {
      console.error("❌ Error en searchCotizaciones service:", error);
      return [];
    }
  },
};

module.exports = cotizacionesService;