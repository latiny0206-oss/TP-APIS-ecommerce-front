import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'
import { discountService } from '../api/discountService.js'
import { logout } from './authSlice.js'

export const SHIPPING_THRESHOLD = 80_000
export const SHIPPING_COST      = 10_000

export function loadSaved() {
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

// Defined before the slice so extraReducers can reference the action types.
// Sin try/catch: createAsyncThunk captura el rechazo y despacha .rejected solo;
// el mensaje del backend llega por action.error.message (normalizado en api.js).
export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async (code) => {
    const trimmed = (code || '').trim().toUpperCase()
    if (!trimmed) return null
    return await discountService.buscarPorCodigo(trimmed)
  }
)

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items:        saved.items,
    coupon:       saved.coupon,
    couponError:  null,
    couponStatus: 'idle',   // 'idle' | 'loading'
  },
  reducers: {
    addToCart(state, action) {
      const p   = action.payload
      const key = p.varianteId ? `v${p.varianteId}` : `p${p.productId}-${p.talle || 'unico'}`
      const qty = p.qty ?? 1
      const hit = state.items.find((i) => i.lineId === key)
      if (hit) {
        hit.qty += qty
      } else {
        state.items.push({
          lineId:     key,
          productId:  p.productId,
          varianteId: p.varianteId ?? null,
          nombre:     p.nombre,
          precio:     p.precio,
          imagen:     p.imagen,
          talle:      p.talle || null,
          qty,
        })
      }
    },
    removeFromCart(state, action) {
      state.items = state.items.filter((i) => i.lineId !== action.payload)
    },
    updateQty(state, action) {
      const { lineId, qty } = action.payload
      if (qty <= 0) {
        state.items = state.items.filter((i) => i.lineId !== lineId)
      } else {
        const item = state.items.find((i) => i.lineId === lineId)
        if (item) item.qty = qty
      }
    },
    setCoupon(state, action) {
      state.coupon       = action.payload
      state.couponError  = null
      state.couponStatus = 'idle'
    },
    setCouponError(state, action) {
      state.couponError  = action.payload
      state.couponStatus = 'idle'
    },
    removeCoupon(state) {
      state.coupon       = null
      state.couponError  = null
      state.couponStatus = 'idle'
    },
    clearCart(state) {
      state.items        = []
      state.coupon       = null
      state.couponError  = null
      state.couponStatus = 'idle'
    },
    // Fusiona items traídos del backend (al iniciar sesión) con lo que ya haya
    // en el carrito local. Suma cantidades por lineId. No dispara el toast
    // (a diferencia de addToCart), porque no es una acción del usuario.
    hydrateItems(state, action) {
      for (const incoming of action.payload) {
        const hit = state.items.find((i) => i.lineId === incoming.lineId)
        if (hit) hit.qty += incoming.qty
        else     state.items.push(incoming)
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(applyCoupon.pending, (state) => {
        state.couponStatus = 'loading'
        state.couponError  = null
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.couponStatus = 'idle'
        if (action.payload) {
          state.coupon      = action.payload
          state.couponError = null
        }
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.couponStatus = 'idle'
        state.couponError  = action.error.message ?? 'Error al aplicar el cupón'
      })
      // Al cerrar sesión (botón o auto-logout por 401) el carrito visible se vacía.
      // El carrito del backend queda asociado al usuario y no se toca.
      .addCase(logout, (state) => {
        state.items        = []
        state.coupon       = null
        state.couponError  = null
        state.couponStatus = 'idle'
      })
  },
})

// Memoized selector: computes subtotal, discount, shipping and total in one pass.
// El umbral de envío gratis se evalúa sobre el subtotal ANTES del cupón:
// un descuento no puede quitar el envío gratis ya ganado por monto de compra.
export const selectCartTotals = createSelector(
  (state) => state.cart.items,
  (state) => state.cart.coupon,
  (items, coupon) => {
    const subtotal  = items.reduce((s, i) => s + i.precio * i.qty, 0)
    const itemCount = items.reduce((n, i) => n + i.qty, 0)

    let discount = 0
    if (coupon) {
      const val = Number(coupon.valor ?? 0)
      if (coupon.tipo === 'PORCENTAJE')  discount = Math.round(subtotal * val / 100)
      else if (coupon.tipo === 'FIJO')   discount = Math.min(val, subtotal)
    }

    const subtotalConDesc = Math.max(0, subtotal - discount)
    const shipping        = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
    const total           = subtotalConDesc + shipping

    return { subtotal, discount, subtotalConDesc, shipping, total, itemCount }
  }
)

export const {
  addToCart,
  removeFromCart,
  updateQty,
  setCoupon,
  setCouponError,
  removeCoupon,
  clearCart,
  hydrateItems,
} = cartSlice.actions

export default cartSlice.reducer
