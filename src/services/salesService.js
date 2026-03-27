const { query, pool } = require("../../db");

const searchProducts = async (searchQuery) => {
  if (!searchQuery || searchQuery.trim() === "") {
    return [];
  }

  // Consulta optimizada: Una sola consulta con JOINS - CORREGIDO
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
            'idcolor_disenio', v.idcolor_disenio,
            'idcolor_luz', v.idcolor_luz,
            'idwatt', v.idwatt,
            'idtamano', v.idtamano,
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
      AND v.stock > 0
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
  try {
    const productsResult = await query(productsSql, [searchTerm]);
    return productsResult.rows;
  } catch (error) {
    console.error("Error in searchProducts SQL query:", error);
    throw error;
  }
};

const getCurrentCashStatus = async () => {
  const sql = `
    SELECT ec.*, u.usuario
    FROM estado_caja ec
    INNER JOIN usuarios u ON ec.idusuario = u.idusuario
    ORDER BY ec.idestado_caja DESC
    LIMIT 1
  `;

  const result = await query(sql);
  
  if (result.rows.length === 0) {
    throw new Error("No hay registro de caja");
  }

  return result.rows[0];
};

const processSale = async (saleData, userId) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    if (saleData.metodo_pago === 'Efectivo') {
      const cashStatusCheck = await client.query(
        'SELECT * FROM estado_caja ORDER BY idestado_caja DESC LIMIT 1'
      );
      
      if (cashStatusCheck.rows.length === 0 || cashStatusCheck.rows[0].estado === 'cerrada') {
        throw new Error('La caja está cerrada. No se puede procesar la venta en efectivo.');
      }
    }

    const userCheck = await client.query(
      'SELECT idusuario FROM usuarios WHERE idusuario = $1 AND estado = 0',
      [userId]
    );
    
    if (userCheck.rows.length === 0) {
      throw new Error('Usuario no válido o inactivo');
    }

    for (const item of saleData.items) {
      const stockCheck = await client.query(
        'SELECT stock FROM variantes WHERE idvariante = $1 AND estado = 0',
        [item.idvariante]
      );
      
      if (stockCheck.rows.length === 0) {
        throw new Error(`La variante ${item.idvariante} no existe o está inactiva`);
      }
      
      if (stockCheck.rows[0].stock < item.cantidad) {
        const variantInfo = await client.query(
          'SELECT p.nombre, v.nombre_variante FROM variantes v INNER JOIN productos p ON v.idproducto = p.idproducto WHERE v.idvariante = $1',
          [item.idvariante]
        );
        const productName = variantInfo.rows[0]?.nombre || 'Producto';
        const variantName = variantInfo.rows[0]?.nombre_variante || '';
        throw new Error(`Stock insuficiente para ${productName} ${variantName}. Stock disponible: ${stockCheck.rows[0].stock}`);
      }
    }

    const saleResult = await client.query(
      `INSERT INTO ventas (fecha_hora, idusuario, descripcion, sub_total, descuento, total, metodo_pago) 
       VALUES (TIMEZONE('America/La_Paz', NOW()), $1, $2, $3, $4, $5, $6) 
       RETURNING idventa`,
      [userId, saleData.descripcion, saleData.sub_total, saleData.descuento, saleData.total, saleData.metodo_pago]
    );
    
    const saleId = saleResult.rows[0].idventa;

    for (const item of saleData.items) {
      await client.query(
        `INSERT INTO detalle_ventas (idventa, idvariante, cantidad, precio_unitario, subtotal_linea) 
         VALUES ($1, $2, $3, $4, $5)`,
        [saleId, item.idvariante, item.cantidad, item.precio_unitario, item.subtotal_linea]
      );

      await client.query(
        'UPDATE variantes SET stock = stock - $1 WHERE idvariante = $2',
        [item.cantidad, item.idvariante]
      );
    }

    if (saleData.metodo_pago === 'Efectivo') {
      const lastMontoFinalResult = await client.query(
        'SELECT monto_final FROM estado_caja ORDER BY idestado_caja DESC LIMIT 1'
      );
      const lastMontoFinal = lastMontoFinalResult.rows[0]?.monto_final || 0;

      const nuevoMontoFinal = parseFloat(lastMontoFinal) + parseFloat(saleData.total);
      
      const newCashStatusResult = await client.query(
        `INSERT INTO estado_caja (estado, monto_inicial, monto_final, idusuario) 
         VALUES ('abierta', $1, $2, $3) 
         RETURNING idestado_caja`,
        [lastMontoFinal, nuevoMontoFinal, userId]
      );
      
      const newCashStatusId = newCashStatusResult.rows[0].idestado_caja;

      await client.query(
        `INSERT INTO transacciones_caja (idestado_caja, tipo_movimiento, descripcion, monto, fecha, idusuario, idventa) 
         VALUES ($1, 'Ingreso', $2, $3, TIMEZONE('America/La_Paz', NOW()), $4, $5)`,
        [newCashStatusId, `Venta: ${saleData.descripcion}`, saleData.total, userId, saleId]
      );
    }

    await client.query('COMMIT');
    
    return { idventa: saleId };
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  searchProducts,
  getCurrentCashStatus,
  processSale
};