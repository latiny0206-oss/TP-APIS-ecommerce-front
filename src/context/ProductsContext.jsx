import { createContext, useContext, useReducer, useEffect, useCallback, useMemo, useRef } from 'react'
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
      productService.getAllFotos().catch(() => []),
    ]).then(([productos, variantes, fotos]) => {
      const variantesByProducto = variantes.reduce((acc, v) => {
        const pid = v.productoId
        if (pid) {
          acc[pid] = acc[pid] ?? []
          acc[pid].push(v)
        }
        return acc
      }, {})

      // Agrupa fotos por varianteId y ordena por campo 'orden'
      const fotosByVariante = fotos.reduce((acc, f) => {
        if (f.varianteId) {
          acc[f.varianteId] = acc[f.varianteId] ?? []
          acc[f.varianteId].push(f)
        }
        return acc
      }, {})

      const normalized = productos.map((p) => {
        const vars = variantesByProducto[p.id] ?? []
        const n    = productService.normalizeProducto(p, vars)
        let mainImageSet = false
        for (const v of vars) {
          const fotosVar = (fotosByVariante[v.id] ?? [])
            .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
          v.fotos = fotosVar
          if (fotosVar.length > 0 && !mainImageSet) {
            n.imagen = productService.buildImageSrc(fotosVar[0])
            mainImageSet = true
          }
        }
        return n
      })
      dispatch({ type: 'SET_ALL', payload: normalized })
    }).catch((e) => {
      dispatch({ type: 'SET_ERROR', payload: getErrorMessage(e) })
    })
  }, [])

  // Guard: StrictMode monta el provider dos veces en dev; sin esto el fetch
  // inicial (productos + variantes + fotos) se duplicaría. reload() no se ve afectado.
  const didInit = useRef(false)
  useEffect(() => {
    if (didInit.current) return
    didInit.current = true
    load()
  }, [load])

  const upsert = useCallback((product) => dispatch({ type: 'UPSERT', payload: product }), [])
  const remove = useCallback((id)      => dispatch({ type: 'REMOVE', payload: id }),      [])

  const value = useMemo(() => ({
    byId:    state.byId,
    ids:     state.ids,
    loading: state.loading,
    error:   state.error,
    reload:  load,
    upsert,
    remove,
  }), [state.byId, state.ids, state.loading, state.error, load, upsert, remove])

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export function useProducts() {
  return useContext(ProductsContext)
}
