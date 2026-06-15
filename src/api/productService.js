import { api } from './api.js'

export const productService = {
  // Catálogo (GET públicos)
  getCategorias:  () => api.get('/categorias').then((r) => r.data),
  getMarcas:      () => api.get('/marcas').then((r) => r.data),
  getProductos:   () => api.get('/productos').then((r) => r.data),
  getProducto:    (id) => api.get(`/productos/${id}`).then((r) => r.data),
  getProductosByCategoria: (id) => api.get(`/productos/categoria/${id}`).then((r) => r.data),
  getProductosByMarca:     (id) => api.get(`/productos/marca/${id}`).then((r) => r.data),
  isProductoDisponible:    (id) => api.get(`/productos/${id}/disponible`).then((r) => r.data),

  // Variantes
  getVariantes:         ()        => api.get('/variantes').then((r) => r.data),
  getVariante:          (id)      => api.get(`/variantes/${id}`).then((r) => r.data),
  isStockDisponible:    (id, qty) => api.get(`/variantes/${id}/stock/disponible`, { params: { cantidad: qty } }).then((r) => r.data),

  // Fotos Base64: [{ tipoContenido, datos }]
  getFotosByVariante:   (varianteId) => api.get(`/fotos/variante/${varianteId}`).then((r) => r.data),
  buildImageSrc: (foto) => `data:${foto.tipoContenido};base64,${foto.datos}`,

  // CRUD admin (RESTful estándar)
  crearProducto:    (data)       => api.post('/productos', data).then((r) => r.data),
  actualizarProducto: (id, data) => api.put(`/productos/${id}`, data).then((r) => r.data),
  eliminarProducto: (id)         => api.delete(`/productos/${id}`).then((r) => r.data),

  crearVariante:    (data)       => api.post('/variantes', data).then((r) => r.data),
  actualizarVariante: (id, data) => api.put(`/variantes/${id}`, data).then((r) => r.data),
  eliminarVariante: (id)         => api.delete(`/variantes/${id}`).then((r) => r.data),

  crearCategoria:   (data)       => api.post('/categorias', data).then((r) => r.data),
  actualizarCategoria: (id, data)=> api.put(`/categorias/${id}`, data).then((r) => r.data),
  eliminarCategoria:(id)         => api.delete(`/categorias/${id}`).then((r) => r.data),

  crearMarca:       (data)       => api.post('/marcas', data).then((r) => r.data),
  actualizarMarca:  (id, data)   => api.put(`/marcas/${id}`, data).then((r) => r.data),
  eliminarMarca:    (id)         => api.delete(`/marcas/${id}`).then((r) => r.data),

  // Normaliza un producto del backend al formato esperado por las vistas.
  // variantes: array de variantes de ESTE producto (ya filtradas).
  normalizeProducto(producto, variantes = []) {
    const precioBase   = producto.precioBase ?? 0
    const descuentoPct = producto.descuentoPct ?? 0
    const precio       = descuentoPct > 0
      ? Math.round(precioBase * (1 - descuentoPct / 100))
      : precioBase

    const categoriaNombre = (producto.categoria?.nombre ?? '').toLowerCase()
    const marcaNombre     = producto.marca?.nombre ?? ''

    const talles   = variantes.map((v) => v.talla ?? v.talle).filter(Boolean)
    const stock    = variantes.reduce((s, v) => s + (v.stock ?? 0), 0)
    const temporada = variantes[0]?.estacion ?? variantes[0]?.temporada ?? '4 Estaciones'

    const stockPorTalle = variantes.reduce((acc, v) => {
      const t = v.talla ?? v.talle
      if (t) acc[t] = v.stock ?? 0
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
