import { createSlice } from '@reduxjs/toolkit'
import { addToCart } from './cartSlice.js'

const toastSlice = createSlice({
  name: 'toast',
  initialState: { visible: false, productName: null },
  reducers: {
    hideToast(state) {
      state.visible     = false
      state.productName = null
    },
  },
  extraReducers(builder) {
    // Mostrar toast automáticamente cuando se agrega un item al carrito
    builder.addCase(addToCart, (state, action) => {
      state.visible     = true
      state.productName = action.payload.nombre
    })
  },
})

export const { hideToast } = toastSlice.actions
export default toastSlice.reducer
