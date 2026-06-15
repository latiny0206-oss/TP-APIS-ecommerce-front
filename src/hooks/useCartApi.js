import { useState, useCallback } from 'react'
import { cartService } from '../api/cartService.js'
import { getErrorMessage } from '../api/api.js'

// Hook completo para manejar el carrito contra el backend.
// Requiere un carritoId activo (obtenido al crear o recuperar el carrito).
export function useCartApi(carritoId) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const run = useCallback(async (fn) => {
    setLoading(true)
    setError(null)
    try {
      return await fn()
    } catch (e) {
      setError(getErrorMessage(e))
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  const addItem          = (idVariante, cantidad)      => run(() => cartService.addItem(carritoId, { idVariante, cantidad }))
  const removeItem       = (itemId)                    => run(() => cartService.removeItem(carritoId, itemId))
  const updateCantidad   = (itemId, cantidad)          => run(() => cartService.updateItemCantidad(carritoId, itemId, cantidad))
  const getTotal         = ()                          => run(() => cartService.getTotal(carritoId))
  const checkout         = ()                          => run(() => cartService.checkout(carritoId))
  const vaciar           = ()                          => run(() => cartService.vaciar(carritoId))

  return { addItem, removeItem, updateCantidad, getTotal, checkout, vaciar, loading, error }
}

// Hook para obtener o crear el carrito activo del usuario
export function useCarritoActivo() {
  const [carritoId, setCarritoId] = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)

  const init = useCallback(async (usuarioId, descuentoId) => {
    setLoading(true)
    setError(null)
    try {
      // Intenta obtener un carrito existente
      const carritos = await cartService.getCarritos()
      const activo   = carritos.find((c) => c.estado === 'ACTIVO' || c.estado === 'VACIO')
      if (activo) {
        setCarritoId(activo.id)
        return activo
      }
      // Si no existe, crea uno nuevo
      const nuevo = await cartService.crearCarrito({ usuarioId, descuentoId })
      setCarritoId(nuevo.id)
      return nuevo
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [])

  return { carritoId, init, loading, error }
}
