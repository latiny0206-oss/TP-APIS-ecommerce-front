import { configureStore } from '@reduxjs/toolkit'
import landingReducer    from './landingSlice.js'
import navigationReducer from './navigationSlice.js'
import cartReducer       from './cartSlice.js'
import productsReducer   from './productsSlice.js'
import adminReducer      from './adminSlice.js'
import authReducer       from './authSlice.js'
import { hydrate }       from './productsSlice.js'
import { PRODUCTS_SEED } from '../data/index.js'

export const store = configureStore({
  reducer: {
    landing:    landingReducer,
    navigation: navigationReducer,
    cart:       cartReducer,
    products:   productsReducer,
    admin:      adminReducer,
    auth:       authReducer,
  },
})

// Seed inicial del panel admin
store.dispatch(hydrate(PRODUCTS_SEED))

// Persistir carrito en localStorage
store.subscribe(() => {
  try {
    const { items, coupon } = store.getState().cart
    localStorage.setItem('cumbre_cart', JSON.stringify({ items, coupon }))
  } catch {}
})
