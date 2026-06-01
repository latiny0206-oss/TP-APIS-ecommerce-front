import { createSlice } from '@reduxjs/toolkit'
import { MOCK_USERS } from '../mocks/data.js'
import { navigate }   from './navigationSlice.js'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:       null,
    isLoggedIn: false,
    status:     'idle',   // idle | loading | error
    error:      null,
    returnTo:   'home',
  },
  reducers: {
    loginSuccess(state, { payload }) {
      state.user       = payload
      state.isLoggedIn = true
      state.status     = 'idle'
      state.error      = null
    },
    loginFailure(state, { payload }) {
      state.status = 'error'
      state.error  = payload
    },
    setLoading(state) {
      state.status = 'loading'
      state.error  = null
    },
    logout(state) {
      state.user       = null
      state.isLoggedIn = false
      state.status     = 'idle'
      state.error      = null
    },
    clearError(state) {
      state.error  = null
      state.status = 'idle'
    },
    setReturnTo(state, { payload }) {
      state.returnTo = payload
    },
  },
})

export const { loginSuccess, loginFailure, setLoading, logout, clearError, setReturnTo } = authSlice.actions

// ─── Thunks ───────────────────────────────────────────────────────────────────
export function loginThunk(email, password) {
  return async (dispatch, getState) => {
    dispatch(setLoading())
    await new Promise((r) => setTimeout(r, 600))
    const user = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    if (!user) {
      dispatch(loginFailure('Email o contraseña incorrectos'))
      return
    }
    const { password: _, ...safeUser } = user
    dispatch(loginSuccess(safeUser))
    const returnTo = getState().auth.returnTo || 'home'
    dispatch(navigate(returnTo))
  }
}

export function registerThunk({ nombre, email, password }) {
  return async (dispatch) => {
    dispatch(setLoading())
    await new Promise((r) => setTimeout(r, 600))
    // Verificar si el email ya existe
    const exists = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (exists) {
      dispatch(loginFailure('Ya existe una cuenta con ese email'))
      return
    }
    const newUser = { id: Date.now(), nombre, email }
    dispatch(loginSuccess(newUser))
    dispatch(navigate('home'))
  }
}

export default authSlice.reducer
