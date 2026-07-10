# Slice `cart` — carrito y cupón

Archivo: `Front/src/store/cartSlice.js` · Registrado como `cart` en `store/index.js`

## Qué gestiona

Los items del carrito de compras y el cupón de descuento. Durante la navegación los items son **estado local** (Redux + localStorage), sin tocar el backend por cada interacción; el backend se sincroniza **solo en los bordes de la sesión** (al ocultar/cerrar la pestaña y en el logout) para poder recuperar el carrito al re-loguearse — ver "¿Se recuperan los productos…?". El cupón es lo único asíncrono del slice. También exporta el selector memoizado `selectCartTotals` que calcula subtotal, descuento, envío y total.

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

## ¿Dónde vive el carrito? — Front vs Back (ciclo de vida completo)

El carrito del proyecto tiene **dos vidas independientes**: una en el front y otra en el back. Entender cuándo existe cada una es clave para la defensa.

### Carrito del FRONT (Redux + localStorage)

El carrito que ve el usuario mientras navega es **100% estado local del navegador**. No existe en el backend. Se almacena en dos lugares simultáneos:

1. **Redux store** (`state.cart.items` y `state.cart.coupon`): es la fuente de verdad en memoria. Todos los componentes leen de acá con `useSelector`.
2. **localStorage** (clave `cumbre_cart`): es la copia persistente. El componente invisible `CartPersist` (App.jsx:77-88) observa el store con `useSelector` y cada vez que `items` o `coupon` cambian, escribe `localStorage.setItem('cumbre_cart', JSON.stringify({ items, coupon }))`.

**¿Cómo sobrevive a un F5?** Cuando el módulo `cartSlice.js` se importa, la función `loadSaved()` (línea 8-17) lee `localStorage['cumbre_cart']` y lo usa como `initialState`. No hay thunk ni efecto de "rehidratación" — sucede sincrónicamente en la carga del módulo.

```
Usuario agrega producto
        │
        ▼
  dispatch(addToCart(...))      ← useDispatch (ProductoDetalle.jsx:132)
        │
        ▼
  Redux: state.cart.items se actualiza (reducer síncrono)
        │
        ├──▶ useSelector en Navbar → re-render del badge
        ├──▶ useSelector en Carrito → re-render de la vista
        └──▶ useSelector en CartPersist → useEffect → localStorage.setItem(...)
                                                            │
                                                            ▼
                                                     F5 → loadSaved() lee localStorage
                                                            │
                                                            ▼
                                                     initialState rehidratado ✓
```

### Carrito del BACK (MySQL, asociado al usuario)

El backend tiene su propia entidad `Carrito` en base de datos (tabla `carritos`), con estados `VACIO`, `ACTIVO`, `CONVERTIDO` y `ABANDONADO`. Este carrito **solo se crea/manipula en el momento del checkout** — cuando el usuario confirma la compra.

La secuencia en `Checkout.jsx:confirmar()` (líneas 348-400) es:

1. `obtenerOCrearCarrito()` — busca un carrito ACTIVO o VACIO del usuario en el backend (`GET /api/carritos` — el backend filtra por el usuario del JWT), o crea uno nuevo (`POST /api/carritos`).
2. `cartService.vaciar(carritoId)` — vacía el carrito backend para evitar mezcla con items de una sesión anterior.
3. `cartService.addItem(carritoId, {...})` — agrega cada item del carrito local (Redux) al carrito del backend, **uno por uno en paralelo** con `Promise.allSettled`. Acá el backend valida stock (`CarritoServiceImpl.agregarItem`, línea 120-156).
4. `cartService.aplicarCupon(carritoId, codigo)` — si hay cupón en Redux, lo aplica al carrito backend (`PUT /carritos/{id}/descuento`). Acá el backend re-valida vigencia (`aplicarDescuentoPorCodigo`, línea 441-454).
5. `cartService.checkout(carritoId, datos)` — crea la `Orden`, descuenta stock, cambia el carrito a `CONVERTIDO` y envía email.
6. `dispatch(clearCart())` — limpia Redux y por efecto también localStorage.

