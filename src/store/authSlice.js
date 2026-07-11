import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from '../api/authService.js'
import { flushCart } from './cartBackend.js'

// Sin try/catch: createAsyncThunk captura el rechazo y despacha .rejected solo;
// el mensaje del backend llega por action.error.message (normalizado en api.js).
export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ username, password }) => {
    const data = await authService.login({ username, password })
    window.dispatchEvent(new CustomEvent('auth:login', { detail: { id: data.id, rol: data.rol } }))
    return {
      id:       data.id,
      username: data.username,
      nombre:   data.nombre,
      email:    data.email,
      rol:      data.rol,
    }
  }
)

export const registerThunk = createAsyncThunk(
  'auth/register',
  async ({ username, email, password, nombre, apellido }) => {
    const data = await authService.register({ username, email, password, nombre, apellido })
    window.dispatchEvent(new CustomEvent('auth:login', { detail: { id: data.id, rol: data.rol } }))
    return {
      id:         data.id,
      username:   data.username,
      nombre:     data.nombre,
      email:      data.email,
      rol:        data.rol,
      registered: true,
    }
  }
)

// Logout "completo": antes de borrar el token y limpiar el carrito local,
// vuelca el carrito al backend (con el token todavía válido) para poder
// recuperarlo en el próximo login. El flush es best-effort: si falla, el
// logout ocurre igual. NO se usa en el auto-logout por 401 (ahí el token ya
// no sirve): ese camino despacha logout() directo.
export const logoutThunk = createAsyncThunk(
  'auth/logoutFull',
  async (_, { getState, dispatch }) => {
    const state = getState()
    if (state.auth.isLoggedIn && state.cart.items.length > 0) {
      try { await flushCart(state.cart.items) } catch {}
    }
    authService.logout()
    dispatch(logout())
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:         null,
    isLoggedIn:   false,
    status:       'idle',
    error:        null,
    returnTo:     '/',
    initializing: true,
  },
  reducers: {
    sessionRestored(state, action) {
      state.user         = action.payload
      state.isLoggedIn   = true
      state.status       = 'idle'
      state.error        = null
      state.initializing = false
    },
    initDone(state) {
      state.initializing = false
    },
    logout(state) {
      state.user         = null
      state.isLoggedIn   = false
      state.status       = 'idle'
      state.error        = null
      state.returnTo     = '/'
      state.initializing = false
    },
    clearError(state) {
      state.error  = null
      state.status = 'idle'
    },
    setReturnTo(state, action) {
      state.returnTo = action.payload
    },
  },
  extraReducers(builder) {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = 'loading'
        state.error  = null
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.user         = action.payload
        state.isLoggedIn   = true
        state.status       = 'idle'
        state.error        = null
        state.initializing = false
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = 'error'
        state.error  = action.error.message
      })
      .addCase(registerThunk.pending, (state) => {
        state.status = 'loading'
        state.error  = null
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.user         = action.payload
        state.isLoggedIn   = true
        state.status       = 'registered'
        state.error        = null
        state.initializing = false
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.status = 'error'
        state.error  = action.error.message
      })
  },
})

export const { sessionRestored, initDone, logout, clearError, setReturnTo } = authSlice.actions
export default authSlice.reducer
