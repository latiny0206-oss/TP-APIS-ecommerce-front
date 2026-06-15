import { api } from './api.js'

export const discountService = {
  // Cliente — requiere auth
  getDescuentosActivos: () => api.get('/descuentos/activos').then((r) => r.data),
  buscarPorCodigo: (codigo) =>
    api.get('/descuentos/buscar', { params: { codigo } }).then((r) => r.data),
  calcular: (descuentoId, monto) =>
    api.get(`/descuentos/${descuentoId}/calcular`, { params: { monto } }).then((r) => r.data),

  // Admin — CRUD
  getDescuentos:     ()          => api.get('/descuentos').then((r) => r.data),
  crearDescuento:    (data)      => api.post('/descuentos', data).then((r) => r.data),
  actualizarDescuento: (id, data)=> api.put(`/descuentos/${id}`, data).then((r) => r.data),
  eliminarDescuento: (id)        => api.delete(`/descuentos/${id}`).then((r) => r.data),
}
