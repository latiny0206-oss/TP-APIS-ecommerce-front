import { api } from './api.js'

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard').then((r) => {
    const data = r.data
    if (data && Array.isArray(data.ordenesRecientes)) {
      data.ordenesRecientes = data.ordenesRecientes.map((o) => ({
        id: o.id,
        estado: o.estado,
        fecha: o.fechaCreacion,
        total: o.montoFinal,
        usuario: {
          id: o.usuarioId,
          nombre: o.nombreDestinatario || o.usuarioNombre || `Usuario #${o.usuarioId}`,
          username: o.usuarioUsername || `user_${o.usuarioId}`,
        }
      }))
    }
    return data
  }),
}
