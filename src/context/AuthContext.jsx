import { createContext, useContext, useReducer, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../api/authService.js'
import { getErrorMessage } from '../api/api.js'

const initialState = {
  user:       null,
  isLoggedIn: false,
  status:     'idle',
  error:      null,
  returnTo:   '/',
}

function authReducer(state, action) {
  switch (action.type) {
    case 'LOADING':       return { ...state, status: 'loading', error: null }
    case 'SUCCESS':       return { ...state, user: action.payload, isLoggedIn: true, status: 'idle', error: null }
    case 'FAILURE':       return { ...state, status: 'error', error: action.payload }
    case 'LOGOUT':        return { ...initialState }
    case 'CLEAR_ERROR':   return { ...state, error: null, status: 'idle' }
    case 'SET_RETURN_TO': return { ...state, returnTo: action.payload }
    default: return state
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const navigate = useNavigate()

  // Restaura sesión desde localStorage al cargar la app
  useEffect(() => {
    const stored = authService.getStoredUser()
    if (stored && authService.isAuthenticated()) {
      dispatch({ type: 'SUCCESS', payload: stored })
    }
  }, [])

  // Logout automático ante 401 (disparado por el interceptor de axios)
  useEffect(() => {
    const handler = () => {
      dispatch({ type: 'LOGOUT' })
      navigate('/login')
    }
    window.addEventListener('auth:logout', handler)
    return () => window.removeEventListener('auth:logout', handler)
  }, [navigate])

  const login = async (username, password) => {
    dispatch({ type: 'LOADING' })
    try {
      const data = await authService.login({ username, password })
      dispatch({ type: 'SUCCESS', payload: {
        id:       data.id,
        username: data.username,
        nombre:   data.nombre,
        email:    data.email,
        rol:      data.rol,
      } })
      navigate(data.rol === 'ADMIN' ? '/admin/dashboard' : (state.returnTo || '/'))
    } catch (e) {
      dispatch({ type: 'FAILURE', payload: getErrorMessage(e) })
    }
  }

  const register = async ({ username, email, password, nombre, apellido }) => {
    dispatch({ type: 'LOADING' })
    try {
      await authService.register({ username, email, password, nombre, apellido })
      navigate('/login')
    } catch (e) {
      dispatch({ type: 'FAILURE', payload: getErrorMessage(e) })
    }
  }

  const logout = () => {
    authService.logout()
    dispatch({ type: 'LOGOUT' })
    // cart:clear limpia el estado React del carrito sin disparar la redirección a /login
    window.dispatchEvent(new Event('cart:clear'))
    navigate('/')
  }

  const value = {
    user:        state.user,
    isLoggedIn:  state.isLoggedIn,
    status:      state.status,
    error:       state.error,
    returnTo:    state.returnTo,
    login,
    register,
    logout,
    clearError:  () => dispatch({ type: 'CLEAR_ERROR' }),
    setReturnTo: (path) => dispatch({ type: 'SET_RETURN_TO', payload: path }),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
