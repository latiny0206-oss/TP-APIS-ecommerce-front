import { useState, useEffect, useCallback } from 'react'
import { orderService } from '../api/orderService.js'
import { getErrorMessage } from '../api/api.js'

// userId = number  → GET /ordenes/usuario/:userId  (usuario propio)
// userId = undefined (sin arg) → GET /ordenes          (admin, todos)
// userId = null  → no fetch (sesión sin id, mostrar error en UI)
export function useOrdenes(userId) {
  const [ordenes, setOrdenes] = useState([])
  const [loading, setLoading] = useState(userId !== null)
  const [error,   setError]   = useState(
    userId === null ? 'No se encontró tu ID de usuario. Por favor, cerrá sesión y volvé a ingresar.' : null
  )

  const load = useCallback(async () => {
    if (userId === null) return
    setLoading(true)
    setError(null)
    try {
      const data = userId !== undefined
        ? await orderService.getOrdenesByUser(userId)
        : await orderService.getOrdenes()
      setOrdenes(data)
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { load() }, [load])

  const confirmar = async (id) => {
    await orderService.confirmar(id)
    await load()
  }

  const cancelar = async (id) => {
    await orderService.cancelar(id)
    await load()
  }

  return { ordenes, loading, error, reload: load, confirmar, cancelar }
}

export function useOrden(id) {
  const [orden,   setOrden]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    orderService.getOrden(id)
      .then(setOrden)
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [id])

  return { orden, loading, error }
}
