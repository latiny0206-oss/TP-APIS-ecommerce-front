import { configureStore } from '@reduxjs/toolkit'
import landingReducer    from './landingSlice.js'
import navigationReducer from './navigationSlice.js'
import cartReducer       from './cartSlice.js'
import productsReducer   from './productsSlice.js'
import adminReducer      from './adminSlice.js'
import authReducer       from './authSlice.js'
import { hydrate }       from './productsSlice.js'
import { PRODUCTS_SEED } from '../data/index.js'

// Cada navigate() normal empuja una entrada en el historial del navegador.
// navigateSilent() (usado por el handler de popstate) no dispara este bloque.
const historySync = () => next => action => {
  const result = next(action)
  if (action.type === 'navigation/navigate') {
    const view   = typeof action.payload === 'string' ? action.payload : action.payload?.view
    const params = typeof action.payload === 'object'  ? (action.payload?.params ?? {}) : {}
    if (view) {
      const path = view === 'home' ? '/' : `/${view}`
      if (window.location.pathname !== path) {
        window.history.pushState({ view, params }, '', path)
      }
    }
  }
  return result
}

export const store = configureStore({
  reducer: {
    landing:    landingReducer,
    navigation: navigationReducer,
    cart:       cartReducer,
    products:   productsReducer,
    admin:      adminReducer,
    auth:       authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(historySync),
})

store.dispatch(hydrate(PRODUCTS_SEED))

store.subscribe(() => {
  try {
    const { items, coupon } = store.getState().cart
    localStorage.setItem('cumbre_cart', JSON.stringify({ items, coupon }))
  } catch {}
})
