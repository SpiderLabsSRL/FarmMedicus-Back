const { pool } = require("../../db");

class FormularioProductoService {
    async createProducto(productoData, files) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            console.log("Insertando producto:", productoData.nombre);
            console.log("Descripción recibida:", productoData.descripcion);

            // 1. Insertar producto principal
            const productoQuery = `
                INSERT INTO productos (nombre, descripcion, idubicacion, estado) 
                VALUES ($1, $2, $3, 0) 
                RETURNING idproducto
            `;
            const productoResult = await client.query(productoQuery, [
                productoData.nombre,
                productoData.descripcion, // La descripción ya viene formateada del frontend
                productoData.idubicacion
            ]);
            
            const idproducto = productoResult.rows[0].idproducto;
            console.log("Producto creado con ID:", idproducto);

            // 2. Insertar relaciones categorías
            if (productoData.categorias && productoData.categorias.length > 0) {
                console.log("Insertando categorías:", productoData.categorias);
                for (const idcategoria of productoData.categorias) {
                    const categoriasQuery = `
                        INSERT INTO producto_categorias (idproducto, idcategoria) 
                        VALUES ($1, $2)
                    `;
                    await client.query(categoriasQuery, [idproducto, idcategoria]);
                }
            }

            // 3. Insertar relaciones tipos
            if (productoData.tipos && productoData.tipos.length > 0) {
                console.log("Insertando tipos:", productoData.tipos);
                for (const idtipo of productoData.tipos) {
                    const tiposQuery = `
                        INSERT INTO producto_tipos (idproducto, idtipo) 
                        VALUES ($1, $2)
                    `;
                    await client.query(tiposQuery, [idproducto, idtipo]);
                }
            }

            // 4. Insertar variantes
            const variantes = productoData.variantes || [];
            console.log("Insertando variantes:", variantes.length);
            
            for (let i = 0; i < variantes.length; i++) {
                const variante = variantes[i];
                console.log("Insertando variante:", variante.nombre_variante);
                
                const varianteQuery = `
                    INSERT INTO variantes (
                        idproducto, nombre_variante, precio_venta, precio_compra,
                        idcolor_disenio, idcolor_luz, idwatt, idtamano, stock, stock_minimo, estado
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0)
                    RETURNING idvariante
                `;
                
                const varianteResult = await client.query(varianteQuery, [
                    idproducto,
                    variante.nombre_variante,
                    variante.precio_venta,
                    variante.precio_compra,
                    variante.idcolor_disenio,
                    variante.idcolor_luz,
                    variante.idwatt,
                    variante.idtamano,
                    variante.stock,
                    variante.stock_minimo || 0
                ]);
                
                const idvariante = varianteResult.rows[0].idvariante;
                console.log("Variante creada con ID:", idvariante);

                // 5. Insertar imágenes de la variante
                const varianteImagenes = files.filter(img => 
                    img.fieldname && img.fieldname.includes(`variantes[${i}][imagenes]`)
                );
                
                console.log("Imágenes para variante:", varianteImagenes.length);
                
                for (const imagen of varianteImagenes) {
                    const imagenQuery = `
                        INSERT INTO imagenes_variantes (idvariante, imagen) 
                        VALUES ($1, $2)
                    `;
                    await client.query(imagenQuery, [idvariante, imagen.buffer]);
                }
            }

            await client.query('COMMIT');