### ¿Se recuperan los productos al volver a iniciar sesión?

**SÍ. El carrito se persiste en el backend y se recupera al re-loguearse.** El mecanismo evita golpear al backend en cada cambio: sincroniza **solo en los bordes de la sesión**.

- **Volcado (front → back)**: el componente invisible `CartBackendSync` (App.jsx:95-161) vuelca el snapshot del carrito al backend con `PUT /api/carritos/{id}/items` (reemplazo atómico de todos los items en un solo request) cuando el usuario **"se va"**: al ocultar/cerrar la pestaña (`visibilitychange` → `hidden`, `pagehide`) y en el **logout manual** (vía `logoutThunk`, con el token todavía válido). Solo vuelca si el carrito **cambió** desde el último volcado (dirty-check por snapshot serializado). Durante la compra activa: **cero llamadas al backend**.
- **Recuperación (back → front)**: al iniciar sesión (evento `auth:login`, login o registro frescos — **no** en un refresh), `CartBackendSync` llama a `loadBackendCart()` (`GET /api/carritos` → carrito ACTIVO/VACIO con sus items) y despacha `hydrateItems`, que **fusiona** los items del backend con lo que hubiera local (suma cantidades por `lineId`, sin disparar el toast).

Decisiones de diseño detrás de esto:
- **No se sincroniza en cada inserción**: el carrito local sigue siendo rápido (sin network por interacción); el backend se toca ~una vez por "ráfaga de compra", al irse.
- **Reemplazo atómico** (`PUT .../items`) en vez de `vaciar` + N `POST`: un solo round-trip, con rollback si algún item falla validación de stock.
- **Hidratar solo en login fresco, no en refresh**: en un F5 el localStorage ya tiene la verdad; hidratar ahí duplicaría cantidades.
- **El auto-logout por 401 NO vuelca** (el token ya no sirve): ese camino despacha `logout()` directo. En ese caso el localStorage del mismo navegador conserva el carrito.

```
┌──────────────────────── FRONT ────────────────────────┐     ┌──────── BACK ────────┐
│                                                        │     │                      │
│  Redux store ◄──useSelector──► Componentes             │     │  Base de datos        │
│    state.cart.items                                     │     │    tabla carritos     │
│    state.cart.coupon                                    │     │    tabla items_carrito│
│        │                                               │     │         ▲             │
│        ▼                                               │     │         │             │
│  CartPersist ──useEffect──► localStorage['cumbre_cart'] │     │         │             │
│        ▲                          │                    │     │         │             │
│        │                          ▼                    │     │         │             │
│   loadSaved() ◄── lee al cargar módulo                 │     │         │             │
│                                                        │     │         │             │
│  ══════════════════════════════════════════════════     │     │         │             │
│  CHECKOUT (único momento de sincronización)             │────▶│  crear/vaciar/items  │
│    confirmar() → crea carrito backend                  │     │  cupón/checkout       │
│              → agrega items del Redux                  │     │    → Orden            │
│              → aplica cupón                            │     │    → descontar stock  │
│              → checkout                                │     │    → estado CONVERTIDO│
│              → dispatch(clearCart())                    │     │                      │
└────────────────────────────────────────────────────────┘     └──────────────────────┘
```

## Reducers síncronos

