import { createSlice } from '@reduxjs/toolkit'

const KNOWN_VIEWS = new Set([
  'home', 'indumentaria', 'calzado', 'equipamiento', 'accesorios',
  'producto', 'carrito', 'checkout', 'contacto', 'faq', 'perfil', 'guia-tallas',
  'login', 'registro',
  'admin-dashboard', 'admin-products', 'admin-photos', 'admin-variants',
  'admin-catalog', 'admin-discounts', 'admin-orders', 'admin-users',
])

function viewFromPath() {
  const segment = window.location.pathname.replace(/^\//, '').split('/')[0]
  return segment && KNOWN_VIEWS.has(segment) ? segment : 'home'
}

function applyPayload(state, payload) {
  state.currentView = typeof payload === 'string' ? payload : payload.view
  state.params      = typeof payload === 'string' ? {} : (payload.params || {})
}

const navigationSlice = createSlice({
  name: 'navigation',
  initialState: {
    currentView: viewFromPath(),
    params: {},
  },
  reducers: {
    // Navegación normal → el middleware synca con pushState
    navigate(state, { payload }) {
      applyPayload(state, payload)
    },
    // Navegación silenciosa (popstate) → NO dispara pushState en el middleware
    navigateSilent(state, { payload }) {
      applyPayload(state, payload)
    },
  },
})

export const { navigate, navigateSilent } = navigationSlice.actions
export default navigationSlice.reducer
