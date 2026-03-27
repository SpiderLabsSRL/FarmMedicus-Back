const FormularioProductoService = require("../services/FormularioProductoService");

class FormularioProductoController {
    async createProducto(req, res) {
        try {
            console.log("=== INICIANDO CREACIÓN DE PRODUCTO ===");
            console.log("Body recibido:", req.body);
            console.log("Files recibidos:", req.files ? Object.keys(req.files) : 'No files');
            
            // Función helper para parsear campos JSON
            const parseJSONField = (field) => {
                try {
                    if (!field) return [];
                    if (Array.isArray(field)) return field;
                    
                    // Si es string, parsear como JSON
                    if (typeof field === 'string') {
                        const parsed = JSON.parse(field);
                        return Array.isArray(parsed) ? parsed : [parsed];
                    }
                    
                    return [];
                } catch (error) {
                    console.error("Error parsing JSON field:", error);
                    return [];
                }
            };

            // Función helper para parsear variantes
            const parseVariantes = (variantesBody) => {
                if (!variantesBody) return [];
                
                // Si ya es un array, procesarlo directamente
                if (Array.isArray(variantesBody)) {
                    return variantesBody.map(variante => ({
                        idvariante: variante.idvariante || 0,
                        nombre_variante: variante.nombre_variante || '',
                        precio_venta: parseFloat(variante.precio_venta) || 0,
                        precio_compra: parseFloat(variante.precio_compra || '0') || 0,
                        idcolor_disenio: variante.idcolor_disenio ? parseInt(variante.idcolor_disenio) : null,
                        idcolor_luz: variante.idcolor_luz ? parseInt(variante.idcolor_luz) : null,
                        idwatt: variante.idwatt ? parseInt(variante.idwatt) : null,
                        idtamano: variante.idtamano ? parseInt(variante.idtamano) : null,
                        stock: parseInt(variante.stock) || 0,
                        stock_minimo: parseInt(variante.stock_minimo || '0') || 0,
                        imagenes_existentes: variante.imagenes_existentes || []
                    }));
                }
                
                // Si viene como string JSON, parsearlo
                if (typeof variantesBody === 'string') {
                    try {
                        const parsed = JSON.parse(variantesBody);
                        return Array.isArray(parsed) ? parsed.map(variante => ({
                            idvariante: variante.idvariante || 0,
                            nombre_variante: variante.nombre_variante || '',
                            precio_venta: parseFloat(variante.precio_venta) || 0,
                            precio_compra: parseFloat(variante.precio_compra || '0') || 0,
                            idcolor_disenio: variante.idcolor_disenio ? parseInt(variante.idcolor_disenio) : null,
                            idcolor_luz: variante.idcolor_luz ? parseInt(variante.idcolor_luz) : null,
                            idwatt: variante.idwatt ? parseInt(variante.idwatt) : null,
                            idtamano: variante.idtamano ? parseInt(variante.idtamano) : null,
                            stock: parseInt(variante.stock) || 0,
                            stock_minimo: parseInt(variante.stock_minimo || '0') || 0,
                            imagenes_existentes: variante.imagenes_existentes || []
                        })) : [];
                    } catch (error) {
                        console.error("Error parsing variantes JSON:", error);
                        return [];
                    }
                }
                
                return [];
            };

            // Validar campos obligatorios
            if (!req.body.nombre) {
                return res.status(400).json({
                    success: false,
                    message: "El nombre del producto es obligatorio"
                });
            }

            if (!req.body.descripcion) {
                return res.status(400).json({
                    success: false,
                    message: "La descripción del producto es obligatoria"
                });
            }

            if (!req.body.idubicacion) {
                return res.status(400).json({
                    success: false,
                    message: "La ubicación es obligatoria"
                });
            }

            const productoData = {
                nombre: req.body.nombre,
                descripcion: req.body.descripcion,
                idubicacion: parseInt(req.body.idubicacion),
                categorias: parseJSONField(req.body.categorias),
                tipos: parseJSONField(req.body.tipos),
                variantes: parseVariantes(req.body.variantes)
            };

            console.log("Datos procesados del producto:", {
                nombre: productoData.nombre,
                descripcion: productoData.descripcion,
                idubicacion: productoData.idubicacion,
                categorias: productoData.categorias,
                tipos: productoData.tipos,
                variantesCount: productoData.variantes.length
            });

            console.log("Detalle de variantes:", productoData.variantes);

            const result = await FormularioProductoService.createProducto(productoData, req.files || []);
            
            console.log("=== PRODUCTO CREADO EXITOSAMENTE ===");
            res.status(201).json({
                success: true,
                message: "Producto creado exitosamente",
                data: result
            });
        } catch (error) {
            console.error("Error en createProducto controller:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Error interno del servidor"
            });
        }
    }

    async updateProducto(req, res) {
        try {
            const { id } = req.params;
            
            console.log("=== ACTUALIZANDO PRODUCTO ===");
            console.log("Producto ID:", id);
            console.log("Body recibido:", req.body);
            console.log("Files recibidos:", req.files ? Object.keys(req.files) : 'No files');

            // Función helper para parsear campos JSON
            const parseJSONField = (field) => {
                try {
                    if (!field) return [];
                    if (Array.isArray(field)) return field;
                    
                    if (typeof field === 'string') {
                        const parsed = JSON.parse(field);
                        return Array.isArray(parsed) ? parsed : [parsed];
                    }
                    
                    return [];
                } catch (error) {
                    console.error("Error parsing JSON field:", error);
                    return [];
                }
            };

            // Función helper para parsear variantes
            const parseVariantes = (variantesBody) => {
                if (!variantesBody) return [];
                
                if (Array.isArray(variantesBody)) {
                    return variantesBody.map(variante => ({
                        idvariante: variante.idvariante || 0,
                        nombre_variante: variante.nombre_variante || '',
                        precio_venta: parseFloat(variante.precio_venta) || 0,
                        precio_compra: parseFloat(variante.precio_compra || '0') || 0,
                        idcolor_disenio: variante.idcolor_disenio ? parseInt(variante.idcolor_disenio) : null,
                        idcolor_luz: variante.idcolor_luz ? parseInt(variante.idcolor_luz) : null,
                        idwatt: variante.idwatt ? parseInt(variante.idwatt) : null,
                        idtamano: variante.idtamano ? parseInt(variante.idtamano) : null,
                        stock: parseInt(variante.stock) || 0,
                        stock_minimo: parseInt(variante.stock_minimo || '0') || 0,
                        imagenes_existentes: variante.imagenes_existentes || []
                    }));
                }
                
                if (typeof variantesBody === 'string') {
                    try {
                        const parsed = JSON.parse(variantesBody);
                        return Array.isArray(parsed) ? parsed.map(variante => ({
                            idvariante: variante.idvariante || 0,
                            nombre_variante: variante.nombre_variante || '',
                            precio_venta: parseFloat(variante.precio_venta) || 0,
                            precio_compra: parseFloat(variante.precio_compra || '0') || 0,
                            idcolor_disenio: variante.idcolor_disenio ? parseInt(variante.idcolor_disenio) : null,
                            idcolor_luz: variante.idcolor_luz ? parseInt(variante.idcolor_luz) : null,
                            idwatt: variante.idwatt ? parseInt(variante.idwatt) : null,
                            idtamano: variante.idtamano ? parseInt(variante.idtamano) : null,
                            stock: parseInt(variante.stock) || 0,
                            stock_minimo: parseInt(variante.stock_minimo || '0') || 0,
                            imagenes_existentes: variante.imagenes_existentes || []
                        })) : [];
                    } catch (error) {
                        console.error("Error parsing variantes JSON:", error);
                        return [];
                    }
                }
                
                return [];
            };

            // Validaciones básicas
            if (!req.body.nombre) {
                return res.status(400).json({
                    success: false,
                    message: "El nombre del producto es obligatorio"
                });
            }

            const productoData = {
                nombre: req.body.nombre,
                descripcion: req.body.descripcion,
                idubicacion: parseInt(req.body.idubicacion),
                categorias: parseJSONField(req.body.categorias),
                tipos: parseJSONField(req.body.tipos),
                variantes: parseVariantes(req.body.variantes)
            };

            console.log("Datos procesados para actualización:", productoData);

            const result = await FormularioProductoService.updateProducto(parseInt(id), productoData, req.files || []);
            
            console.log("=== PRODUCTO ACTUALIZADO EXITOSAMENTE ===");
            res.json({
                success: true,
                message: "Producto actualizado exitosamente",
                data: result
            });
        } catch (error) {
            console.error("Error en updateProducto controller:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Error interno del servidor"
            });
        }
    }

    async getProductoById(req, res) {
        try {
            const { id } = req.params;
            console.log("Obteniendo producto ID:", id);
            
            const producto = await FormularioProductoService.getProductoById(parseInt(id));
            
            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: "Producto no encontrado"
                });
            }
            
            res.json({
                success: true,
                data: producto
            });
        } catch (error) {
            console.error("Error en getProductoById controller:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Error interno del servidor"
            });
        }
    }

    async deleteProducto(req, res) {
        try {
            const { id } = req.params;
            console.log("Eliminando producto ID:", id);
            
            await FormularioProductoService.deleteProducto(parseInt(id));
            
            res.json({
                success: true,
                message: "Producto eliminado exitosamente"
            });
        } catch (error) {
            console.error("Error en deleteProducto controller:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Error interno del servidor"
            });
        }
    }
}

module.exports = new FormularioProductoController();