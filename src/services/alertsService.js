const { query } = require("../../db");

const getLowStockAlerts = async () => {
  try {
    const sql = `
      SELECT 
        p.idproducto,
        p.nombre,
        p.descripcion,
        u.idubicacion,
        u.nombre as nombre_ubicacion,
        v.idvariante,
        v.nombre_variante,
        v.precio_venta,
        v.precio_compra,
        cd.idcolor_disenio,
        cd.nombre as nombre_color_disenio,
        cl.idcolor_luz,
        cl.nombre as nombre_color_luz,
        w.idwatt,
        w.nombre as nombre_watt,
        t.idtamano,
        t.nombre as nombre_tamano,
        v.stock,
        v.stock_minimo,
        v.estado,
        ARRAY_AGG(
          CASE WHEN iv.imagen IS NOT NULL THEN 
            'data:image/jpeg;base64,' || ENCODE(iv.imagen, 'base64')
          ELSE NULL END
        ) as imagenes_base64
      FROM variantes v
      INNER JOIN productos p ON v.idproducto = p.idproducto
      INNER JOIN ubicaciones u ON p.idubicacion = u.idubicacion
      LEFT JOIN colores_disenio cd ON v.idcolor_disenio = cd.idcolor_disenio
      LEFT JOIN colores_luz cl ON v.idcolor_luz = cl.idcolor_luz
      LEFT JOIN watts w ON v.idwatt = w.idwatt
      LEFT JOIN tamanos t ON v.idtamano = t.idtamano
      LEFT JOIN imagenes_variantes iv ON v.idvariante = iv.idvariante
      WHERE v.stock <= v.stock_minimo 
        AND v.stock > 0 
        AND v.estado = 0 
        AND p.estado = 0
      GROUP BY 
        p.idproducto, p.nombre, p.descripcion,
        u.idubicacion, u.nombre,
        v.idvariante, v.nombre_variante, v.precio_venta, v.precio_compra,
        cd.idcolor_disenio, cd.nombre,
        cl.idcolor_luz, cl.nombre,
        w.idwatt, w.nombre,
        t.idtamano, t.nombre,
        v.stock, v.stock_minimo, v.estado
      ORDER BY p.nombre, v.stock ASC
    `;
    
    const result = await query(sql);
    
    // Agrupar por producto y luego por variante
    const productosMap = new Map();
    
    result.rows.forEach(row => {
      const productoKey = row.idproducto;
      const varianteKey = row.idvariante;
      
      if (!productosMap.has(productoKey)) {
        productosMap.set(productoKey, {
          idproducto: row.idproducto,
          nombre: row.nombre,
          descripcion: row.descripcion,
          idubicacion: row.idubicacion,
          nombre_ubicacion: row.nombre_ubicacion,
          variantes: []
        });
      }
      
      const producto = productosMap.get(productoKey);
      
      // Verificar si la variante ya existe
      const varianteExistente = producto.variantes.find(v => v.idvariante === varianteKey);
      
      if (!varianteExistente) {
        // Filtrar imágenes nulas y limitar a 10 imágenes
        const imagenes = row.imagenes_base64 
          ? row.imagenes_base64.filter(img => img !== null).slice(0, 10)
          : [];
        
        producto.variantes.push({
          idvariante: row.idvariante,
          nombre_variante: row.nombre_variante,
          precio_venta: row.precio_venta,
          precio_compra: row.precio_compra,
          color_disenio: row.nombre_color_disenio,
          color_luz: row.nombre_color_luz,
          watt: row.nombre_watt,
          tamano: row.nombre_tamano,
          stock: row.stock,
          stock_minimo: row.stock_minimo,
          estado: row.estado,
          imagenes: imagenes
        });
      }
    });
    
    return Array.from(productosMap.values());
  } catch (error) {
    console.error("Error en getLowStockAlerts service:", error);
    throw error;
  }
};

const getCriticalStockAlerts = async () => {
  try {
    const sql = `
      SELECT 
        p.idproducto,
        p.nombre,
        p.descripcion,
        u.idubicacion,
        u.nombre as nombre_ubicacion,
        v.idvariante,
        v.nombre_variante,
        v.precio_venta,
        v.precio_compra,
        cd.idcolor_disenio,
        cd.nombre as nombre_color_disenio,
        cl.idcolor_luz,
        cl.nombre as nombre_color_luz,
        w.idwatt,
        w.nombre as nombre_watt,
        t.idtamano,
        t.nombre as nombre_tamano,
        v.stock,
        v.stock_minimo,
        v.estado,
        ARRAY_AGG(
          CASE WHEN iv.imagen IS NOT NULL THEN 
            'data:image/jpeg;base64,' || ENCODE(iv.imagen, 'base64')
          ELSE NULL END
        ) as imagenes_base64
      FROM variantes v
      INNER JOIN productos p ON v.idproducto = p.idproducto
      INNER JOIN ubicaciones u ON p.idubicacion = u.idubicacion
      LEFT JOIN colores_disenio cd ON v.idcolor_disenio = cd.idcolor_disenio
      LEFT JOIN colores_luz cl ON v.idcolor_luz = cl.idcolor_luz
      LEFT JOIN watts w ON v.idwatt = w.idwatt
      LEFT JOIN tamanos t ON v.idtamano = t.idtamano
      LEFT JOIN imagenes_variantes iv ON v.idvariante = iv.idvariante
      WHERE v.stock = 0 
        AND v.estado = 0 
        AND p.estado = 0
      GROUP BY 
        p.idproducto, p.nombre, p.descripcion,
        u.idubicacion, u.nombre,
        v.idvariante, v.nombre_variante, v.precio_venta, v.precio_compra,
        cd.idcolor_disenio, cd.nombre,
        cl.idcolor_luz, cl.nombre,
        w.idwatt, w.nombre,
        t.idtamano, t.nombre,
        v.stock, v.stock_minimo, v.estado
      ORDER BY p.nombre, v.stock ASC
    `;
    
    const result = await query(sql);
    
    // Agrupar por producto y luego por variante
    const productosMap = new Map();
    
    result.rows.forEach(row => {
      const productoKey = row.idproducto;
      const varianteKey = row.idvariante;
      
      if (!productosMap.has(productoKey)) {
        productosMap.set(productoKey, {
          idproducto: row.idproducto,
          nombre: row.nombre,
          descripcion: row.descripcion,
          idubicacion: row.idubicacion,
          nombre_ubicacion: row.nombre_ubicacion,
          variantes: []
        });
      }
      
      const producto = productosMap.get(productoKey);
      
      // Verificar si la variante ya existe
      const varianteExistente = producto.variantes.find(v => v.idvariante === varianteKey);
      
      if (!varianteExistente) {
        // Filtrar imágenes nulas y limitar a 10 imágenes
        const imagenes = row.imagenes_base64 
          ? row.imagenes_base64.filter(img => img !== null).slice(0, 10)
          : [];
        
        producto.variantes.push({
          idvariante: row.idvariante,
          nombre_variante: row.nombre_variante,
          precio_venta: row.precio_venta,
          precio_compra: row.precio_compra,
          color_disenio: row.nombre_color_disenio,
          color_luz: row.nombre_color_luz,
          watt: row.nombre_watt,
          tamano: row.nombre_tamano,
          stock: row.stock,
          stock_minimo: row.stock_minimo,
          estado: row.estado,
          imagenes: imagenes
        });
      }
    });
    
    return Array.from(productosMap.values());
  } catch (error) {
    console.error("Error en getCriticalStockAlerts service:", error);
    throw error;
  }
};

module.exports = {
  getLowStockAlerts,
  getCriticalStockAlerts
};