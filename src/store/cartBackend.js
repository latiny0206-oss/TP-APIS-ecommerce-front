import { cartService } from '../api/cartService.js'

// Busca el carrito reutilizable del usuario (ACTIVO o VACIO). Si no existe y
// createIfMissing es true, crea uno. Mismo criterio que usa el checkout.
async function obtenerOCrearCarrito(createIfMissing) {
  const carritos  = await cartService.getCarritos()
  const existente = Array.isArray(carritos)
    ? carritos.find((c) => c.estado === 'ACTIVO' || c.estado === 'VACIO')
    : null
  if (existente) return existente
  if (!createIfMissing) return null

  try {
    return await cartService.crearCarrito()
  } catch (err) {
    // 400 = el backend ya tiene un carrito activo (carrera): reintenta la búsqueda
    if (err.response?.status === 400) {
      const retry = await cartService.getCarritos()
      const found = Array.isArray(retry)
        ? retry.find((c) => c.estado === 'ACTIVO' || c.estado === 'VACIO')
        : null
      if (found) return found
    }
    throw err
  }
}

// Vuelca el snapshot del carrito local al backend en un solo request.
// Las líneas sin varianteId no se pueden persistir (el backend las requiere) y se ignoran.
export async function flushCart(items) {
  const mapped = (items ?? [])
    .filter((i) => i.varianteId)
    .map((i) => ({ idVariante: i.varianteId, cantidad: i.qty }))

  // Sin items y sin carrito previo: no hay nada que sincronizar ni sentido en crear uno.
  const carrito = await obtenerOCrearCarrito(mapped.length > 0)
  if (!carrito) return
  await cartService.sincronizarItems(carrito.id, mapped)
}

// Trae los items del carrito reutilizable del usuario (para recuperarlo al loguearse).
// Devuelve los items crudos del backend (ItemCarritoResponse), o [] si no hay carrito.
export async function loadBackendCart() {
  const carritos = await cartService.getCarritos()
  const activo   = Array.isArray(carritos)
    ? carritos.find((c) => c.estado === 'ACTIVO' || c.estado === 'VACIO')
    : null
  if (!activo) return []
  // findByUsuarioConItems ya trae los items embebidos; si no, se piden aparte.
  return activo.items ?? (await cartService.getItems(activo.id))
}
