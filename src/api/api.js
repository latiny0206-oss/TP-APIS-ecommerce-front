import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'
const TOKEN_KEY = 'cumbre_token'
const USER_KEY  = 'cumbre_user'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // 10 s — muestra error si el backend no responde
})

// Inyecta el token JWT en cada request autenticado
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Manejo global de errores: 401 → logout automático.
// Excepción: /auth/login y /auth/register — un 401 ahí son credenciales incorrectas, no sesión expirada.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url ?? ''
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register')
      if (!isAuthEndpoint) {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        window.dispatchEvent(new Event('auth:logout'))
      }
    }
    return Promise.reject(error)
  }
)

export const tokenStorage = {
  get:    ()        => localStorage.getItem(TOKEN_KEY),
  set:    (token)   => localStorage.setItem(TOKEN_KEY, token),
  remove: ()        => localStorage.removeItem(TOKEN_KEY),
}

export const userStorage = {
  get:    ()      => { try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null } },
  set:    (user)  => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  remove: ()      => localStorage.removeItem(USER_KEY),
}

// Helper para extraer mensaje de error del backend
export function getErrorMessage(error) {
  return error.response?.data?.message ?? error.message ?? 'Error desconocido'
}
