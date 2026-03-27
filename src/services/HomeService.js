const { query } = require("../../db");

class HomeService {
  async getProducts(filters = {}) {
    try {
      console.log("getProducts service called with filters:", filters);
      
      let sql = `
        SELECT 
          p.idproducto,
          p.nombre,
          p.descripcion,
          p.estado,
          ARRAY_AGG(DISTINCT c.nombre) as categorias,
          ARRAY_AGG(DISTINCT t.nombre) as tipos,
          JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
              'idvariante', v.idvariante,
              'nombre_variante', v.nombre_variante,
              'precio_venta', v.precio_venta,
              'precio_compra', v.precio_compra,
              'stock', v.stock,
              'stock_minimo', v.stock_minimo,
              'estado', v.estado,
              'color_disenio', cd.nombre,
              'color_luz', cl.nombre,
              'watt', w.nombre,
              'tamano', tam.nombre,
              'imagenes', (
                SELECT COALESCE(
                  ARRAY_AGG(DISTINCT encode(iv2.imagen, 'base64')) FILTER (WHERE iv2.imagen IS NOT NULL),
                  ARRAY[]::text[]
                )
                FROM imagenes_variantes iv2 
                WHERE iv2.idvariante = v.idvariante
              )
            )
          ) as variantes
        FROM productos p
        LEFT JOIN producto_categorias pc ON p.idproducto = pc.idproducto
        LEFT JOIN categorias c ON pc.idcategoria = c.idcategoria
        LEFT JOIN producto_tipos pt ON p.idproducto = pt.idproducto
        LEFT JOIN tipos t ON pt.idtipo = t.idtipo
        LEFT JOIN variantes v ON p.idproducto = v.idproducto
        LEFT JOIN colores_disenio cd ON v.idcolor_disenio = cd.idcolor_disenio
        LEFT JOIN colores_luz cl ON v.idcolor_luz = cl.idcolor_luz
        LEFT JOIN watts w ON v.idwatt = w.idwatt
        LEFT JOIN tamanos tam ON v.idtamano = tam.idtamano
        LEFT JOIN imagenes_variantes iv ON v.idvariante = iv.idvariante
        WHERE p.estado = 0 AND v.estado = 0
      `;

      const conditions = [];
      const params = [];

      if (filters.categoria) {
        conditions.push(`c.nombre = $${params.length + 1}`);
        params.push(filters.categoria);
      }

      if (filters.color) {
        conditions.push(`(cd.nombre = $${params.length + 1} OR cl.nombre = $${params.length + 1})`);
        params.push(filters.color);
      }

      if (filters.tamano) {
        conditions.push(`tam.nombre = $${params.length + 1}`);
        params.push(filters.tamano);
      }

      if (filters.tipo) {
        conditions.push(`t.nombre = $${params.length + 1}`);
        params.push(filters.tipo);
      }

      if (conditions.length > 0) {
        sql += ` AND (${conditions.join(' AND ')})`;
      }

      sql += `
        GROUP BY p.idproducto, p.nombre, p.descripcion, p.estado
        ORDER BY p.nombre
      `;

      console.log("Executing SQL:", sql);
      console.log("With params:", params);

      const result = await query(sql, params);
      console.log(`Found ${result.rows.length} products`);
      return result.rows;
    } catch (error) {
      console.error("Error in getProducts service:", error);
      throw error;
    }
  }