            // Obtener el producto completo creado
            const productoCompleto = await this.getProductoById(idproducto);
            console.log("Producto creado exitosamente");
            return productoCompleto;

        } catch (error) {
            await client.query('ROLLBACK');
            console.error("Error en createProducto service:", error);
            throw error;
        } finally {
            client.release();
        }
    }

    async updateProducto(idproducto, productoData, files) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            console.log("Actualizando producto ID:", idproducto);
            console.log("Nueva descripción:", productoData.descripcion);

            // 1. Actualizar producto principal
            const productoQuery = `
                UPDATE productos 
                SET nombre = $1, descripcion = $2, idubicacion = $3 
                WHERE idproducto = $4 AND estado = 0
                RETURNING idproducto
            `;
            const productoResult = await client.query(productoQuery, [
                productoData.nombre,
                productoData.descripcion, // La descripción ya viene formateada del frontend
                productoData.idubicacion,
                idproducto
            ]);

            if (productoResult.rows.length === 0) {
                throw new Error("Producto no encontrado");
            }

            console.log("Producto principal actualizado");

            // ... resto del código de update se mantiene igual ...
            // 2. Actualizar categorías (eliminar existentes y insertar nuevas)
            await client.query('DELETE FROM producto_categorias WHERE idproducto = $1', [idproducto]);
            if (productoData.categorias && productoData.categorias.length > 0) {
                console.log("Actualizando categorías:", productoData.categorias);
                for (const idcategoria of productoData.categorias) {
                    await client.query(
                        'INSERT INTO producto_categorias (idproducto, idcategoria) VALUES ($1, $2)',
                        [idproducto, idcategoria]
                    );
                }
            }

            // 3. Actualizar tipos (eliminar existentes y insertar nuevas)
            await client.query('DELETE FROM producto_tipos WHERE idproducto = $1', [idproducto]);
            if (productoData.tipos && productoData.tipos.length > 0) {
                console.log("Actualizando tipos:", productoData.tipos);
                for (const idtipo of productoData.tipos) {
                    await client.query(
                        'INSERT INTO producto_tipos (idproducto, idtipo) VALUES ($1, $2)',
                        [idproducto, idtipo]
                    );
                }
            }

            // 4. Procesar variantes existentes y nuevas
            const variantes = productoData.variantes || [];
            console.log("Procesando variantes:", variantes.length);

            // Obtener variantes existentes para comparar
            const existingVariantes = await client.query(
                'SELECT idvariante FROM variantes WHERE idproducto = $1 AND estado = 0',
                [idproducto]
            );

            const existingVarianteIds = existingVariantes.rows.map(row => row.idvariante);
            const updatedVarianteIds = [];

            for (let i = 0; i < variantes.length; i++) {
                const variante = variantes[i];
                let idvariante;

                if (variante.idvariante && variante.idvariante > 0 && existingVarianteIds.includes(variante.idvariante)) {
                    // Actualizar variante existente
                    console.log("Actualizando variante existente:", variante.idvariante);
                    const varianteQuery = `
                        UPDATE variantes 
                        SET nombre_variante = $1, precio_venta = $2, precio_compra = $3,
                            idcolor_disenio = $4, idcolor_luz = $5, idwatt = $6, idtamano = $7,
                            stock = $8, stock_minimo = $9
                        WHERE idvariante = $10 AND idproducto = $11 AND estado = 0
                        RETURNING idvariante
                    `;
                    
                    const varianteResult = await client.query(varianteQuery, [
                        variante.nombre_variante,
                        variante.precio_venta,
                        variante.precio_compra,
                        variante.idcolor_disenio,
                        variante.idcolor_luz,
                        variante.idwatt,
                        variante.idtamano,
                        variante.stock,
                        variante.stock_minimo || 0,
                        variante.idvariante,
                        idproducto
                    ]);
                    
                    if (varianteResult.rows.length === 0) {
                        throw new Error(`No se pudo actualizar la variante ${variante.idvariante}`);
                    }
                    
                    idvariante = varianteResult.rows[0].idvariante;
                    updatedVarianteIds.push(idvariante);

                    // Procesar imágenes de la variante existente
                    console.log("Procesando imágenes para variante:", idvariante);
                    
                    // Si hay nuevas imágenes, eliminar las existentes y agregar las nuevas
                    const varianteImagenes = files.filter(img => 
                        img.fieldname && img.fieldname.includes(`variantes[${i}][imagenes]`)
                    );
                    
                    if (varianteImagenes.length > 0) {
                        console.log("Eliminando imágenes existentes y agregando", varianteImagenes.length, "nuevas imágenes");
                        
                        // Eliminar imágenes existentes de esta variante
                        await client.query('DELETE FROM imagenes_variantes WHERE idvariante = $1', [idvariante]);
                        
                        // Insertar nuevas imágenes
                        for (const imagen of varianteImagenes) {
                            const imagenQuery = `
                                INSERT INTO imagenes_variantes (idvariante, imagen) 
                                VALUES ($1, $2)
                            `;
                            await client.query(imagenQuery, [idvariante, imagen.buffer]);
                        }
                    } else {
                        console.log("No hay nuevas imágenes para esta variante, manteniendo las existentes");
                    }
                } else {
                    // Insertar nueva variante
                    console.log("Insertando nueva variante:", variante.nombre_variante);
                    const varianteQuery = `
                        INSERT INTO variantes (
                            idproducto, nombre_variante, precio_venta, precio_compra,
                            idcolor_disenio, idcolor_luz, idwatt, idtamano, stock, stock_minimo, estado
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0)
                        RETURNING idvariante
                    `;
                    
                    const varianteResult = await client.query(varianteQuery, [
                        idproducto,
                        variante.nombre_variante,
                        variante.precio_venta,
                        variante.precio_compra,
                        variante.idcolor_disenio,
                        variante.idcolor_luz,
                        variante.idwatt,
                        variante.idtamano,
                        variante.stock,
                        variante.stock_minimo || 0
                    ]);
                    
                    idvariante = varianteResult.rows[0].idvariante;
                    updatedVarianteIds.push(idvariante);

                    // Insertar imágenes de la nueva variante
                    const varianteImagenes = files.filter(img => 
                        img.fieldname && img.fieldname.includes(`variantes[${i}][imagenes]`)
                    );
                    
                    console.log("Insertando imágenes para nueva variante:", varianteImagenes.length);
                    
                    for (const imagen of varianteImagenes) {
                        const imagenQuery = `
                            INSERT INTO imagenes_variantes (idvariante, imagen) 
                            VALUES ($1, $2)
                        `;
                        await client.query(imagenQuery, [idvariante, imagen.buffer]);
                    }
                }
            }

            // 5. Eliminar variantes que ya no existen (soft delete)
            const variantesToDelete = existingVarianteIds.filter(id => !updatedVarianteIds.includes(id));
            if (variantesToDelete.length > 0) {
                console.log("Eliminando variantes:", variantesToDelete);
                await client.query(
                    'UPDATE variantes SET estado = 1 WHERE idvariante = ANY($1) AND idproducto = $2',
                    [variantesToDelete, idproducto]
                );
            }

            await client.query('COMMIT');

            console.log("Producto actualizado exitosamente");
            return await this.getProductoById(idproducto);

        } catch (error) {
            await client.query('ROLLBACK');
            console.error("Error en updateProducto service:", error);
            throw error;
        } finally {
            client.release();
        }
    }

    async getProductoById(idproducto) {
        const queryStr = `
            SELECT 
                p.idproducto,
                p.nombre,
                p.descripcion,
                p.idubicacion,
                u.nombre as ubicacion,
                p.estado,
                ARRAY_AGG(DISTINCT c.nombre) as categorias,
                ARRAY_AGG(DISTINCT t.nombre) as tipos,
                COALESCE(
                    JSON_AGG(
                        DISTINCT JSONB_BUILD_OBJECT(
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
                            'tamano', tm.nombre,
                            'imagenes', COALESCE(
                                (SELECT ARRAY_AGG(
                                    'data:image/jpeg;base64,' || encode(iv.imagen, 'base64')
                                ) 
                                 FROM imagenes_variantes iv 
                                 WHERE iv.idvariante = v.idvariante),
                                ARRAY[]::text[]
                            )
                        )
                    ) FILTER (WHERE v.idvariante IS NOT NULL AND v.estado = 0),
                    '[]'::json
                ) as variantes
            FROM productos p
            LEFT JOIN ubicaciones u ON p.idubicacion = u.idubicacion
            LEFT JOIN producto_categorias pc ON p.idproducto = pc.idproducto
            LEFT JOIN categorias c ON pc.idcategoria = c.idcategoria
            LEFT JOIN producto_tipos pt ON p.idproducto = pt.idproducto
            LEFT JOIN tipos t ON pt.idtipo = t.idtipo
            LEFT JOIN variantes v ON p.idproducto = v.idproducto AND v.estado = 0
            LEFT JOIN colores_disenio cd ON v.idcolor_disenio = cd.idcolor_disenio
            LEFT JOIN colores_luz cl ON v.idcolor_luz = cl.idcolor_luz
            LEFT JOIN watts w ON v.idwatt = w.idwatt
            LEFT JOIN tamanos tm ON v.idtamano = tm.idtamano
            WHERE p.idproducto = $1 AND p.estado = 0
            GROUP BY p.idproducto, p.nombre, p.descripcion, p.idubicacion, u.nombre, p.estado
        `;

        const result = await pool.query(queryStr, [idproducto]);
        
        if (result.rows.length === 0) {
            return null;
        }

        const producto = result.rows[0];
        
        // Asegurar que las propiedades sean arrays incluso si están vacías
        producto.categorias = producto.categorias || [];
        producto.tipos = producto.tipos || [];
        producto.variantes = producto.variantes || [];

        console.log("DEBUG - Descripción desde BD:", {
            descripcion: producto.descripcion,
            longitud: producto.descripcion?.length,
            contieneSaltos: producto.descripcion?.includes('\n')
        });

        return producto;
    }

    async deleteProducto(idproducto) {
        const queryStr = `
            UPDATE productos 
            SET estado = 1 
            WHERE idproducto = $1 AND estado = 0
            RETURNING idproducto
        `;
        
        const result = await pool.query(queryStr, [idproducto]);
        
        if (result.rowCount === 0) {
            throw new Error("Producto no encontrado o ya eliminado");
        }
    }
}

module.exports = new FormularioProductoService();