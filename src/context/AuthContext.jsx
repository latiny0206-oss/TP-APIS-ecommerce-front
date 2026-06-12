import { createContext, useContext, useReducer } from 'react'
import { MOCK_USERS } from '../mocks/data.js'

const initialState = {
  user:       null,
  isLoggedIn: false,
  status:     'idle',
  error:      null,
  returnTo:   'home',
}

function authReducer(state, action) {
  switch (action.type) {
    case 'LOADING':      return { ...state, status: 'loading', error: null }
    case 'SUCCESS':      return { ...state, user: action.payload, isLoggedIn: true, status: 'idle', error: null }
    case 'FAILURE':      return { ...state, status: 'error', error: action.payload }
    case 'LOGOUT':       return { ...initialState }
    case 'CLEAR_ERROR':  return { ...state, error: null, status: 'idle' }
    case 'SET_RETURN_TO': return { ...state, returnTo: action.payload }
    default: return state
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  const login = async (email, password, navigate) => {
    dispatch({ type: 'LOADING' })
    await new Promise((r) => setTimeout(r, 600))
    const user = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    if (!user) {
      dispatch({ type: 'FAILURE', payload: 'Email o contraseña incorrectos' })
      return
    }
    const { password: _, ...safeUser } = user
    dispatch({ type: 'SUCCESS', payload: safeUser })
    navigate(safeUser.rol === 'admin' ? 'admin-dashboard' : (state.returnTo || 'home'))
  }

  const register = async ({ nombre, email, password }, navigate) => {
    dispatch({ type: 'LOADING' })
    await new Promise((r) => setTimeout(r, 600))
    if (MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      dispatch({ type: 'FAILURE', payload: 'Ya existe una cuenta con ese email' })
      return
    }
    dispatch({ type: 'SUCCESS', payload: { id: Date.now(), nombre, email } })
    navigate('home')
  }

  const value = {
    user:        state.user,
    isLoggedIn:  state.isLoggedIn,
    status:      state.status,
    error:       state.error,
    returnTo:    state.returnTo,
    login,
    register,
    logout:      ()     => dispatch({ type: 'LOGOUT' }),
    clearError:  ()     => dispatch({ type: 'CLEAR_ERROR' }),
    setReturnTo: (view) => dispatch({ type: 'SET_RETURN_TO', payload: view }),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
