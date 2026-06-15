import { api } from './api.js'

export const cartService = {
  // Crea un carrito nuevo para el usuario
  crearCarrito: ({ usuarioId, descuentoId } = {}) =>
    api.post('/carritos', { usuarioId, ...(descuentoId && { descuentoId }) }).then((r) => r.data),

  // Lista todos los carritos del usuario autenticado
  getCarritos: () => api.get('/carritos').then((r) => r.data),

  // Agrega un item al carrito
  addItem: (carritoId, { idVariante, cantidad }) =>
    api.post(`/carritos/${carritoId}/items`, { idVariante, cantidad }).then((r) => r.data),

  // Elimina un item del carrito
  removeItem: (carritoId, itemId) =>
    api.delete(`/carritos/${carritoId}/items/${itemId}`).then((r) => r.data),

  // Actualiza la cantidad de un item
  updateItemCantidad: (carritoId, itemId, cantidad) =>
    api.put(`/carritos/${carritoId}/items/${itemId}`, null, { params: { cantidad } }).then((r) => r.data),

  // Obtiene el total del carrito
  getTotal: (carritoId) =>
    api.get(`/carritos/${carritoId}/total`).then((r) => r.data),

  // Aplica cupón por código al carrito
  aplicarCupon: (carritoId, codigo) =>
    api.put(`/carritos/${carritoId}/descuento`, { codigo }).then((r) => r.data),

  // Checkout: descuenta stock y genera la orden
  // body opcional: { nombreDestinatario, direccion, ciudad, provincia, codigoPostal, telefono, metodoPago }
  checkout: (carritoId, body = {}) =>
    api.post(`/carritos/${carritoId}/checkout`, body).then((r) => r.data),

  // Vacía el carrito sin eliminarlo
  vaciar: (carritoId) =>
    api.post(`/carritos/${carritoId}/vaciar`).then((r) => r.data),

  // Actualiza datos del carrito (ej: asociar descuentoId)
  actualizarCarrito: (carritoId, data) =>
    api.put(`/carritos/${carritoId}`, data).then((r) => r.data),
}