| Reducer | Qué hace exactamente | Quién lo despacha |
|---|---|---|
| `addToCart` | Calcula la clave de línea `lineId` (`v{varianteId}` si hay variante, si no `p{productId}-{talle}`). Si ya existe esa línea suma `qty`; si no, agrega la línea nueva | `ProductoDetalle.jsx:132` — botón "Agregar al carrito" |
| `removeFromCart` | Filtra la línea por `lineId` | `Carrito.jsx:131` — botón "Quitar" |
| `updateQty` | Setea `qty`; si `qty <= 0` **elimina la línea** (no deja cantidades en cero) | `Carrito.jsx:119` y `:125` — botones − / + |
| `setCoupon` | Setea el cupón directo (sin fetch) y limpia error/status | No se usa en vistas hoy; existe para tests y para setear un cupón ya conocido |
| `setCouponError` | Setea el mensaje de error manualmente | Ídem — hoy solo tests |
| `removeCoupon` | `coupon = null`, limpia error y status | `Checkout.jsx:321` — la ✕ del cupón aplicado |
| `clearCart` | Vacía todo: items, cupón, error, status | `Carrito.jsx:51` y `:146` (vaciar), `Checkout.jsx:396` (compra exitosa), `App.jsx:172` (`CartUserCheck`: cambió el usuario logueado) |
| `hydrateItems` | Fusiona items traídos del backend con los que ya haya en el carrito local (suma cantidades por `lineId`). NO dispara el toast — no es una acción del usuario | `App.jsx:149` (`CartBackendSync`) al iniciar sesión, después de `loadBackendCart()` |

## Thunk: `applyCoupon` — y el patrón que comparten todos los thunks del proyecto

