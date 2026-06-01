import { createSlice } from '@reduxjs/toolkit'

function loadSaved() {
  try {
    const raw = localStorage.getItem('cumbre_cart')
    if (raw) {
      const { items, coupon } = JSON.parse(raw)
      return { items: items || [], coupon: coupon || null }
    }
  } catch {}
  return { items: [], coupon: null }
}

const saved = loadSaved()

const ALL_COUPONS = {
  DESCUENTO10: { code: 'DESCUENTO10', type: 'percent', value: 0.10, label: 'DESCUENTO10 · 10% OFF' },
  INVIERNO24:  { code: 'INVIERNO24',  type: 'percent', value: 0.20, label: 'INVIERNO24 · 20% OFF' },
  NUEVOSOCIO:  { code: 'NUEVOSOCIO',  type: 'percent', value: 0.10, label: 'NUEVOSOCIO · 10% OFF' },
  ENVIOPRO:    { code: 'ENVIOPRO',    type: 'fixed',   value: 5990,  label: 'ENVIOPRO · -$5.990' },
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items:       saved.items,
    coupon:      saved.coupon,
    couponError: null,
    toast: { visible: false, productName: null },
  },
  reducers: {
    addToCart(state, { payload }) {
      const key = `p${payload.productId}-${payload.talle || 'unico'}`
      const existing = state.items.find((i) => i.lineId === key)
      if (existing) {
        existing.qty += 1
      } else {
        state.items.push({
          lineId:    key,
          productId: payload.productId,
          nombre:    payload.nombre,
          precio:    payload.precio,
          imagen:    payload.imagen,
          talle:     payload.talle || null,
          qty:       1,
        })
      }
      state.toast = { visible: true, productName: payload.nombre }
    },
    removeFromCart(state, { payload }) {
      state.items = state.items.filter((i) => i.lineId !== payload)
    },
    updateQty(state, { payload }) {
      const item = state.items.find((i) => i.lineId === payload.lineId)
      if (!item) return
      if (payload.qty <= 0) {
        state.items = state.items.filter((i) => i.lineId !== payload.lineId)
      } else {
        item.qty = payload.qty
      }
    },
    applyCoupon(state, { payload }) {
      const code = (payload || '').trim().toUpperCase()
      const coupon = ALL_COUPONS[code]
      if (!coupon) {
        state.couponError = `Código "${payload}" inválido o vencido`
        return
      }
      state.coupon = coupon
      state.couponError = null
    },
    removeCoupon(state) {
      state.coupon = null
      state.couponError = null
    },
    clearCart(state) {
      state.items = []
      state.coupon = null
      state.couponError = null
    },
    hideToast(state) {
      state.toast = { visible: false, productName: null }
    },
  },
})

export const {
  addToCart,
  removeFromCart,
  updateQty,
  applyCoupon,
  removeCoupon,
  clearCart,
  hideToast,
} = cartSlice.actions

export const selectCartTotals = (state) => {
  const subtotal = state.cart.items.reduce((s, i) => s + i.precio * i.qty, 0)
  const c = state.cart.coupon
  let discount = 0
  if (c) {
    discount = c.type === 'percent'
      ? Math.round(subtotal * c.value)
      : c.value
  }
  return {
    subtotal,
    discount,
    total:     Math.max(0, subtotal - discount),
    itemCount: state.cart.items.reduce((n, i) => n + i.qty, 0),
  }
}

export default cartSlice.reducer