  async searchProducts(searchQuery) {
    try {
      console.log("searchProducts service called with query:", searchQuery);
      
      const sql = `
        SELECT 
          p.idproducto,
          p.nombre,
          p.descripcion,
          p.estado,
          ARRAY_AGG(DISTINCT c.nombre) as categorias,
          ARRAY_AGG(DISTINCT t.nombre) as tipos,
          JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
              'idvariante', v.idvariante,
              'nombre_variante', v.nombre_variante,
              'precio_venta', v.precio_venta,
              'precio_compra', v.precio_compra,
              'stock', v.stock,
              'stock_minimo', v.stock_minimo,
              'estado', v.estado,
              'color_disenio', cd.nombre,
              'color_luz', cl.nombre,
              'watt', w.nombre,
              'tamano', tam.nombre,
              'imagenes', (
                SELECT COALESCE(
                  ARRAY_AGG(DISTINCT encode(iv2.imagen, 'base64')) FILTER (WHERE iv2.imagen IS NOT NULL),
                  ARRAY[]::text[]
                )
                FROM imagenes_variantes iv2 
                WHERE iv2.idvariante = v.idvariante
              )
            )
          ) as variantes
        FROM productos p
        LEFT JOIN producto_categorias pc ON p.idproducto = pc.idproducto
        LEFT JOIN categorias c ON pc.idcategoria = c.idcategoria
        LEFT JOIN producto_tipos pt ON p.idproducto = pt.idproducto
        LEFT JOIN tipos t ON pt.idtipo = t.idtipo
        LEFT JOIN variantes v ON p.idproducto = v.idproducto
        LEFT JOIN colores_disenio cd ON v.idcolor_disenio = cd.idcolor_disenio
        LEFT JOIN colores_luz cl ON v.idcolor_luz = cl.idcolor_luz
        LEFT JOIN watts w ON v.idwatt = w.idwatt
        LEFT JOIN tamanos tam ON v.idtamano = tam.idtamano
        LEFT JOIN imagenes_variantes iv ON v.idvariante = iv.idvariante
        WHERE p.estado = 0 
          AND v.estado = 0
          AND (
            p.nombre ILIKE $1 
            OR p.descripcion ILIKE $1 
            OR c.nombre ILIKE $1
            OR t.nombre ILIKE $1
            OR v.nombre_variante ILIKE $1
            OR cd.nombre ILIKE $1
            OR cl.nombre ILIKE $1
          )
        GROUP BY p.idproducto, p.nombre, p.descripcion, p.estado
        ORDER BY 
          CASE 
            WHEN p.nombre ILIKE $1 THEN 1
            WHEN p.descripcion ILIKE $1 THEN 2
            ELSE 3
          END,
          p.nombre
      `;

      const result = await query(sql, [`%${searchQuery}%`]);
      console.log(`Found ${result.rows.length} search results`);
      return result.rows;
    } catch (error) {
      console.error("Error in searchProducts service:", error);
      throw error;
    }
  }

  async getCategories() {
    try {
      console.log("getCategories service called");
      const sql = `
        SELECT DISTINCT nombre 
        FROM categorias 
        WHERE estado = 0 
        ORDER BY nombre
      `;
      const result = await query(sql);
      console.log(`Found ${result.rows.length} categories`);
      return result.rows.map(row => row.nombre);
    } catch (error) {
      console.error("Error in getCategories service:", error);
      throw error;
    }
  }

  async getColors() {
    try {
      console.log("getColors service called");
      const sql = `
        SELECT DISTINCT nombre 
        FROM colores_disenio 
        WHERE estado = 0 
        UNION
        SELECT DISTINCT nombre 
        FROM colores_luz 
        WHERE estado = 0 
        ORDER BY nombre
      `;
      const result = await query(sql);
      console.log(`Found ${result.rows.length} colors`);
      return result.rows.map(row => row.nombre);
    } catch (error) {
      console.error("Error in getColors service:", error);
      throw error;
    }
  }

  async getSizes() {
    try {
      console.log("getSizes service called");
      const sql = `
        SELECT DISTINCT nombre 
        FROM tamanos 
        WHERE estado = 0 
        ORDER BY nombre
      `;
      const result = await query(sql);
      console.log(`Found ${result.rows.length} sizes`);
      return result.rows.map(row => row.nombre);
    } catch (error) {
      console.error("Error in getSizes service:", error);
      throw error;
    }
  }

