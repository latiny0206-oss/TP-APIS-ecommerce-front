# Slice `cart` — carrito y cupón

Archivo: `Front/src/store/cartSlice.js` · Registrado como `cart` en `store/index.js`

## Qué gestiona

Los items del carrito de compras (que son **100% locales** — no tocan el backend hasta el checkout) y el cupón de descuento, que es lo único asíncrono del slice. También exporta el selector memoizado `selectCartTotals` que calcula subtotal, descuento, envío y total.

## Estado inicial

```js
initialState: {
  items:        saved.items,   // array de líneas del carrito, rehidratado de localStorage
  coupon:       saved.coupon,  // objeto descuento del backend o null, también rehidratado
  couponError:  null,          // string con el mensaje de error del cupón, o null
  couponStatus: 'idle',        // 'idle' | 'loading' — SOLO esos dos valores
}
```

| Campo | Tipo | Quién lo modifica |
|---|---|---|
| `items` | `Array<{lineId, productId, varianteId, nombre, precio, imagen, talle, qty}>` | `addToCart`, `removeFromCart`, `updateQty`, `clearCart` |
| `coupon` | objeto `{id, codigo, tipo, valor, ...}` (la respuesta cruda del backend) o `null` | `applyCoupon.fulfilled`, `setCoupon`, `removeCoupon`, `clearCart` |
| `couponError` | `string \| null` | `applyCoupon.rejected` lo setea; casi todo lo demás lo limpia |
| `couponStatus` | `'idle' \| 'loading'` | `applyCoupon.pending` → `'loading'`; fulfilled y rejected vuelven a `'idle'` |

Detalle importante: `saved` viene de `loadSaved()` (cartSlice.js:8-17), que lee `localStorage.getItem('cumbre_cart')` **en el momento en que se importa el módulo** — por eso el carrito sobrevive a un F5 sin ningún efecto ni thunk de "rehidratación".

## Reducers síncronos

| Reducer | Qué hace exactamente | Quién lo despacha |
|---|---|---|
| `addToCart` | Calcula la clave de línea `lineId` (`v{varianteId}` si hay variante, si no `p{productId}-{talle}`). Si ya existe esa línea suma `qty`; si no, agrega la línea nueva | `ProductoDetalle.jsx:132` — botón "Agregar al carrito" |
| `removeFromCart` | Filtra la línea por `lineId` | `Carrito.jsx:128` — botón "Quitar" |
| `updateQty` | Setea `qty`; si `qty <= 0` **elimina la línea** (no deja cantidades en cero) | `Carrito.jsx:116` y `:122` — botones − / + |
| `setCoupon` | Setea el cupón directo (sin fetch) y limpia error/status | No se usa en vistas hoy; existe para tests y para setear un cupón ya conocido |
| `setCouponError` | Setea el mensaje de error manualmente | Ídem — hoy solo tests |
| `removeCoupon` | `coupon = null`, limpia error y status | `Checkout.jsx:321` — la ✕ del cupón aplicado |
| `clearCart` | Vacía todo: items, cupón, error, status | `Carrito.jsx:50` y `:143` (vaciar), `Checkout.jsx:396` (compra exitosa), `App.jsx:97` (`CartUserCheck`: cambió el usuario logueado) |

## Thunk: `applyCoupon` — y el patrón que comparten todos los thunks del proyecto

```js
// cartSlice.js:23-30 — SIN try/catch (ver "puntos finos")
export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async (code) => {
    const trimmed = (code || '').trim().toUpperCase()
    if (!trimmed) return null
    return await discountService.buscarPorCodigo(trimmed)
  }
)
```

- **Endpoint**: `GET /api/descuentos/buscar?codigo=OTONO2026` (vía `discountService.buscarPorCodigo`, `discountService.js:16`). Requiere JWT (el interceptor de axios lo inyecta).
- **Manda**: el código como query param, normalizado a mayúsculas y sin espacios.
- **Respuesta** (`DescuentoResponse` del backend): `{ id, nombre, codigo, tipo: 'PORCENTAJE'|'FIJO', valor, fechaInicio, fechaFin, estado }`. Se guarda tal cual en `state.cart.coupon`.

**extraReducers** (cartSlice.js:94-112) — este es el patrón que `auth` repite, acá explicado una vez:

`createAsyncThunk` genera automáticamente **tres action types**: `cart/applyCoupon/pending` (al arrancar), `.../fulfilled` (la promesa resolvió) y `.../rejected` (la promesa rechazó). Como esas actions no nacen en `reducers:` del slice, se manejan en `extraReducers`:

