import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from '../api/authService.js'
import { getErrorMessage } from '../api/api.js'

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const data = await authService.login({ username, password })
      window.dispatchEvent(new CustomEvent('auth:login', { detail: { id: data.id } }))
      return {
        id:       data.id,
        username: data.username,
        nombre:   data.nombre,
        email:    data.email,
        rol:      data.rol,
      }
    } catch (e) {
      return rejectWithValue(getErrorMessage(e))
    }
  }
)

export const registerThunk = createAsyncThunk(
  'auth/register',
  async ({ username, email, password, nombre, apellido }, { rejectWithValue }) => {
    try {
      const data = await authService.register({ username, email, password, nombre, apellido })
      window.dispatchEvent(new CustomEvent('auth:login', { detail: { id: data.id } }))
      return {
        id:         data.id,
        username:   data.username,
        nombre:     data.nombre,
        email:      data.email,
        rol:        data.rol,
        registered: true,
      }
    } catch (e) {
      return rejectWithValue(getErrorMessage(e))
    }
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
        state.error  = action.payload
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
        state.error  = action.payload
      })
  },
})

export const { sessionRestored, initDone, logout, clearError, setReturnTo } = authSlice.actions
export default authSlice.reducer
