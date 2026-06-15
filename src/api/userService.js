import { api } from './api.js'

export const userService = {
  getUsuarios:     ()          => api.get('/usuarios').then((r) => r.data),
  getUsuario:      (id)        => api.get(`/usuarios/${id}`).then((r) => r.data),
  actualizarUsuario: (id, data) => api.put(`/usuarios/${id}`, data).then((r) => r.data),
  eliminarUsuario: (id)        => api.delete(`/usuarios/${id}`).then((r) => r.data),
}
