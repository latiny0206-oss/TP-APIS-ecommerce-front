import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { productService } from '../api/productService.js'
import { getErrorMessage } from '../api/api.js'

function reducer(state, action) {
  switch (action.type) {
    case 'LOADING':  return { ...state, loading: true, error: null }
    case 'SET_ALL': {
      const byId = Object.fromEntries(action.payload.map((p) => [p.id, p]))
      return { byId, ids: action.payload.map((p) => p.id), loading: false, error: null }
    }
    case 'SET_ERROR': return { ...state, loading: false, error: action.payload }
    case 'UPSERT': {
      const isNew = !state.byId[action.payload.id]
      return {
        ...state,
        byId: { ...state.byId, [action.payload.id]: { ...state.byId[action.payload.id], ...action.payload } },
        ids:  isNew ? [action.payload.id, ...state.ids] : state.ids,
      }
    }
    case 'REMOVE': {
      const { [action.payload]: _, ...byId } = state.byId
      return { ...state, byId, ids: state.ids.filter((id) => id !== action.payload) }
    }
    default: return state
  }
}

const ProductsContext = createContext(null)

export function ProductsProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { byId: {}, ids: [], loading: true, error: null })

  const load = useCallback(() => {
    dispatch({ type: 'LOADING' })
    Promise.all([
      productService.getProductos(),
      productService.getVariantes(),
    ]).then(([productos, variantes]) => {
      const variantesByProducto = variantes.reduce((acc, v) => {
        const pid = v.idProducto ?? v.productoId
        if (pid) {
          acc[pid] = acc[pid] ?? []
          acc[pid].push(v)
        }
        return acc
      }, {})

      const normalized = productos.map((p) =>
        productService.normalizeProducto(p, variantesByProducto[p.id] ?? [])
      )
      dispatch({ type: 'SET_ALL', payload: normalized })
    }).catch((e) => {
      dispatch({ type: 'SET_ERROR', payload: getErrorMessage(e) })
    })
  }, [])

  useEffect(() => { load() }, [load])

  const value = {
    byId:    state.byId,
    ids:     state.ids,
    loading: state.loading,
    error:   state.error,
    reload:  load,
    upsert:  (product) => dispatch({ type: 'UPSERT', payload: product }),
    remove:  (id)      => dispatch({ type: 'REMOVE', payload: id }),
  }

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export function useProducts() {
  return useContext(ProductsContext)
}
