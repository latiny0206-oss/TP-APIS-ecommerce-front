import { api } from './api.js'

export const contactService = {
  // Público — no requiere auth
  enviarContacto: (data) => api.post('/contacto', data).then((r) => r.data),

  // Solo ADMIN
  getMensajes: () => api.get('/contacto').then((r) => r.data),
}
