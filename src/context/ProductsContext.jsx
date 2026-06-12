import { createContext, useContext, useReducer } from 'react'
import { PRODUCTS_SEED } from '../data/index.js'

function reducer(state, action) {
  switch (action.type) {
    case 'UPSERT': {
      const isNew = !state.byId[action.payload.id]
      return {
        byId: { ...state.byId, [action.payload.id]: { ...state.byId[action.payload.id], ...action.payload } },
        ids:  isNew ? [action.payload.id, ...state.ids] : state.ids,
      }
    }
    case 'REMOVE': {
      const { [action.payload]: _, ...byId } = state.byId
      return { byId, ids: state.ids.filter((id) => id !== action.payload) }
    }
    default: return state
  }
}

function init(products) {
  return {
    byId: Object.fromEntries(products.map((p) => [p.id, p])),
    ids:  products.map((p) => p.id),
  }
}

const ProductsContext = createContext(null)

export function ProductsProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, PRODUCTS_SEED, init)

  const value = {
    byId:   state.byId,
    ids:    state.ids,
    upsert: (product) => dispatch({ type: 'UPSERT', payload: product }),
    remove: (id)      => dispatch({ type: 'REMOVE', payload: id }),
  }

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export function useProducts() {
  return useContext(ProductsContext)
}
