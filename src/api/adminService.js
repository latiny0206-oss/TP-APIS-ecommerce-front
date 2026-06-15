import { api } from './api.js'

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard').then((r) => r.data),
}
