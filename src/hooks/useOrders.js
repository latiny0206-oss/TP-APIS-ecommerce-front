import { useState, useEffect, useCallback } from 'react'
import { orderService } from '../api/orderService.js'
import { getErrorMessage } from '../api/api.js'

// Cache de órdenes a nivel de módulo
let cachedOrdersByUserId = {}
let cachedOrdersPromiseByUserId = {}
let cachedAllOrders = null
let cachedAllOrdersPromise = null
let cachedIndividualOrders = {}

// Limpieza de caché al cambiar la sesión
if (typeof window !== 'undefined') {
  const clearAllCaches = () => {
    cachedOrdersByUserId = {}
    cachedOrdersPromiseByUserId = {}
    cachedAllOrders = null
    cachedAllOrdersPromise = null
    cachedIndividualOrders = {}
  }
  window.addEventListener('auth:logout', clearAllCaches)
  window.addEventListener('auth:login', clearAllCaches)
}

// userId = number  → GET /ordenes/usuario/:userId  (usuario propio)
// userId = undefined (sin arg) → GET /ordenes          (admin, todos)
// userId = null  → no fetch (sesión sin id, mostrar error en UI)
export function useOrdenes(userId) {
  const cacheKey = userId !== undefined ? String(userId) : 'all'
  
  const [ordenes, setOrdenes] = useState(() => {
    if (cacheKey === 'all') return cachedAllOrders || []
    return cachedOrdersByUserId[cacheKey] || []
  })

  const hasCache = cacheKey === 'all'
    ? cachedAllOrders !== null
    : cachedOrdersByUserId[cacheKey] !== undefined

  const [loading, setLoading] = useState(userId !== null && !hasCache)
  const [error,   setError]   = useState(
    userId === null ? 'No se encontró tu ID de usuario. Por favor, cerrá sesión y volvé a ingresar.' : null
  )

  const load = useCallback(async (forceRefresh = false) => {
    if (userId === null) return
    const key = userId !== undefined ? String(userId) : 'all'

    // Retornar caché si existe y no se fuerza recarga
    if (!forceRefresh) {
      if (key === 'all' && cachedAllOrders !== null) {
        setOrdenes(cachedAllOrders)
        setLoading(false)
        return
      } else if (key !== 'all' && cachedOrdersByUserId[key] !== undefined) {
        setOrdenes(cachedOrdersByUserId[key])
        setLoading(false)
        return
      }
    }

    setLoading(true)
    setError(null)
    try {
      let promise
      if (key === 'all') {
        if (forceRefresh || !cachedAllOrdersPromise) {
          cachedAllOrdersPromise = orderService.getOrdenes()
        }
        promise = cachedAllOrdersPromise
      } else {
        if (forceRefresh || !cachedOrdersPromiseByUserId[key]) {
          cachedOrdersPromiseByUserId[key] = orderService.getOrdenesByUser(userId)
        }
        promise = cachedOrdersPromiseByUserId[key]
      }

      const data = await promise
      if (key === 'all') {
        cachedAllOrders = data
      } else {
        cachedOrdersByUserId[key] = data
      }
      setOrdenes(data)
    } catch (e) {
      setError(getErrorMessage(e))
      if (key === 'all') {
        cachedAllOrdersPromise = null
      } else {
        delete cachedOrdersPromiseByUserId[key]
      }
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { load() }, [load])

  const confirmar = async (id) => {
    await orderService.confirmar(id)
    // Limpiar caché de orden individual afectada
    delete cachedIndividualOrders[id]
    if (userId !== undefined) {
      delete cachedOrdersByUserId[String(userId)]
      delete cachedOrdersPromiseByUserId[String(userId)]
    } else {
      cachedAllOrders = null
      cachedAllOrdersPromise = null
    }
    await load(true)
  }

  const cancelar = async (id) => {
    await orderService.cancelar(id)
    // Limpiar caché de orden individual afectada
    delete cachedIndividualOrders[id]
    if (userId !== undefined) {
      delete cachedOrdersByUserId[String(userId)]
      delete cachedOrdersPromiseByUserId[String(userId)]
    } else {
      cachedAllOrders = null
      cachedAllOrdersPromise = null
    }
    await load(true)
  }

  return { ordenes, loading, error, reload: () => load(true), confirmar, cancelar }
}

export function useOrden(id) {
  const [orden,   setOrden]   = useState(() => {
    if (cachedIndividualOrders[id]) return cachedIndividualOrders[id]
    
    // Intentar buscar en la caché de las listas de órdenes existentes
    for (const list of Object.values(cachedOrdersByUserId)) {
      const found = list.find(o => String(o.id) === String(id))
      if (found) return found
    }
    if (cachedAllOrders) {
      const found = cachedAllOrders.find(o => String(o.id) === String(id))
      if (found) return found
    }
    return null
  })

  const [loading, setLoading] = useState(() => {
    const hasData = !!(
      cachedIndividualOrders[id] ||
      Object.values(cachedOrdersByUserId).some(list => list.some(o => String(o.id) === String(id))) ||
      (cachedAllOrders && cachedAllOrders.some(o => String(o.id) === String(id)))
    )
    return !hasData
  })
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!id) return

    const cached = cachedIndividualOrders[id] || 
      Object.values(cachedOrdersByUserId).flatMap(list => list).find(o => String(o.id) === String(id)) ||
      (cachedAllOrders && cachedAllOrders.find(o => String(o.id) === String(id)))

    if (cached) {
      setOrden(cached)
      setLoading(false)
      return
    }

    setLoading(true)
    orderService.getOrden(id)
      .then((data) => {
        cachedIndividualOrders[id] = data
        setOrden(data)
      })
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [id])

  return { orden, loading, error }
}
