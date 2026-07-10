import { api, BASE_URL } from './api.js'

let categoriasPromise = null
let marcasPromise = null
let variantesPromise = null
let fotosPromise = null
let productosPromise = null
let productosAdminPromise = null

export const productService = {
  // Invalidadores selectivos: cada mutación solo tira el cache de lo que
  // realmente pudo haber cambiado, para no forzar refetches innecesarios
  // (en particular el de /fotos, que es el payload más pesado).
  invalidateProductos: () => {
    productosPromise = null
    productosAdminPromise = null
  },
  invalidateVariantes: () => {
    variantesPromise = null
  },
  invalidateFotos: () => {
    fotosPromise = null
  },
  invalidateCatalogos: () => {
    categoriasPromise = null
    marcasPromise = null
  },
  invalidateCache: () => {
    productService.invalidateProductos()
    productService.invalidateVariantes()
    productService.invalidateFotos()
    productService.invalidateCatalogos()
  },

  // Catálogo (GET públicos)
  getCategorias:  () => {
    if (!categoriasPromise) {
      categoriasPromise = api.get('/categorias').then((r) => r.data)
    }
    return categoriasPromise
  },
  getMarcas:      () => {
    if (!marcasPromise) {
      marcasPromise = api.get('/marcas').then((r) => r.data)
    }
    return marcasPromise
  },
  getProductos:   () => {
    if (!productosPromise) {
      productosPromise = api.get('/productos').then((r) => r.data)
    }
    return productosPromise
  },
  getProducto:    (id) => api.get(`/productos/${id}`).then((r) => r.data),

  // Admin: trae ACTIVO + PAUSADO + ELIMINADO en un solo llamado (requiere ADMIN)
  getProductosAdmin: () => {
    if (!productosAdminPromise) {
      productosAdminPromise = api.get('/productos/admin').then((r) => r.data)
    }
    return productosAdminPromise
  },
  getProductosByCategoria: (id) => api.get(`/productos/categoria/${id}`).then((r) => r.data),
  getProductosByMarca:     (id) => api.get(`/productos/marca/${id}`).then((r) => r.data),
  isProductoDisponible:    (id) => api.get(`/productos/${id}/disponible`).then((r) => r.data),

  // Variantes
  getVariantes:         ()        => {
    if (!variantesPromise) {
      variantesPromise = api.get('/variantes').then((r) => r.data)
    }
    return variantesPromise
  },
  getVariante:          (id)      => api.get(`/variantes/${id}`).then((r) => r.data),
  isStockDisponible:    (id, qty) => api.get(`/variantes/${id}/stock/disponible`, { params: { cantidad: qty } }).then((r) => r.data),

  // Fotos: metadata liviana [{ id, varianteId, nombre, tipoContenido, orden }], sin el binario
  getAllFotos:          ()            => {
    if (!fotosPromise) {
      fotosPromise = api.get('/fotos').then((r) => r.data)
    }
    return fotosPromise
  },
  getFotosByVariante:   (varianteId) => {
    if (fotosPromise) {
      return fotosPromise.then((fotos) =>
        fotos.filter((f) => String(f.varianteId) === String(varianteId))
      )
    }
    return api.get(`/fotos/variante/${varianteId}`).then((r) => r.data)
  },
  // El binario se sirve por separado y cacheable por el browser (ver FotoController#archivo)
  buildImageSrc: (foto) => `${BASE_URL}/fotos/${foto.id}/archivo`,

  // CRUD admin (RESTful estándar)
  // Cada mutación invalida solo los caches que puede haber afectado.
  crearProducto:    (data)       => api.post('/productos', data).then((r) => {
    productService.invalidateProductos()
    return r.data
  }),
  actualizarProducto: (id, data) => api.put(`/productos/${id}`, data).then((r) => {
    productService.invalidateProductos()
    return r.data
  }),
  eliminarProducto: (id)         => api.delete(`/productos/${id}`).then((r) => {
    productService.invalidateProductos()
    return r.data
  }),

  crearVariante:    (data)       => api.post('/variantes', data).then((r) => {
    productService.invalidateVariantes()
    return r.data
  }),
  actualizarVariante: (id, data) => api.put(`/variantes/${id}`, data).then((r) => {
    productService.invalidateVariantes()
    return r.data
  }),
  eliminarVariante: (id)         => api.delete(`/variantes/${id}`).then((r) => {
    productService.invalidateVariantes()
    return r.data
  }),

  // Categorías/marcas van embebidas (denormalizadas) en la respuesta de productos
  // (categoriaNombre/marcaNombre), por eso también invalidan productos.
  crearCategoria:   (data)       => api.post('/categorias', data).then((r) => {
    productService.invalidateCatalogos()
    productService.invalidateProductos()
    return r.data
  }),
  actualizarCategoria: (id, data)=> api.put(`/categorias/${id}`, data).then((r) => {
    productService.invalidateCatalogos()
    productService.invalidateProductos()
    return r.data
  }),
  eliminarCategoria:(id)         => api.delete(`/categorias/${id}`).then((r) => {
    productService.invalidateCatalogos()
    productService.invalidateProductos()
    return r.data
  }),

  crearMarca:       (data)       => api.post('/marcas', data).then((r) => {
    productService.invalidateCatalogos()
    productService.invalidateProductos()
    return r.data
  }),
  actualizarMarca:  (id, data)   => api.put(`/marcas/${id}`, data).then((r) => {
    productService.invalidateCatalogos()
    productService.invalidateProductos()
    return r.data
  }),
  eliminarMarca:    (id)         => api.delete(`/marcas/${id}`).then((r) => {
    productService.invalidateCatalogos()
    productService.invalidateProductos()
    return r.data
  }),

  // Fotos CRUD wrappers
  subirFoto:        (formData, config) => api.post('/fotos', formData, config).then((r) => {
    productService.invalidateFotos()
    return r.data
  }),
  eliminarFoto:     (id)         => api.delete(`/fotos/${id}`).then((r) => {
    productService.invalidateFotos()
    return r.data
  }),

  // Normaliza un producto del backend al formato esperado por las vistas.
  // variantes: array de variantes de ESTE producto (ya filtradas).
  normalizeProducto(producto, variantes = []) {
    const precioBase   = producto.precioBase ?? 0
    const descuentoPct = producto.descuentoPct ?? 0
    const precio       = descuentoPct > 0
      ? Math.round(precioBase * (1 - descuentoPct / 100))
      : precioBase

    const categoriaNombre = (producto.categoriaNombre ?? producto.categoria?.nombre ?? '').toLowerCase()
    const marcaNombre     = producto.marcaNombre ?? producto.marca?.nombre ?? ''

    const talles   = variantes.map((v) => v.talla).filter(Boolean)
    const stock    = variantes.reduce((s, v) => s + (v.stock ?? 0), 0)
    const temporada = variantes[0]?.estacion ?? '4 Estaciones'

    const stockPorTalle = variantes.reduce((acc, v) => {
      if (v.talla) acc[v.talla] = v.stock ?? 0
      return acc
    }, {})

    return {
      id:          producto.id,
      nombre:      producto.nombre ?? '',
      descripcion: producto.descripcion ?? '',
      marca:       marcaNombre,
      categoria:   categoriaNombre,
      precio:      precioBase,
      descuento:   descuentoPct,
      precioFinal: precio,
      imagen:      null,          // cargada por separado via fotos
      tag:         producto.tag ?? null,
      estado:      producto.estado ?? 'ACTIVO',
      talles:      talles.length > 0 ? talles : ['Único'],
      stock,
      stockPorTalle: Object.keys(stockPorTalle).length > 0 ? stockPorTalle : undefined,
      temporada,
      marcaId:     producto.marca?.id ?? producto.marcaId,
      categoriaId: producto.categoria?.id ?? producto.categoriaId,
      descuentoPct,
      precioBase,
      _variantes:  variantes,   // referencia para obtener varianteId por talle
    }
  },
}

// Limpieza de caché al cambiar la sesión
if (typeof window !== 'undefined') {
  window.addEventListener('auth:logout', () => productService.invalidateCache())
  window.addEventListener('auth:login', () => productService.invalidateCache())
}
