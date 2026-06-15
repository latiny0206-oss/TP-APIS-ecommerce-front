import { api, tokenStorage, userStorage } from './api.js'

export const authService = {
  async login({ username, password }) {
    const { data } = await api.post('/auth/login', { username, password })
    // data = { token, username, rol }
    tokenStorage.set(data.token)
    userStorage.set({ username: data.username, rol: data.rol })
    return data
  },

  async register({ username, email, password, nombre, apellido }) {
    const { data } = await api.post('/auth/register', { username, email, password, nombre, apellido })
    return data
  },

  logout() {
    tokenStorage.remove()
    userStorage.remove()
  },

  getStoredUser() {
    return userStorage.get()
  },

  isAuthenticated() {
    return !!tokenStorage.get()
  },
}
