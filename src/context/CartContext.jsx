import { createContext, useContext, useReducer, useEffect, useRef } from 'react'

const ALL_COUPONS = {
  DESCUENTO10: { code: 'DESCUENTO10', type: 'percent', value: 0.10, label: 'DESCUENTO10 · 10% OFF' },
  INVIERNO24:  { code: 'INVIERNO24',  type: 'percent', value: 0.20, label: 'INVIERNO24 · 20% OFF' },
  NUEVOSOCIO:  { code: 'NUEVOSOCIO',  type: 'percent', value: 0.10, label: 'NUEVOSOCIO · 10% OFF' },
  ENVIOPRO:    { code: 'ENVIOPRO',    type: 'fixed',   value: 5990,  label: 'ENVIOPRO · -$5.990' },
}

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

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const p   = action.payload
      const key = `p${p.productId}-${p.talle || 'unico'}`
      const qty = p.qty ?? 1
      const hit = state.items.find((i) => i.lineId === key)
      return {
        ...state,
        items: hit
          ? state.items.map((i) => i.lineId === key ? { ...i, qty: i.qty + qty } : i)
          : [...state.items, { lineId: key, productId: p.productId, nombre: p.nombre, precio: p.precio, imagen: p.imagen, talle: p.talle || null, qty }],
        toast: { visible: true, productName: p.nombre },
      }
    }
    case 'REMOVE':
      return { ...state, items: state.items.filter((i) => i.lineId !== action.payload) }
    case 'UPDATE_QTY': {
      const { lineId, qty } = action.payload
      if (qty <= 0) return { ...state, items: state.items.filter((i) => i.lineId !== lineId) }
      return { ...state, items: state.items.map((i) => i.lineId === lineId ? { ...i, qty } : i) }
    }
    case 'APPLY_COUPON': {
      const code   = (action.payload || '').trim().toUpperCase()
      const coupon = ALL_COUPONS[code]
      if (!coupon) return { ...state, couponError: `Código "${action.payload}" inválido o vencido` }
      return { ...state, coupon, couponError: null }
    }
    case 'REMOVE_COUPON': return { ...state, coupon: null, couponError: null }
    case 'CLEAR':          return { ...state, items: [], coupon: null, couponError: null }
    case 'HIDE_TOAST':     return { ...state, toast: { visible: false, productName: null } }
    default: return state
  }
}

function computeTotals(items, coupon) {
  const subtotal = items.reduce((s, i) => s + i.precio * i.qty, 0)
  const discount = coupon
    ? coupon.type === 'percent' ? Math.round(subtotal * coupon.value) : coupon.value
    : 0
  return {
    subtotal,
    discount,
    total:     Math.max(0, subtotal - discount),
    itemCount: items.reduce((n, i) => n + i.qty, 0),
  }
}

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const saved = loadSaved()
  const [state, dispatch] = useReducer(cartReducer, {
    items:       saved.items,
    coupon:      saved.coupon,
    couponError: null,
    toast:       { visible: false, productName: null },
  })

  const prevRef = useRef(state)
  useEffect(() => {
    if (state === prevRef.current) return
    prevRef.current = state
    try {
      localStorage.setItem('cumbre_cart', JSON.stringify({ items: state.items, coupon: state.coupon }))
    } catch {}
  }, [state])

  const value = {
    items:       state.items,
    coupon:      state.coupon,
    couponError: state.couponError,
    toast:       state.toast,
    totals:      computeTotals(state.items, state.coupon),
    addToCart:      (p)    => dispatch({ type: 'ADD',          payload: p }),
    removeFromCart: (id)   => dispatch({ type: 'REMOVE',       payload: id }),
    updateQty:      (p)    => dispatch({ type: 'UPDATE_QTY',   payload: p }),
    applyCoupon:    (code) => dispatch({ type: 'APPLY_COUPON', payload: code }),
    removeCoupon:   ()     => dispatch({ type: 'REMOVE_COUPON' }),
    clearCart:      ()     => dispatch({ type: 'CLEAR' }),
    hideToast:      ()     => dispatch({ type: 'HIDE_TOAST' }),
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  return useContext(CartContext)
}
