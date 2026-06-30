import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import cartReducer, { addToCart, setCoupon, loadSaved } from './cartSlice.js'
import toastReducer, { hideToast } from './toastSlice.js'
import authReducer from './authSlice.js'

// ─── Réplica exacta del CartPersist que vive en App.jsx ────────────────────
function CartPersist() {
  const items  = useSelector((state) => state.cart.items)
  const coupon = useSelector((state) => state.cart.coupon)

  useEffect(() => {
    try {
      localStorage.setItem('cumbre_cart', JSON.stringify({ items, coupon }))
    } catch {}
  }, [items, coupon])

  return null
}

function makeStore(preloadedState = {}) {
  return configureStore({
    reducer: { cart: cartReducer, toast: toastReducer, auth: authReducer },
    preloadedState,
  })
}

function renderWithStore(store) {
  render(
    <Provider store={store}>
      <CartPersist />
    </Provider>
  )
}

const CUPON = { codigo: 'PROMO20', tipo: 'PORCENTAJE', valor: 20, label: 'PROMO20 · 20% OFF' }
const PRODUCTO = {
  productId: 1, varianteId: 10, nombre: 'Campera', precio: 50000,
  imagen: null, talle: 'M', qty: 1,
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('CartPersist — persistencia en localStorage', () => {

  let setItemSpy

  beforeEach(() => {
    // vi.spyOn crea un spy sobre el método real de localStorage
    setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {})
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('persiste en localStorage al agregar un item al carrito', () => {
    const store = makeStore()
    renderWithStore(store)

    act(() => { store.dispatch(addToCart(PRODUCTO)) })

    expect(setItemSpy).toHaveBeenCalledWith(
      'cumbre_cart',
      expect.stringContaining('Campera')
    )
  })

  it('persiste en localStorage al aplicar un cupón', () => {
    const store = makeStore()
    renderWithStore(store)

    act(() => { store.dispatch(setCoupon(CUPON)) })

    expect(setItemSpy).toHaveBeenCalledWith(
      'cumbre_cart',
      expect.stringContaining('PROMO20')
    )
  })

  it('NO dispara persistencia cuando cambia el toast (corrección profesora)', () => {
    // Partimos de un carrito con un item para que el efecto haya corrido en el mount
    const store = makeStore({
      cart: { items: [{ lineId: 'v10', productId: 1, varianteId: 10,
                        nombre: 'Campera', precio: 50000, imagen: null,
                        talle: 'M', qty: 1 }],
              coupon: null, couponError: null },
    })
    renderWithStore(store)

    // Reseteamos el spy DESPUÉS del mount para no contar la escritura inicial
    setItemSpy.mockClear()

    // Despachamos una acción que solo afecta al toastSlice
    act(() => { store.dispatch(hideToast()) })

    // localStorage.setItem NO debe haberse llamado
    expect(setItemSpy).not.toHaveBeenCalled()
  })

  it('el JSON persistido contiene exactamente items y coupon', () => {
    const store = makeStore()
    renderWithStore(store)

    act(() => { store.dispatch(addToCart(PRODUCTO)) })
    act(() => { store.dispatch(setCoupon(CUPON)) })

    const lastCall = setItemSpy.mock.calls.at(-1)
    const [key, value] = lastCall
    expect(key).toBe('cumbre_cart')

    const parsed = JSON.parse(value)
    expect(parsed).toHaveProperty('items')
    expect(parsed).toHaveProperty('coupon')
    expect(parsed).not.toHaveProperty('couponError')
    expect(parsed).not.toHaveProperty('toast')
  })
})

// ─── loadSaved — rehidratación ──────────────────────────────────────────────
// loadSaved() es una función pura que llama localStorage.getItem en tiempo de
// ejecución. Al exportarla podemos testearla directamente sin reimportar el módulo.

describe('loadSaved — rehidratación desde localStorage', () => {

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('devuelve estado vacío cuando localStorage no tiene datos', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)
    const result = loadSaved()
    expect(result.items).toEqual([])
    expect(result.coupon).toBeNull()
  })

  it('carga items y coupon correctamente desde localStorage', () => {
    const savedData = JSON.stringify({
      items: [{ lineId: 'v99', productId: 99, varianteId: 99,
                nombre: 'Producto Guardado', precio: 12000,
                imagen: null, talle: null, qty: 2 }],
      coupon: { codigo: 'SAVED', tipo: 'PORCENTAJE', valor: 5, label: 'SAVED · 5% OFF' },
    })
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(savedData)

    const result = loadSaved()

    expect(result.items).toHaveLength(1)
    expect(result.items[0].nombre).toBe('Producto Guardado')
    expect(result.coupon.codigo).toBe('SAVED')
  })

  it('devuelve estado vacío si el JSON en localStorage está corrupto', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('JSON INVALIDO {{{{')
    const result = loadSaved()
    expect(result.items).toEqual([])
    expect(result.coupon).toBeNull()
  })
})
