import { api } from './api.js'

export const orderService = {
  normalizeOrden(o) {
    if (!o) return null
    return {
      id: o.id,
      estado: o.estado,
      fecha: o.fechaCreacion,
      total: o.montoFinal,
      metodoPago: o.metodoPago,
      nombreDestinatario: o.nombreDestinatario,
      direccion: o.direccion,
      ciudad: o.ciudad,
      provincia: o.provincia,
      codigoPostal: o.codigoPostal,
      telefono: o.telefono,
      usuario: {
        id: o.usuarioId,
        nombre: o.nombreDestinatario || `Usuario #${o.usuarioId}`,
        username: `user_${o.usuarioId}`,
      },
      items: (o.items ?? []).map(item => ({
        id: item.id,
        varianteId: item.varianteId,
        color: item.varianteColor,
        talle: item.varianteTalla,
        nombre: item.productoNombre,
        cantidad: item.cantidad,
        precio: item.precioAlMomento,
      }))
    }
  },

  getOrdenes:       ()         => api.get('/ordenes').then((r) => (r.data ?? []).map(orderService.normalizeOrden)),
  getOrden:         (id)       => api.get(`/ordenes/${id}`).then((r) => orderService.normalizeOrden(r.data)),
  getOrdenesByUser: (userId)   => api.get(`/ordenes/usuario/${userId}`).then((r) => (r.data ?? []).map(orderService.normalizeOrden)),
  confirmar:        (id)       => api.post(`/ordenes/${id}/confirmar`).then((r) => orderService.normalizeOrden(r.data)),
  cancelar:         (id)       => api.post(`/ordenes/${id}/cancelar`).then((r) => orderService.normalizeOrden(r.data)),
  eliminar:         (id)       => api.delete(`/ordenes/${id}`).then((r) => r.data),
}
