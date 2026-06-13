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

// Lee parámetros persistidos en la query string (?id=1001) para sobrevivir recargas de página
function paramsFromUrl() {
  const id = new URLSearchParams(window.location.search).get('id')
  return id !== null ? { id: Number(id) } : {}
}

// Construye la URL completa incluyendo el query param de id cuando aplica
function buildPath(view, params) {
  const base = view === 'home' ? '/' : `/${view}`
  return params?.id != null ? `${base}?id=${params.id}` : base
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
    params: paramsFromUrl(),
  })

  useEffect(() => {
    const path = buildPath(state.currentView, state.params)
    window.history.replaceState({ view: state.currentView, params: state.params }, '', path)

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
    const path   = buildPath(view, params)
    // Comparar la URL completa (pathname + search) para detectar cambios de producto
    if (window.location.pathname + window.location.search !== path) {
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
