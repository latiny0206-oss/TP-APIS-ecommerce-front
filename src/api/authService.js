import { api, tokenStorage, userStorage } from './api.js'

export const authService = {
  async login({ username, password }) {
    const { data } = await api.post('/auth/login', { username, password })
    // data = { token, username, rol }
    tokenStorage.set(data.token)
    userStorage.set({
      id:       data.id,
      username: data.username,
      nombre:   data.nombre,
      email:    data.email,
      rol:      data.rol,
    })
    return data
  },

  async register({ username, email, password, nombre, apellido }) {
    const { data } = await api.post('/auth/register', { username, email, password, nombre, apellido })
    return data
  },

  async forgotPassword(email) {
    const { data } = await api.post('/auth/forgot-password', { email })
    return data
  },

  logout() {
    tokenStorage.remove()
    userStorage.remove()
    localStorage.removeItem('cumbre_cart')
  },

  getStoredUser() {
    return userStorage.get()
  },

  isAuthenticated() {
    return !!tokenStorage.get()
  },
}