  async getTypes() {
    try {
      console.log("getTypes service called");
      const sql = `
        SELECT DISTINCT nombre 
        FROM tipos 
        WHERE estado = 0 
        ORDER BY nombre
      `;
      const result = await query(sql);
      console.log(`Found ${result.rows.length} types`);
      return result.rows.map(row => row.nombre);
    } catch (error) {
      console.error("Error in getTypes service:", error);
      throw error;
    }
  }

  async getCarruseles() {
    try {
      console.log("getCarruseles service called");
      
      // Primero obtener los carruseles activos
      const carruselesSql = `
        SELECT 
          c.idcarrusel,
          c.nombre,
          c.estado
        FROM carruseles c
        WHERE c.estado = 0
        ORDER BY c.idcarrusel
      `;
      
      const carruselesResult = await query(carruselesSql);
      console.log(`Found ${carruselesResult.rows.length} carruseles`);
      
      const carruseles = [];
      
      // Para cada carrusel, obtener sus productos completos con todas sus variantes
      for (const carrusel of carruselesResult.rows) {
        const productosSql = `
          SELECT 
            p.idproducto,
            p.nombre,
            p.descripcion,
            p.estado,
            ARRAY_AGG(DISTINCT cat.nombre) as categorias,
            ARRAY_AGG(DISTINCT tip.nombre) as tipos,
            JSON_AGG(
              DISTINCT JSONB_BUILD_OBJECT(
                'idvariante', v.idvariante,
                'nombre_variante', v.nombre_variante,
                'precio_venta', v.precio_venta,
                'precio_compra', v.precio_compra,
                'stock', v.stock,
                'stock_minimo', v.stock_minimo,
                'estado', v.estado,
                'color_disenio', cd.nombre,
                'color_luz', cl.nombre,
                'watt', w.nombre,
                'tamano', tam.nombre,
                'imagenes', (
                  SELECT COALESCE(
                    ARRAY_AGG(DISTINCT encode(iv2.imagen, 'base64')) FILTER (WHERE iv2.imagen IS NOT NULL),
                    ARRAY[]::text[]
                  )
                  FROM imagenes_variantes iv2 
                  WHERE iv2.idvariante = v.idvariante
                )
              )
            ) as variantes
          FROM carrusel_variantes cv
          JOIN productos p ON cv.idproducto = p.idproducto
          LEFT JOIN producto_categorias pc ON p.idproducto = pc.idproducto
          LEFT JOIN categorias cat ON pc.idcategoria = cat.idcategoria
          LEFT JOIN producto_tipos pt ON p.idproducto = pt.idproducto
          LEFT JOIN tipos tip ON pt.idtipo = tip.idtipo
          LEFT JOIN variantes v ON p.idproducto = v.idproducto
          LEFT JOIN colores_disenio cd ON v.idcolor_disenio = cd.idcolor_disenio
          LEFT JOIN colores_luz cl ON v.idcolor_luz = cl.idcolor_luz
          LEFT JOIN watts w ON v.idwatt = w.idwatt
          LEFT JOIN tamanos tam ON v.idtamano = tam.idtamano
          LEFT JOIN imagenes_variantes iv ON v.idvariante = iv.idvariante
          WHERE cv.idcarrusel = $1 
            AND p.estado = 0 
            AND v.estado = 0
          GROUP BY p.idproducto, p.nombre, p.descripcion, p.estado
          ORDER BY p.nombre
        `;
        
        const productosResult = await query(productosSql, [carrusel.idcarrusel]);
        
        carruseles.push({
          id: carrusel.idcarrusel,
          nombre: carrusel.nombre,
          estado: carrusel.estado,
          productos: productosResult.rows
        });
      }
      
      return carruseles;
    } catch (error) {
      console.error("Error in getCarruseles service:", error);
      return [];
    }
  }
}

module.exports = new HomeService();