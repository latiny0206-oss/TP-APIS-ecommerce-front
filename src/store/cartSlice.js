import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { discountService } from '../api/discountService.js'
import { getErrorMessage } from '../api/api.js'

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

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items:       saved.items,
    coupon:      saved.coupon,
    couponError: null,
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
      state.coupon      = action.payload
      state.couponError = null
    },
    setCouponError(state, action) {
      state.couponError = action.payload
    },
    removeCoupon(state) {
      state.coupon      = null
      state.couponError = null
    },
    clearCart(state) {
      state.items       = []
      state.coupon      = null
      state.couponError = null
    },
  },
})

export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async (code, { dispatch }) => {
    const trimmed = (code || '').trim().toUpperCase()
    if (!trimmed) return
    try {
      const descuentos = await discountService.getDescuentosActivos()
      const found = descuentos.find(
        (d) => d.codigo?.toUpperCase() === trimmed && d.estado === 'ACTIVO'
      )
      if (!found) {
        dispatch(setCouponError(`Código "${trimmed}" inválido o vencido`))
        return
      }
      const pct   = found.tipo === 'PORCENTAJE' ? Number(found.valor) : 0
      const label = found.tipo === 'PORCENTAJE'
        ? `${found.codigo} · ${pct}% OFF`
        : `${found.codigo} · -$${Number(found.valor).toLocaleString('es-CL')}`
      dispatch(setCoupon({ ...found, label }))
    } catch (e) {
      dispatch(setCouponError(getErrorMessage(e)))
    }
  }
)

export function computeTotals(items) {
  const subtotal = items.reduce((s, i) => s + i.precio * i.qty, 0)
  return {
    subtotal,
    discount:  0,
    total:     subtotal,
    itemCount: items.reduce((n, i) => n + i.qty, 0),
  }
}

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