```js
// cartSlice.js:24-31 — SIN try/catch (ver "puntos finos")
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

**extraReducers** (cartSlice.js:105-130) — este es el patrón que `auth` repite, acá explicado una vez:

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

Además del thunk, el slice tiene un **extraReducer cross-slice**: escucha `logout` (action del `authSlice`) y vacía el carrito visible al cerrar sesión — cualquiera de las vías de logout lo dispara sin que esos componentes sepan que el carrito existe. El logout manual (Navbar, Perfil, AdminLayout) va por `logoutThunk`, que **antes** de despachar `logout()` vuelca el carrito al backend (para poder recuperarlo luego); el auto-logout por 401 despacha `logout()` directo (el token ya no sirve para volcar).

## Selector memoizado: `selectCartTotals`

`cartSlice.js:136-156`, hecho con `createSelector` (de reselect, incluido en RTK). Toma `items` y `coupon` y devuelve `{ subtotal, discount, subtotalConDesc, shipping, total, itemCount }`. Reglas: descuento `PORCENTAJE` = `subtotal * valor / 100` redondeado; `FIJO` = `min(valor, subtotal)`; envío gratis si el **subtotal antes del cupón** ≥ $80.000, si no $10.000 (el cupón no quita el envío gratis ya ganado por monto de compra — misma regla en el backend, `CarritoServiceImpl.java:276-322`, evaluada sobre `subtotalSinDesc`). Al ser memoizado, solo recalcula cuando cambian `items` o `coupon` — un cambio en `toast` o `auth` no lo re-ejecuta.

## Hooks de Redux — Mapa completo por componente

### `useSelector` — Quién lee qué del store (relacionado al carrito)

| Componente | Línea exacta | Qué lee | Para qué |
|---|---|---|---|
| `Navbar.jsx` | `:42` | `selectCartTotals.itemCount` | El badge con el número de items en el carrito |
| `Carrito.jsx` | `:13` | `state.cart.items` | Renderizar cada línea del carrito |
| `Carrito.jsx` | `:14` | `selectCartTotals` | Subtotal, envío y total |
| `Carrito.jsx` | `:15` | `state.auth.isLoggedIn` | Si no está logueado, redirigir al login al ir al checkout |
| `Checkout.jsx` | `:160` | `state.cart.items` | Los items para sincronizar al backend en la compra |
| `Checkout.jsx` | `:161` | `selectCartTotals` | Subtotal, descuento, envío, total para el resumen |
| `Checkout.jsx` | `:162` | `state.auth.user` | Nombre y datos del usuario para el formulario de envío |
| `Checkout.jsx` | `:165` | `state.cart.coupon` | Mostrar el cupón aplicado |
| `Checkout.jsx` | `:166` | `state.cart.couponError` | Mostrar el error del cupón en rojo |
| `Checkout.jsx` | `:167` | `state.cart.couponStatus === 'loading'` | Mostrar spinner en el botón "Aplicar" |
| `ProductoDetalle.jsx` | `:22` | `state.cart.items` | Descontar del stock disponible lo que ya está en el carrito |
| `App.jsx` (`CartPersist`) | `:78` | `state.cart.items` | Persistir en localStorage en cada cambio |
| `App.jsx` (`CartPersist`) | `:79` | `state.cart.coupon` | Persistir en localStorage en cada cambio |
| `App.jsx` (`CartBackendSync`) | `:97` | `state.cart.items` | Snapshot para volcar al backend en los bordes de la sesión |
| `App.jsx` (`CartBackendSync`) | `:98` | `state.auth.isLoggedIn` | No vuelca ni recupera si no hay sesión |
| `Toast.jsx` | `:7` | `state.toast.visible`, `state.toast.productName` | Mostrar/ocultar el toast (indirectamente del carrito via extraReducer) |

### `useDispatch` — Quién despacha qué acción del carrito

| Componente | Línea exacta | Acción despachada | Evento del usuario |
|---|---|---|---|
| `ProductoDetalle.jsx` | `:132` | `addToCart({productId, varianteId, nombre, precio, imagen, talle, qty})` | Botón "Agregar al carrito" |
| `Carrito.jsx` | `:119` | `updateQty({ lineId, qty: qty - 1 })` | Botón "−" (decrementar cantidad) |
| `Carrito.jsx` | `:125` | `updateQty({ lineId, qty: qty + 1 })` | Botón "+" (incrementar cantidad) |
| `Carrito.jsx` | `:131` | `removeFromCart(lineId)` | Botón basura "Quitar" |
| `Carrito.jsx` | `:51, :146` | `clearCart()` | Botón "Vaciar carrito" |
| `Carrito.jsx` | `:24` | `setReturnTo('/checkout')` ← **de authSlice, no de cart** | Al ir al checkout sin estar logueado, guarda la URL de retorno |
| `Checkout.jsx` | `:313` | `applyCoupon(codigo)` ← **thunk asíncrono** | Botón "Aplicar" cupón (paso 2) |
| `Checkout.jsx` | `:321` | `removeCoupon()` | Botón ✕ quitar cupón aplicado |
| `Checkout.jsx` | `:396` | `clearCart()` | Compra exitosa → limpiar todo |
| `App.jsx` (`CartUserCheck`) | `:172` | `clearCart()` | Cambio de usuario logueado (login con otro usuario) |
| `App.jsx` (`CartBackendSync`) | `:149` | `hydrateItems(mapped)` | Fusiona el carrito recuperado del backend al iniciar sesión |
| `Toast.jsx` | `:8` | `hideToast()` ← **de toastSlice** | Auto-cierre del toast |

### `createSelector` (selector memoizado)

| Selector | Archivo y líneas | Inputs | Output | Usado en |
|---|---|---|---|---|
| `selectCartTotals` | `cartSlice.js:136-156` | `state.cart.items`, `state.cart.coupon` | `{subtotal, discount, subtotalConDesc, shipping, total, itemCount}` | Navbar, Carrito, Checkout |

`createSelector` es de **reselect** (incluido en RTK). Solo recalcula cuando cambian sus inputs. Si cambia `state.auth` o `state.toast`, este selector **no** se re-ejecuta → mejor performance.

## Patrones cross-slice (comunicación entre slices)

Dos ejemplos concretos de un slice reaccionando a la action de otro:

### a) `toastSlice` escucha `addToCart` del `cartSlice`

```js
// toastSlice.js:13-18 — extraReducer que reacciona a la action de OTRO slice
builder.addCase(addToCart, (state, action) => {
  state.visible     = true
  state.productName = action.payload.nombre
})
```

**Una sola action → dos slices reaccionan.** El componente `ProductoDetalle` solo despacha `addToCart`, no necesita saber que existe un toast. El toast aparece solo porque `toastSlice` escucha esa action.

### b) `cartSlice` escucha `logout` del `authSlice`

```js
// cartSlice.js:124-129 — el carrito se vacía cuando el authSlice despacha logout
.addCase(logout, (state) => {
  state.items        = []
  state.coupon       = null
  state.couponError  = null
  state.couponStatus = 'idle'
})
```

**4 vías de logout en la app** (Navbar, Perfil, AdminLayout, auto-logout por 401) y **ninguna despacha `clearCart()` manualmente**. Las tres primeras van por `logoutThunk`, que como último paso hace `dispatch(logout())`; la cuarta lo despacha directo. En los cuatro casos el carrito se limpia solo porque escucha la action de auth. Si mañana se agrega un quinto botón de logout, funciona sin tocar nada.

### ¿Por qué son importantes estos patrones?

- **Desacoplamiento**: los componentes no necesitan conocer los efectos secundarios de sus acciones.
- **Mantenibilidad**: un solo punto donde definir la reacción, no disperso en N componentes.
- **Escalabilidad**: agregar un nuevo efecto (ej. analytics al agregar al carrito) es agregar un `addCase` en un slice nuevo, sin tocar los componentes existentes.

## Flujo completo narrado: agregar un producto y aplicar cupón

1. En `ProductoDetalle.jsx`, el usuario elige color/talle. El componente calcula `stockDisponible = stockActual - enCarrito` (línea ~120: lee `state.cart.items` con `useSelector` para descontar lo ya agregado) y al click de "Agregar" despacha `addToCart({...})` con `useDispatch`, con `qty` acotado al stock.
2. El reducer `addToCart` suma la línea (o incrementa `qty` si ya estaba). **Dos slices reaccionan a la misma action**: `cart` actualiza items y `toastSlice` (extraReducer) pone `visible: true` → aparece el toast.
3. `CartPersist` (App.jsx:77-88) tiene un `useEffect` con deps `[items, coupon]`: al cambiar items, escribe `localStorage['cumbre_cart']`.
4. `Navbar` re-renderiza el badge porque `selectCartTotals.itemCount` cambió (memoizado: solo recalcula cuando items o coupon cambian).
5. En `/checkout` paso 2, el usuario escribe `OTONO2026` y toca "Aplicar" → `Checkout.jsx:313` hace `await dispatch(applyCoupon(codigo)).unwrap()`.
6. RTK despacha `pending` → `couponStatus = 'loading'` → el botón muestra spinner (`Checkout.jsx:167` lo lee con `useSelector`).
7. Axios hace `GET /api/descuentos/buscar?codigo=OTONO2026` con el JWT inyectado.
8. 200 → `fulfilled` → `coupon` poblado → `OrderSummary` muestra la línea de descuento y `selectCartTotals` recalcula el total. 404 → `rejected` → `couponError` con el mensaje del backend, mostrado en rojo bajo el input.
9. Al confirmar la compra (paso 3), `Checkout.jsx:confirmar()` sincroniza todo al backend: crea/recupera carrito backend, vacía items viejos, agrega items del Redux, re-aplica el cupón con `PUT /carritos/{id}/descuento`, hace el checkout — y al éxito despacha `clearCart()` y navega a `/confirmacion`.

```
ProductoDetalle ──addToCart──▶ cart.items ──▶ Navbar badge / CartPersist → localStorage
                                   │                    ▲
                                   └──(extraReducer)──▶ toast.visible ──▶ <Toast/>