```js
.addCase(applyCoupon.pending, (state) => {
  state.couponStatus = 'loading'      // la UI muestra spinner
  state.couponError  = null           // limpia error anterior
})
.addCase(applyCoupon.fulfilled, (state, action) => {
  state.couponStatus = 'idle'
  if (action.payload) {               // guard: payload null = código vacío, se ignora
    state.coupon      = action.payload
    state.couponError = null
  }
})
.addCase(applyCoupon.rejected, (state, action) => {
  state.couponStatus = 'idle'
  state.couponError  = action.error.message ?? 'Error al aplicar el cupón'
})
```

En rejected, `action.error.message` ya trae el mensaje del backend ("No existe un cupón con código: X", "Este cupón está desactivado o expirado") porque el interceptor de axios lo normaliza (`api.js:27`).

Además del thunk, el slice tiene un **extraReducer cross-slice**: escucha `logout` (action del `authSlice`) y vacía el carrito visible al cerrar sesión — cualquiera de las 4 vías de logout (Navbar, Perfil, AdminLayout o el auto-logout por 401) lo dispara sin que esos componentes sepan que el carrito existe. El carrito del backend, asociado al usuario, no se toca.

## Selector memoizado: `selectCartTotals`

`cartSlice.js:116-140`, hecho con `createSelector`. Toma `items` y `coupon` y devuelve `{ subtotal, discount, subtotalConDesc, shipping, total, itemCount }`. Reglas: descuento `PORCENTAJE` = `subtotal * valor / 100` redondeado; `FIJO` = `min(valor, subtotal)`; envío gratis si el **subtotal antes del cupón** ≥ $80.000, si no $10.000 (el cupón no quita el envío gratis ya ganado por monto de compra — misma regla en el backend, `CarritoServiceImpl.realizarCompra`). Al ser memoizado, solo recalcula cuando cambian `items` o `coupon` — un cambio en `toast` o `auth` no lo re-ejecuta.

## Dónde se usa

**useSelector:**
| Componente | Qué lee | Para qué |
|---|---|---|
| `Navbar.jsx:42` | `selectCartTotals.itemCount` | El badge con el número del carrito |
| `Carrito.jsx:13-14` | `items`, `selectCartTotals` | La vista del carrito completa |
| `Checkout.jsx:160-167` | `items`, `selectCartTotals`, `coupon`, `couponError`, `couponStatus === 'loading'` | Resumen del pedido, estado del cupón, spinner del botón |
| `ProductoDetalle.jsx:22` | `items` | Descontar del stock lo que ya está en el carrito |
| `App.jsx:76-77` (`CartPersist`) | `items`, `coupon` | Persistirlos en localStorage en cada cambio |

**dispatch:** ver tablas de reducers arriba; el thunk `applyCoupon` solo se despacha en `Checkout.jsx:313` (botón "Aplicar" del paso 2, y Enter en el input).

## Flujo completo narrado: agregar un producto y aplicar cupón

1. En `ProductoDetalle.jsx`, el usuario elige color/talle. El componente calcula `stockDisponible = stockActual - enCarrito` (línea ~120: lee `state.cart.items` para descontar lo ya agregado) y al click de "Agregar" despacha `addToCart({...})` con `qty` acotado al stock.
2. El reducer `addToCart` suma la línea (o incrementa `qty` si ya estaba). **Dos slices reaccionan a la misma action**: `cart` actualiza items y `toastSlice` (extraReducer) pone `visible: true` → aparece el toast.
3. `CartPersist` (App.jsx:75-86) tiene un `useEffect` con deps `[items, coupon]`: al cambiar items, escribe `localStorage['cumbre_cart']`.
4. `Navbar` re-renderiza el badge porque `selectCartTotals.itemCount` cambió.
5. En `/checkout` paso 2, el usuario escribe `OTONO2026` y toca "Aplicar" → `Checkout.jsx:313` hace `await dispatch(applyCoupon(codigo)).unwrap()`.
6. RTK despacha `pending` → `couponStatus = 'loading'` → el botón muestra spinner (`Checkout.jsx:167`).
7. Axios hace `GET /api/descuentos/buscar?codigo=OTONO2026` con el JWT inyectado.
8. 200 → `fulfilled` → `coupon` poblado → `OrderSummary` muestra la línea de descuento y `selectCartTotals` recalcula el total. 404 → `rejected` → `couponError` con el mensaje del backend, mostrado en rojo bajo el input.
9. Al confirmar la compra (paso 3), `Checkout.jsx` sincroniza todo al backend (crea/recupera carrito, agrega items, re-aplica el cupón con `PUT /carritos/{id}/descuento`, hace el checkout) y al éxito despacha `clearCart()` y navega a `/confirmacion`.

