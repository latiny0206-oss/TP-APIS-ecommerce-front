import { api } from './api.js'

export const orderService = {
  getOrdenes:       ()         => api.get('/ordenes').then((r) => r.data),
  getOrden:         (id)       => api.get(`/ordenes/${id}`).then((r) => r.data),
  getOrdenesByUser: (userId)   => api.get(`/ordenes/usuario/${userId}`).then((r) => r.data),
  confirmar:        (id)       => api.post(`/ordenes/${id}/confirmar`).then((r) => r.data),
  // Cancelar restaura el stock automáticamente
  cancelar:         (id)       => api.post(`/ordenes/${id}/cancelar`).then((r) => r.data),
  eliminar:         (id)       => api.delete(`/ordenes/${id}`).then((r) => r.data),
}
