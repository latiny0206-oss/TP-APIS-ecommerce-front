import { describe, it, expect, beforeEach, vi } from 'vitest'
import cartReducer, {
  addToCart,
  removeFromCart,
  updateQty,
  setCoupon,
  removeCoupon,
  clearCart,
  selectCartTotals,
  SHIPPING_THRESHOLD,
  SHIPPING_COST,
} from './cartSlice.js'

// localStorage no existe en jsdom con este setup; lo mockeamos para evitar
// que loadSaved() tire en la inicialización del módulo.
vi.stubGlobal('localStorage', {
  getItem:    vi.fn(() => null),
  setItem:    vi.fn(),
  removeItem: vi.fn(),
})

const EMPTY = { items: [], coupon: null, couponError: null, couponStatus: 'idle' }

const PRODUCTO_A = {
  productId:  1,
  varianteId: 10,
  nombre:     'Campera Patagonia',
  precio:     50000,
  imagen:     null,
  talle:      'M',
  qty:        1,
}

const PRODUCTO_B = {
  productId:  2,
  varianteId: 20,
  nombre:     'Botas Trail',
  precio:     80000,
  imagen:     null,
  talle:      '42',
  qty:        1,
}

const CUPON = {
  codigo:      'VERANO10',
  tipo:        'PORCENTAJE',
  valor:       10,
  label:       'VERANO10 · 10% OFF',
}

