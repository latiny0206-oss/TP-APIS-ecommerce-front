import { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react'
import { discountService } from '../api/discountService.js'
import { getErrorMessage } from '../api/api.js'

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
      const key = p.varianteId ? `v${p.varianteId}` : `p${p.productId}-${p.talle || 'unico'}`
      const qty = p.qty ?? 1
      const hit = state.items.find((i) => i.lineId === key)
      return {
        ...state,
        items: hit
          ? state.items.map((i) => i.lineId === key ? { ...i, qty: i.qty + qty } : i)
          : [...state.items, {
              lineId: key, productId: p.productId, varianteId: p.varianteId ?? null,
              nombre: p.nombre, precio: p.precio, imagen: p.imagen,
              talle: p.talle || null, qty,
            }],
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
    case 'SET_COUPON':
      return { ...state, coupon: action.payload, couponError: null }
    case 'SET_COUPON_ERROR':
      return { ...state, couponError: action.payload }
    case 'REMOVE_COUPON':
      return { ...state, coupon: null, couponError: null }
    case 'CLEAR':
      return { ...state, items: [], coupon: null, couponError: null }
    case 'HIDE_TOAST':
      return { ...state, toast: { visible: false, productName: null } }
    default: return state
  }
}

// El descuento real lo aplica el backend al hacer checkout.
// Aquí solo calculamos subtotal e itemCount para mostrar en la UI.
function computeTotals(items) {
  const subtotal = items.reduce((s, i) => s + i.precio * i.qty, 0)
  return {
    subtotal,
    discount:  0,
    total:     subtotal,
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

  // Vaciar carrito en auto-logout (401 del interceptor) o logout manual
  useEffect(() => {
    const handler = () => dispatch({ type: 'CLEAR' })
    window.addEventListener('auth:logout', handler)   // 401 → auto-logout
    window.addEventListener('cart:clear',  handler)   // logout manual
    return () => {
      window.removeEventListener('auth:logout', handler)
      window.removeEventListener('cart:clear',  handler)
    }
  }, [])

  const applyCoupon = useCallback(async (code) => {
    const trimmed = (code || '').trim().toUpperCase()
    if (!trimmed) return
    try {
      const descuentos = await discountService.getDescuentosActivos()
      const found = descuentos.find(
        (d) => d.codigo?.toUpperCase() === trimmed && d.estado === 'ACTIVO'
      )
      if (!found) {
        dispatch({ type: 'SET_COUPON_ERROR', payload: `Código "${trimmed}" inválido o vencido` })
        return
      }
      const pct   = found.tipo === 'PORCENTAJE' ? found.porcentaje : 0
      const label = found.tipo === 'PORCENTAJE'
        ? `${found.codigo} · ${pct}% OFF`
        : `${found.codigo} · -$${Number(found.valor).toLocaleString('es-CL')}`
      dispatch({ type: 'SET_COUPON', payload: { ...found, label } })
    } catch (e) {
      dispatch({ type: 'SET_COUPON_ERROR', payload: getErrorMessage(e) })
    }
  }, [])

  const value = {
    items:       state.items,
    coupon:      state.coupon,
    couponError: state.couponError,
    toast:       state.toast,
    totals:      computeTotals(state.items),
    addToCart:      (p)    => dispatch({ type: 'ADD',          payload: p }),
    removeFromCart: (id)   => dispatch({ type: 'REMOVE',       payload: id }),
    updateQty:      (p)    => dispatch({ type: 'UPDATE_QTY',   payload: p }),
    applyCoupon,
    removeCoupon:   ()     => dispatch({ type: 'REMOVE_COUPON' }),
    clearCart:      ()     => dispatch({ type: 'CLEAR' }),
    hideToast:      ()     => dispatch({ type: 'HIDE_TOAST' }),
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  return useContext(CartContext)
}
