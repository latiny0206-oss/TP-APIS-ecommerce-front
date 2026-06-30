import { configureStore } from '@reduxjs/toolkit'
import cartReducer  from './cartSlice.js'
import toastReducer from './toastSlice.js'
import authReducer  from './authSlice.js'

export const store = configureStore({
  reducer: {
    cart:  cartReducer,
    toast: toastReducer,
    auth:  authReducer,
  },
})