Checkout "Aplicar" ──applyCoupon──▶ pending → GET /descuentos/buscar → fulfilled/rejected
                                   └──▶ coupon / couponError ──▶ OrderSummary re-render
Checkout "Confirmar" ──confirmar()──▶ Backend: crear carrito → items → cupón → checkout
                                   └──▶ clearCart() → Redux vacío + localStorage vacío
```

## ¿Qué pasa con el carrito al cerrar y abrir sesión?

### Escenario: usuario logueado con carrito → cierra sesión → vuelve a loguearse

1. **Usuario agrega productos** → viven en Redux + localStorage. Mientras compra, el backend no se toca.
2. **Cierra sesión** (logout manual) → se despacha `logoutThunk`: primero **vuelca** el carrito al backend (`flushCart`, con el token aún válido), luego `authService.logout()` (borra token + localStorage) y `dispatch(logout())` (el extraReducer del cartSlice vacía Redux).
3. **Vuelve a loguearse** → el evento `auth:login` dispara `CartBackendSync` → `loadBackendCart()` trae los items del carrito ACTIVO/VACIO del usuario → `hydrateItems` los carga en Redux.
4. **Resultado: los productos SÍ se recuperan.**

> Nota: si la sesión se cierra por auto-logout (401), o el navegador se cierra sin haber ocultado la pestaña antes, ese volcado puntual no ocurre; el localStorage del mismo navegador conserva el carrito de todos modos. El caso de "distinto dispositivo" queda cubierto por el volcado en `visibilitychange`/`pagehide`.

### ¿Cómo lee el front los items del carrito backend?

`loadBackendCart()` (`store/cartBackend.js`) hace `GET /api/carritos`, toma el carrito ACTIVO o VACIO del usuario y mapea cada `ItemCarritoResponse` (`{ varianteId, productoId, productoNombre, varianteTalla, cantidad, precioUnitario }`) al formato de línea del carrito local. La imagen no viene en el DTO: se resuelve del `ProductsContext` por `productoId` (con fallback en la vista `Carrito`).

### ¿Y si se logueó con otro usuario?

Hay una segunda capa de seguridad: `CartUserCheck` (App.jsx:164-181). Cuando el thunk `loginThunk` tiene éxito, emite un `CustomEvent('auth:login')` con el id del usuario. `CartUserCheck` escucha ese evento y compara el id con `localStorage['cumbre_cart_uid']`. Si es un usuario distinto, despacha `clearCart()` — esto previene que un usuario vea el carrito de otro en una computadora compartida.

### Resumen del ciclo de sesión y carrito

```
Login (usuario A)  ──▶ Agrega productos ──▶ Redux + localStorage ✓
                                                        │
                    (cambia de pestaña / la cierra) ──▶ CartBackendSync vuelca al back (PUT /carritos/{id}/items)
                                                        │
