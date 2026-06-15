// Ejemplo: flujo completo Carrito → Checkout → Orden
// Integra useCarritoActivo + useCartApi en un solo componente
import { useEffect, useState } from 'react'
import { useNavigate }          from 'react-router-dom'
import { useAuth }              from '../context/AuthContext.jsx'
import { useCarritoActivo, useCartApi } from '../hooks/useCartApi.js'

export function CheckoutFlow({ variante }) {
  const { user } = useAuth()
  const navigate  = useNavigate()

  const { carritoId, init, loading: initLoading } = useCarritoActivo()
  const { addItem, checkout, loading, error }      = useCartApi(carritoId)

  const [orden, setOrden] = useState(null)

  // Inicializa (recupera o crea) el carrito del usuario al montar
  useEffect(() => {
    if (user) init(user.id)
  }, [user, init])

  const handleAddToCart = async () => {
    if (!carritoId) return
    await addItem(variante.id, 1)
    alert(`"${variante.nombre}" agregado al carrito`)
  }

  const handleCheckout = async () => {
    if (!carritoId) return
    try {
      const ordenResponse = await checkout()
      setOrden(ordenResponse)
      navigate(`/confirmacion/${ordenResponse.id}`)
    } catch {
      // error ya capturado en el hook
    }
  }

  if (initLoading) return <p>Preparando carrito…</p>

  return (
    <div>
      <button onClick={handleAddToCart} disabled={loading || !carritoId}>
        Agregar al carrito
      </button>

      <button onClick={handleCheckout} disabled={loading || !carritoId}>
        Confirmar compra
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {orden && <p>Orden #{orden.id} creada. Total: ${orden.total}</p>}
    </div>
  )
}
