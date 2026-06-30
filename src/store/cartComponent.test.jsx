import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import cartReducer, { removeFromCart, updateQty } from './cartSlice.js'
import toastReducer from './toastSlice.js'
import authReducer from './authSlice.js'

// Mock de ProductsContext — Carrito.jsx lo usa solo para consultar stock.
// byId vacío → maxStock = Infinity, el botón + nunca se deshabilita.
vi.mock('../context/ProductsContext.jsx', () => ({
  useProducts: () => ({ byId: {}, ids: [], loading: false, error: null }),
}))

import Carrito from '../views/Carrito.jsx'

// ─── Helpers ───────────────────────────────────────────────────────────────

function makeStore(cartItems = []) {
  return configureStore({
    reducer: { cart: cartReducer, toast: toastReducer, auth: authReducer },
    preloadedState: {
      cart: { items: cartItems, coupon: null, couponError: null },
      auth: { user: null, isLoggedIn: false, status: 'idle', error: null,
              returnTo: '/', initializing: false },
    },
  })
}

function renderCarrito(store) {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/carrito']}>
        <Carrito />
      </MemoryRouter>
    </Provider>
  )
}

const ITEMS_PRELOADED = [
  {
    lineId:     'v10',
    productId:  1,
    varianteId: 10,
    nombre:     'Campera Patagonia',
    precio:     50000,
    imagen:     null,
    talle:      'M',
    qty:        2,
  },
  {
    lineId:     'v20',
    productId:  2,
    varianteId: 20,
    nombre:     'Botas Trail',
    precio:     80000,
    imagen:     null,
    talle:      '42',
    qty:        1,
  },
]

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('Carrito — componente con store Redux', () => {

  beforeEach(() => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('muestra mensaje de carrito vacío cuando no hay items', () => {
    const store = makeStore([])
    renderCarrito(store)
    expect(screen.getByText(/Tu carrito está vacío/i)).toBeInTheDocument()
  })

  it('muestra los nombres de los productos cargados en el store', () => {
    const store = makeStore(ITEMS_PRELOADED)
    renderCarrito(store)
    expect(screen.getByText('Campera Patagonia')).toBeInTheDocument()
    expect(screen.getByText('Botas Trail')).toBeInTheDocument()
  })

  it('muestra el itemCount correcto en el encabezado (2 + 1 = 3 unidades)', () => {
    const store = makeStore(ITEMS_PRELOADED)
    renderCarrito(store)
    expect(screen.getByText(/3 unidades/i)).toBeInTheDocument()
  })

  it('despacha removeFromCart al hacer click en el primer "Quitar"', () => {
    const store       = makeStore(ITEMS_PRELOADED)
    const dispatchSpy = vi.spyOn(store, 'dispatch')
    renderCarrito(store)

    const quitarBtns = screen.getAllByText(/Quitar/i)
    fireEvent.click(quitarBtns[0])

    expect(dispatchSpy).toHaveBeenCalledWith(removeFromCart('v10'))
  })

  it('el state del store se actualiza al eliminar un item', () => {
    const store = makeStore(ITEMS_PRELOADED)
    renderCarrito(store)

    const quitarBtns = screen.getAllByText(/Quitar/i)
    fireEvent.click(quitarBtns[0])

    const { items } = store.getState().cart
    expect(items).toHaveLength(1)
    expect(items[0].nombre).toBe('Botas Trail')
  })

  it('despacha updateQty al incrementar la cantidad del primer item', () => {
    const store       = makeStore(ITEMS_PRELOADED)
    const dispatchSpy = vi.spyOn(store, 'dispatch')
    renderCarrito(store)

    // Navega desde el span de cantidad "2" (Campera, qty=2) hasta el botón "+"
    // Estructura: <div.inline-flex> <button>-</button> <span>2</span> <button>+</button> </div>
    const qtySpans = screen.getAllByText('2')
    const qtySpan  = qtySpans.find(
      (el) => el.tagName === 'SPAN' && el.className.includes('tabular-nums')
    )
    // El botón "+" es el último hijo del grupo de controles
    const controlGroup = qtySpan.parentElement
    const plusBtn      = controlGroup.querySelectorAll('button')[1]
    fireEvent.click(plusBtn)

    expect(dispatchSpy).toHaveBeenCalledWith(
      updateQty({ lineId: 'v10', qty: 3 })
    )
  })
})