Logout manual      ──▶ logoutThunk: flushCart ──▶ back  ──▶ luego vacía Redux + localStorage
                                                        │
Re-login (usuario A) ──▶ auth:login ──▶ loadBackendCart() ──▶ hydrateItems ──▶ carrito recuperado ✓
Re-login (usuario B) ──▶ CartUserCheck detecta cambio ──▶ clearCart(), luego hidrata el carrito de B
```

## Puntos finos y posibles preguntas trampa

- **¿Por qué no hay try/catch en el thunk?** Lo teníamos y lo sacamos en la auditoría: `createAsyncThunk` ya despacha `.rejected` solo cuando la promesa rechaza. El mensaje amigable se normaliza una única vez en el interceptor (`api.js:27`) y llega por `action.error.message`.
- **El descuento del front es un estimado.** `selectCartTotals` calcula el descuento del lado del cliente para mostrarlo; la cifra que vale es la del backend, que re-aplica el cupón en el checkout (`PUT /carritos/{id}/descuento`) y recalcula el total en `CarritoServiceImpl.calcularTotal`. Si el cupón venció entre que se aplicó y se confirmó, ese PUT falla y el checkout se aborta con un mensaje claro — no se cobra un descuento inválido.
- **Validación de stock: doble capa.** Cliente: `ProductoDetalle` descuenta lo ya carriteado (`stockDisponible`, evita el bypass de agregar dos veces) y `Carrito.jsx:80-82` deshabilita el "+" con `atMax` leyendo el stock desde `ProductsContext`. Servidor: el backend vuelve a validar en `agregarItem` y en `descontarStock` (tira 400 "Sin stock disponible"). Si preguntan "¿y si dos usuarios compran lo último a la vez?": lo resuelve el backend, el front solo mejora la UX.
- **`couponStatus` no tiene `'succeeded'`/`'failed'`**: el éxito es `coupon != null` y el fallo es `couponError != null`; el status solo distingue "hay un fetch en curso" para el spinner.
- **`applyCoupon('')` no es un error**: el thunk devuelve `null` (fulfilled) y el guard `if (action.payload)` del extraReducer lo ignora. Por eso el fulfilled tiene un `if`.
- **`.unwrap()` en Checkout**: convierte el resultado del dispatch en una promesa que rechaza si el thunk falló; el `catch {}` está vacío a propósito porque el error ya quedó en `state.cart.couponError` — la UI lo lee del store, no de la variable local.
- **El logout limpia el carrito por extraReducer, no por dispatch manual**: en vez de despachar `clearCart()` en cada botón de logout (4 lugares), el slice escucha la action `logout` de auth. Si preguntan "¿y si mañana agregan un quinto botón de logout?": funciona solo, porque la limpieza vive en el slice, no en los componentes.
- **Cambio de usuario limpia el carrito**: el thunk de login emite `CustomEvent('auth:login')`; `CartUserCheck` (App.jsx:164-181) compara el id con `localStorage['cumbre_cart_uid']` y si es otro usuario despacha `clearCart()`. Es la segunda capa: la primera es el vaciado al desloguear.
- **lineId con dos formatos** (`v10` vs `p1-M`): productos con variante real usan el id de variante; el fallback por producto+talle existe para items sin variante (que el checkout igual rechaza, porque el backend necesita `varianteId`).
- **¿Cómo se recupera el carrito del backend al re-loguearse sin golpear al back en cada cambio?** El volcado no ocurre por interacción sino en los bordes de la sesión: `CartBackendSync` vuelca el snapshot con `PUT /carritos/{id}/items` (reemplazo atómico, un request) al ocultar/cerrar la pestaña y en el logout, solo si cambió (dirty-check). Al `auth:login` recupera con `loadBackendCart()` + `hydrateItems`. Así el carrito local sigue sin network lag y aun así persiste cross-sesión.
- **¿Qué pasa con el carrito backend después del checkout?** Su estado pasa a `CONVERTIDO`, sus items se borran, y se crea una `Orden` con los `ItemOrden`. El carrito nunca vuelve a usarse — en la próxima compra se crea uno nuevo.
- **¿Qué pasa con carritos abandonados?** `CarritoServiceImpl.vaciarCarritosAbandonados()` puede marcarlos como `ABANDONADO` después de X días de inactividad.

## Resumen de 30 segundos

> "El slice `cart` maneja el carrito y el cupón. El carrito es estado local puro: `addToCart`, `updateQty`, `removeFromCart` y `clearCart` son reducers síncronos, y se persiste en localStorage con un componente `CartPersist` que observa el slice con `useSelector` y un `useEffect`. Lo único asíncrono es el cupón: el thunk `applyCoupon` llama a `GET /descuentos/buscar`, y sus extraReducers manejan `pending` (status `'loading'`), `fulfilled` (guarda el cupón) y `rejected` (guarda el mensaje en `couponError`). Los totales salen de `selectCartTotals`, un selector memoizado con `createSelector`. Durante la compra el backend no se toca; se sincroniza en los bordes de la sesión: `CartBackendSync` vuelca el carrito con `PUT /carritos/{id}/items` al ocultar/cerrar la pestaña y en el logout (`logoutThunk`), y lo recupera al `auth:login` con `hydrateItems`. Al cerrar sesión el carrito visible se vacía por extraReducer cross-slice (escucha `logout` de auth), y al re-loguearse se recupera desde el backend."
