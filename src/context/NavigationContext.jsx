import { createContext, useContext, useReducer, useEffect } from 'react'

const KNOWN_VIEWS = new Set([
  'home', 'indumentaria', 'calzado', 'equipamiento', 'accesorios', 'catalogo',
  'producto', 'carrito', 'checkout', 'contacto', 'faq', 'perfil', 'guia-tallas',
  'login', 'registro',
  'admin-dashboard', 'admin-products', 'admin-photos', 'admin-variants',
  'admin-catalog', 'admin-discounts', 'admin-orders', 'admin-users',
])

function viewFromPath() {
  const segment = window.location.pathname.replace(/^\//, '').split('/')[0]
  return segment && KNOWN_VIEWS.has(segment) ? segment : 'home'
}

function reducer(state, action) {
  const { payload } = action
  return {
    currentView: typeof payload === 'string' ? payload : payload.view,
    params:      typeof payload === 'string' ? {} : (payload.params || {}),
  }
}

const NavigationContext = createContext(null)

export function NavigationProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, {
    currentView: viewFromPath(),
    params: {},
  })

  useEffect(() => {
    const path = state.currentView === 'home' ? '/' : `/${state.currentView}`
    window.history.replaceState({ view: state.currentView, params: {} }, '', path)

    const handlePopState = (e) => {
      dispatch({ payload: { view: e.state?.view || 'home', params: e.state?.params || {} } })
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, []) // eslint-disable-line

  const navigate = (payload, options = {}) => {
    dispatch({ payload })
    const view   = typeof payload === 'string' ? payload : payload.view
    const params = typeof payload === 'object'  ? (payload.params ?? {}) : {}
    const path   = view === 'home' ? '/' : `/${view}`
    if (window.location.pathname !== path) {
      if (options.replace) {
        window.history.replaceState({ view, params }, '', path)
      } else {
        window.history.pushState({ view, params }, '', path)
      }
    }
  }

  const navigateSilent = (payload) => dispatch({ payload })

  return (
    <NavigationContext.Provider value={{ view: state.currentView, params: state.params, navigate, navigateSilent }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  return useContext(NavigationContext)
}