```
ProductoDetalle ──addToCart──▶ cart.items ──▶ Navbar badge / CartPersist → localStorage
                                   │                    ▲
                                   └──(extraReducer)──▶ toast.visible ──▶ <Toast/>
Checkout "Aplicar" ──applyCoupon──▶ pending → GET /descuentos/buscar → fulfilled/rejected
                                   └──▶ coupon / couponError ──▶ OrderSummary re-render
```

## Puntos finos y posibles preguntas trampa

- **¿Por qué no hay try/catch en el thunk?** Lo teníamos y lo sacamos en la auditoría: `createAsyncThunk` ya despacha `.rejected` solo cuando la promesa rechaza. El mensaje amigable se normaliza una única vez en el interceptor (`api.js:27`) y llega por `action.error.message`.
- **El descuento del front es un estimado.** `selectCartTotals` calcula el descuento del lado del cliente para mostrarlo; la cifra que vale es la del backend, que re-aplica el cupón en el checkout (`PUT /carritos/{id}/descuento`) y recalcula el total en `CarritoServiceImpl.calcularTotal`. Si el cupón venció entre que se aplicó y se confirmó, ese PUT falla y el checkout se aborta con un mensaje claro — no se cobra un descuento inválido.
- **Validación de stock: doble capa.** Cliente: `ProductoDetalle` descuenta lo ya carriteado (`stockDisponible`, evita el bypass de agregar dos veces) y `Carrito.jsx:80-82` deshabilita el "+" con `atMax` leyendo el stock desde `ProductsContext`. Servidor: el backend vuelve a validar en `agregarItem` y en `descontarStock` (tira 400 "Sin stock disponible"). Si preguntan "¿y si dos usuarios compran lo último a la vez?": lo resuelve el backend, el front solo mejora la UX.
- **`couponStatus` no tiene `'succeeded'`/`'failed'`**: el éxito es `coupon != null` y el fallo es `couponError != null`; el status solo distingue "hay un fetch en curso" para el spinner.
- **`applyCoupon('')` no es un error**: el thunk devuelve `null` (fulfilled) y el guard `if (action.payload)` del extraReducer lo ignora. Por eso el fulfilled tiene un `if`.
- **`.unwrap()` en Checkout**: convierte el resultado del dispatch en una promesa que rechaza si el thunk falló; el `catch {}` está vacío a propósito porque el error ya quedó en `state.cart.couponError` — la UI lo lee del store, no de la variable local.
- **El logout limpia el carrito por extraReducer, no por dispatch manual**: en vez de despachar `clearCart()` en cada botón de logout (4 lugares), el slice escucha la action `logout` de auth. Si preguntan "¿y si mañana agregan un quinto botón de logout?": funciona solo, porque la limpieza vive en el slice, no en los componentes.
- **Cambio de usuario limpia el carrito**: el thunk de login emite `CustomEvent('auth:login')`; `CartUserCheck` (App.jsx:89-106) compara el id con `localStorage['cumbre_cart_uid']` y si es otro usuario despacha `clearCart()`. Es la segunda capa: la primera es el vaciado al desloguear.
- **lineId con dos formatos** (`v10` vs `p1-M`): productos con variante real usan el id de variante; el fallback por producto+talle existe para items sin variante (que el checkout igual rechaza, porque el backend necesita `varianteId`).

## Resumen de 30 segundos

> "El slice `cart` maneja el carrito y el cupón. El carrito es estado local puro: `addToCart`, `updateQty`, `removeFromCart` y `clearCart` son reducers síncronos, y se persiste en localStorage con un componente `CartPersist` que observa el slice. Lo único asíncrono es el cupón: el thunk `applyCoupon` llama a `GET /descuentos/buscar`, y sus extraReducers manejan `pending` (status `'loading'`), `fulfilled` (guarda el cupón) y `rejected` (guarda el mensaje en `couponError`). Los totales salen de `selectCartTotals`, un selector memoizado con `createSelector`. El backend recién interviene en el checkout, donde se sincroniza todo y se re-valida cupón y stock."