// Helper: wraps slice state in the Redux root shape expected by selectCartTotals
function storeCart(cartState) {
  return { cart: cartState }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function estadoConProductoA() {
  return cartReducer(EMPTY, addToCart(PRODUCTO_A))
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('cartSlice — reducers', () => {

  describe('addToCart', () => {
    it('agrega un producto nuevo al carrito vacío con cantidad 1', () => {
      const state = cartReducer(EMPTY, addToCart(PRODUCTO_A))
      expect(state.items).toHaveLength(1)
      expect(state.items[0].nombre).toBe('Campera Patagonia')
      expect(state.items[0].qty).toBe(1)
    })

    it('usa varianteId como lineId cuando está presente', () => {
      const state = cartReducer(EMPTY, addToCart(PRODUCTO_A))
      expect(state.items[0].lineId).toBe('v10')
    })

    it('usa productId+talle como lineId cuando no hay varianteId', () => {
      const sinVariante = { ...PRODUCTO_A, varianteId: null }
      const state = cartReducer(EMPTY, addToCart(sinVariante))
      expect(state.items[0].lineId).toBe('p1-M')
    })

    it('incrementa la cantidad si el mismo producto ya existe (no duplica)', () => {
      const conA  = estadoConProductoA()
      const state = cartReducer(conA, addToCart(PRODUCTO_A))
      expect(state.items).toHaveLength(1)
      expect(state.items[0].qty).toBe(2)
    })

    it('agrega como línea separada si es un producto distinto', () => {
      const conA  = estadoConProductoA()
      const state = cartReducer(conA, addToCart(PRODUCTO_B))
      expect(state.items).toHaveLength(2)
    })

    it('respeta qty personalizado al agregar', () => {
      const state = cartReducer(EMPTY, addToCart({ ...PRODUCTO_A, qty: 3 }))
      expect(state.items[0].qty).toBe(3)
    })
  })

  describe('removeFromCart', () => {
    it('elimina el item por su lineId', () => {
      const conA  = estadoConProductoA()
      const state = cartReducer(conA, removeFromCart('v10'))
      expect(state.items).toHaveLength(0)
    })

    it('no afecta otros items cuando elimina uno específico', () => {
      let state = cartReducer(EMPTY, addToCart(PRODUCTO_A))
      state     = cartReducer(state, addToCart(PRODUCTO_B))
      state     = cartReducer(state, removeFromCart('v10'))
      expect(state.items).toHaveLength(1)
      expect(state.items[0].lineId).toBe('v20')
    })
  })

  describe('updateQty', () => {
    it('actualiza la cantidad de un item existente', () => {
      const conA  = estadoConProductoA()
      const state = cartReducer(conA, updateQty({ lineId: 'v10', qty: 5 }))
      expect(state.items[0].qty).toBe(5)
    })

    it('elimina el item cuando qty es 0', () => {
      const conA  = estadoConProductoA()
      const state = cartReducer(conA, updateQty({ lineId: 'v10', qty: 0 }))
      expect(state.items).toHaveLength(0)
    })

    it('elimina el item cuando qty es negativo', () => {
      const conA  = estadoConProductoA()
      const state = cartReducer(conA, updateQty({ lineId: 'v10', qty: -1 }))
      expect(state.items).toHaveLength(0)
    })
  })

  describe('setCoupon / removeCoupon', () => {
    it('aplica un cupón y limpia couponError', () => {
      const conError = { ...EMPTY, couponError: 'código inválido' }
      const state    = cartReducer(conError, setCoupon(CUPON))
      expect(state.coupon).toEqual(CUPON)
      expect(state.couponError).toBeNull()
    })

    it('removeCoupon pone coupon en null', () => {
      const conCupon = cartReducer(EMPTY, setCoupon(CUPON))
      const state    = cartReducer(conCupon, removeCoupon())
      expect(state.coupon).toBeNull()
    })
  })

  describe('clearCart', () => {
    it('vacía items, coupon y couponError', () => {
      let state = cartReducer(EMPTY, addToCart(PRODUCTO_A))
      state     = cartReducer(state, setCoupon(CUPON))
      state     = cartReducer(state, clearCart())
      expect(state.items).toEqual([])
      expect(state.coupon).toBeNull()
      expect(state.couponError).toBeNull()
    })
  })
})

// ─── selectCartTotals ───────────────────────────────────────────────────────

describe('selectCartTotals', () => {
  it('devuelve totales en cero para carrito vacío', () => {
    const t = selectCartTotals(storeCart(EMPTY))
    expect(t.subtotal).toBe(0)
    expect(t.itemCount).toBe(0)
    expect(t.discount).toBe(0)
    expect(t.shipping).toBe(SHIPPING_COST)
    expect(t.total).toBe(SHIPPING_COST)
  })

  it('no cobra envío si el carrito está vacío y subtotal es 0 — SHIPPING_COST applies', () => {
    // Even with 0 subtotal, shipping is charged (0 < threshold)
    const t = selectCartTotals(storeCart(EMPTY))
    expect(t.shipping).toBe(SHIPPING_COST)
  })

  it('calcula subtotal correctamente con múltiples items', () => {
    // 2 x $50.000 + 1 x $80.000 = $180.000 → sobre umbral, envío gratis
    const items = [
      { ...PRODUCTO_A, lineId: 'v10', qty: 2 },
      { ...PRODUCTO_B, lineId: 'v20', qty: 1 },
    ]
    const state = { ...EMPTY, items }
    const t     = selectCartTotals(storeCart(state))
    expect(t.subtotal).toBe(180000)
    expect(t.itemCount).toBe(3)
    expect(t.shipping).toBe(0)   // >= SHIPPING_THRESHOLD
    expect(t.total).toBe(180000)
  })

  it('aplica descuento PORCENTAJE y recalcula envío sobre subtotalConDesc', () => {
    // 1 x $50.000, cupon 10% OFF → subtotalConDesc = $45.000 < $80.000 → envío $10.000
    const items  = [{ ...PRODUCTO_A, lineId: 'v10', qty: 1 }]
    const state  = { ...EMPTY, items, coupon: CUPON }
    const t      = selectCartTotals(storeCart(state))
    expect(t.subtotal).toBe(50000)
    expect(t.discount).toBe(5000)   // 10% de 50000
    expect(t.subtotalConDesc).toBe(45000)
    expect(t.shipping).toBe(SHIPPING_COST)
    expect(t.total).toBe(55000)
  })

  it('aplica descuento FIJO', () => {
    const cuponFijo = { codigo: 'FIJO', tipo: 'FIJO', valor: 8000 }
    const items     = [{ ...PRODUCTO_A, lineId: 'v10', qty: 1 }]
    const state     = { ...EMPTY, items, coupon: cuponFijo }
    const t         = selectCartTotals(storeCart(state))
    expect(t.discount).toBe(8000)
    expect(t.subtotalConDesc).toBe(42000)
    expect(t.shipping).toBe(SHIPPING_COST)
    expect(t.total).toBe(52000)
  })

  it('descuento FIJO no puede exceder el subtotal', () => {
    const cuponFijo = { codigo: 'FIJO', tipo: 'FIJO', valor: 999999 }
    const items     = [{ ...PRODUCTO_A, lineId: 'v10', qty: 1 }]
    const state     = { ...EMPTY, items, coupon: cuponFijo }
    const t         = selectCartTotals(storeCart(state))
    expect(t.subtotalConDesc).toBe(0)
    expect(t.total).toBe(SHIPPING_COST)
  })

  it('envío gratis cuando subtotalConDesc supera el umbral', () => {
    // 2 x $50.000 = $100.000, coupon 10% → $90.000 ≥ $80.000 → gratis
    const items  = [{ ...PRODUCTO_A, lineId: 'v10', qty: 2 }]
    const state  = { ...EMPTY, items, coupon: CUPON }
    const t      = selectCartTotals(storeCart(state))
    expect(t.subtotalConDesc).toBe(90000)
    expect(t.shipping).toBe(0)
    expect(t.total).toBe(90000)
  })
})
