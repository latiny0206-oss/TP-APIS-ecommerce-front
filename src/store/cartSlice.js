import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'
import { discountService } from '../api/discountService.js'
import { getErrorMessage }  from '../api/api.js'

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

// Defined before the slice so extraReducers can reference the action types
export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async (code, { rejectWithValue }) => {
    const trimmed = (code || '').trim().toUpperCase()
    if (!trimmed) return null
    try {
      return await discountService.buscarPorCodigo(trimmed)
    } catch (e) {
      const msg = e.response?.status === 404 ? 'Código no encontrado' : getErrorMessage(e)
      return rejectWithValue(msg)
    }
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
        state.couponError  = action.payload ?? 'Error al aplicar el cupón'
      })
  },
})

// Memoized selector: computes subtotal, discount, shipping and total in one pass.
// Shipping threshold is applied after the coupon discount.
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
    const shipping        = subtotalConDesc >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
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
} = cartSlice.actions

export default cartSlice.reducer
