import { api } from './api.js'

let activeDiscountsPromise = null

export const discountService = {
  // Cliente — requiere auth
  getDescuentosActivos: () => {
    if (!activeDiscountsPromise) {
      activeDiscountsPromise = api.get('/descuentos/activos').then((r) => r.data)
    }
    return activeDiscountsPromise
  },
  invalidateActiveDiscounts: () => {
    activeDiscountsPromise = null
  },
  buscarPorCodigo: (codigo) =>
    api.get('/descuentos/buscar', { params: { codigo } }).then((r) => r.data),
  calcular: (descuentoId, monto) =>
    api.get(`/descuentos/${descuentoId}/calcular`, { params: { monto } }).then((r) => r.data),

  // Admin — CRUD
  getDescuentos:     ()          => api.get('/descuentos').then((r) => r.data),
  crearDescuento:    (data)      => api.post('/descuentos', data).then((r) => {
    activeDiscountsPromise = null
    return r.data
  }),
  actualizarDescuento: (id, data)=> api.put(`/descuentos/${id}`, data).then((r) => {
    activeDiscountsPromise = null
    return r.data
  }),
  eliminarDescuento: (id)        => api.delete(`/descuentos/${id}`).then((r) => {
    activeDiscountsPromise = null
    return r.data
  }),
}

