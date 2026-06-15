import { useState, useEffect, useCallback } from 'react'
import { productService } from '../api/productService.js'
import { getErrorMessage } from '../api/api.js'

// Genérico: fetches data on mount (o cuando cambia la key)
function useFetch(fetcher, deps = []) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await fetcher())
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => { load() }, [load])

  return { data, loading, error, reload: load }
}

export function useProductos() {
  return useFetch(() => productService.getProductos())
}

export function useCategorias() {
  return useFetch(() => productService.getCategorias())
}

export function useMarcas() {
  return useFetch(() => productService.getMarcas())
}

export function useProductosByCategoria(categoriaId) {
  return useFetch(() => productService.getProductosByCategoria(categoriaId), [categoriaId])
}

export function useVariante(varianteId) {
  return useFetch(() => productService.getVariante(varianteId), [varianteId])
}

export function useFotosVariante(varianteId) {
  return useFetch(() => productService.getFotosByVariante(varianteId), [varianteId])
}
