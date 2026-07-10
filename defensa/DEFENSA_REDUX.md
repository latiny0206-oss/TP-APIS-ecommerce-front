# DEFENSA_REDUX.md — Material de estudio (proyecto Cumbre e-commerce)

> Todo lo que está acá sale **del código real del proyecto** (`Front/src/store/`), no de la documentación de Redux Toolkit. Los valores de estado son los literales que usamos nosotros.

---

## 1. El flujo completo en una página — ejemplo real: aplicar cupón

Caso: el usuario escribe `OTONO2026` en el paso 2 del checkout y toca "Aplicar".

```
Checkout.jsx                    cartSlice.js                      Backend
─────────────                   ─────────────                     ────────
click "Aplicar"
  │
  ▼
dispatch(applyCoupon('OTONO2026'))
  │                             thunk applyCoupon arranca
  │                             RTK despacha cart/applyCoupon/pending
  │                               → extraReducer: couponStatus = 'loading'
  │                                 (el botón muestra spinner vía useSelector)
  │                                             │
  │                                             ▼
  │                             discountService.buscarPorCodigo()
  │                               → GET /api/descuentos/buscar?codigo=OTONO2026
  │                                             │
  │                             ◄── 200 { id, codigo, tipo, valor, ... }
  │                             RTK despacha cart/applyCoupon/fulfilled
  │                               → extraReducer: coupon = payload,
  │                                 couponStatus = 'idle', couponError = null
  ▼
useSelector((s) => s.cart.coupon) detecta el cambio
  → re-render: OrderSummary muestra "OTONO2026 −15%"
  → selectCartTotals (createSelector) recalcula subtotal/descuento/envío
```

Si el código no existe, el backend devuelve 404 → el thunk **rechaza solo** (sin try/catch) → RTK despacha `cart/applyCoupon/rejected` → el extraReducer guarda `action.error.message` en `couponError` → el componente lo muestra en rojo.

Los archivos, en orden de participación:
1. `Front/src/views/Checkout.jsx:313` — `dispatch(applyCoupon(codigo)).unwrap()`
2. `Front/src/store/cartSlice.js:24` — `createAsyncThunk('cart/applyCoupon', ...)`
3. `Front/src/api/discountService.js:16` — llamada axios al backend
4. `Front/src/store/cartSlice.js:105-130` — `extraReducers` (pending/fulfilled/rejected + cross-slice `logout`)
5. `Front/src/store/index.js` — el store combina `cart`, `toast`, `auth`
6. `Front/src/views/Checkout.jsx:165-167` — `useSelector` lee coupon/couponError/couponStatus

---

## 2. Glosario aplicado a NUESTRO código

### dispatch
Es la única forma de disparar un cambio en el store: le mandás una action y Redux se la pasa a los reducers. En nuestro código:
```js
// Carrito.jsx — action síncrona
dispatch(updateQty({ lineId: line.lineId, qty: line.qty - 1 }))
// Checkout.jsx — thunk asíncrono
await dispatch(applyCoupon(codigo)).unwrap()
```

### reducer
Función pura `(state, action) → nuevo state`. Definimos los síncronos dentro de `reducers:` del slice (RTK usa Immer, por eso "mutamos"):
```js
// cartSlice.js
addToCart(state, action) {
  const hit = state.items.find((i) => i.lineId === key)
  if (hit) hit.qty += qty
  else     state.items.push({ ... })
}
```
Nuestros reducers de `cart`: `addToCart`, `removeFromCart`, `updateQty`, `setCoupon`, `setCouponError`, `removeCoupon`, `clearCart`.

### extraReducer
Reducer que responde a **actions definidas fuera del slice**. Lo usamos para dos cosas:

1. El ciclo de los thunks (`pending` / `fulfilled` / `rejected`):
```js
// cartSlice.js
.addCase(applyCoupon.pending,   (state) => { state.couponStatus = 'loading' })
.addCase(applyCoupon.fulfilled, (state, action) => { state.coupon = action.payload })
.addCase(applyCoupon.rejected,  (state, action) => { state.couponError = action.error.message })
```

2. **Reaccionar a actions de otro slice** (este ejemplo suma en la defensa):
```js
// toastSlice.js — escucha una action del cartSlice
builder.addCase(addToCart, (state, action) => {
  state.visible     = true
  state.productName = action.payload.nombre
})
```

### useSelector
Hook que lee una porción del store y re-renderiza el componente cuando esa porción cambia:
```js
// Checkout.jsx
const coupon      = useSelector((state) => state.cart.coupon)
const totals      = useSelector(selectCartTotals)   // selector memoizado (createSelector)
```

### useDispatch
Hook que devuelve la función `dispatch` del store para usarla dentro del componente:
```js
const dispatch = useDispatch()
dispatch(clearCart())
```

### Los estados del ciclo asíncrono — NUESTROS valores literales

⚠️ **No usamos la nomenclatura `idle/loading/succeeded/failed` de los docs.** Nuestros valores reales:

| Slice | Campo | Valores posibles | Cuándo |
|---|---|---|---|
| `cart` | `couponStatus` | `'idle'` \| `'loading'` | `'loading'` durante el fetch; vuelve a `'idle'` tanto en fulfilled como en rejected (el resultado queda en `coupon` o `couponError`) |
| `auth` | `status` | `'idle'` \| `'loading'` \| `'error'` \| `'registered'` | `'loading'` en pending; login OK vuelve a `'idle'` con `user` cargado; register OK pasa a `'registered'` (para mostrar el mensaje de bienvenida); `'error'` en rejected |

**`idle`** = reposo: no hay ninguna operación en curso. Es el valor inicial de ambos slices y también el valor al que volvemos cuando la operación termina — el *resultado* no vive en el status sino en los datos (`user`, `coupon`, `error`, `couponError`).

Si la docente pregunta "¿y succeeded/failed?": nosotros modelamos el éxito con los datos poblados + status `'idle'`, y el fallo con `'error'` (auth) o `couponError` seteado (cart). Mismo ciclo, otra nomenclatura — decir esto con seguridad.

---

## 3. Flashcards (30-60 segundos cada una)

**¿Qué es un dispatch?**
Es la función con la que le aviso al store que pasó algo. Le paso una action —por ejemplo `dispatch(addToCart(producto))` en el catálogo— y Redux la enruta a todos los reducers. Es la única puerta de entrada para modificar el estado: los componentes nunca escriben el store directamente.

**¿Qué es un reducer?**
Una función pura que recibe el estado actual y una action, y devuelve el estado nuevo. En `cartSlice` tenemos por ejemplo `addToCart`: si la variante ya está en el carrito incrementa `qty`, si no la agrega como línea nueva. Con Redux Toolkit parece que mutamos el estado pero Immer genera una copia inmutable por detrás.

**¿Qué es un extraReducer?**
Un reducer que responde a actions que no nacieron en ese slice. Lo usamos para el ciclo de los thunks (`applyCoupon.pending/fulfilled/rejected` en cartSlice) y también entre slices: `toastSlice` escucha `addToCart` del cartSlice y muestra el toast automáticamente, sin que el componente tenga que despachar dos actions.

**¿Qué hooks de React se relacionan con Redux?**
`useSelector` y `useDispatch`, de react-redux. `useSelector` lee una porción del store y suscribe el componente a esa porción — en Checkout leemos `state.cart.coupon` y el total con un selector memoizado (`selectCartTotals`, hecho con `createSelector`). `useDispatch` me da la función para despachar actions o thunks desde el componente.

**¿Qué es el estado "idle" y cuáles son los demás?**
`idle` es reposo: no hay operación en curso. En nuestro código es el valor inicial y también al que volvemos al terminar. Nuestro `couponStatus` solo tiene `'idle'` y `'loading'`; el `status` de auth tiene `'idle'`, `'loading'`, `'error'` y `'registered'`. El pending del thunk pone `'loading'`, el fulfilled vuelve a `'idle'` con los datos cargados, y el rejected pasa a `'error'` (auth) o deja el mensaje en `couponError` (cart).

**¿Por qué NO hay try/catch en los thunks?**
Porque `createAsyncThunk` ya envuelve el callback: si la promesa rechaza, despacha `.rejected` automáticamente y serializa el error en `action.error`. Un try/catch manual es redundante, y si el catch no relanza ni hace `rejectWithValue`, el `.rejected` nunca se dispara y el error queda silenciado. Nosotros normalizamos el mensaje del backend una sola vez en el interceptor de axios (`api.js`), así el extraReducer lo lee directo de `action.error.message`.

**¿Cómo evitan refetches y llamados duplicados?**
Tres mecanismos según la entidad. El cupón vive en el store de Redux (y se persiste en localStorage), así que solo se consulta al backend cuando el usuario toca "Aplicar" — navegar entre carrito y checkout no re-fetchea nada. Los descuentos activos de la home usan una promesa cacheada a nivel módulo en `discountService`: aunque dos componentes la pidan a la vez, sale un solo GET. Y el catálogo (productos + variantes + fotos) se carga una única vez en `ProductsProvider` con un guard de inicialización que además evita el doble fetch del StrictMode en desarrollo.

---

## 4. Checklist de verificación manual pre-defensa

Preparación: backend levantado (reiniciarlo si hubo cambios), `npm run dev` en Front, Chrome con **Redux DevTools** y la pestaña **Network** (filtro XHR) abiertas.

1. **Home** → Network: `GET /productos`, `GET /variantes`, `GET /fotos` deben aparecer **una sola vez cada uno** (guard de StrictMode). `GET /descuentos/activos` una sola vez (promesa cacheada).
2. **Login con contraseña incorrecta** → DevTools: `auth/login/pending` (status `'loading'`) → `auth/login/rejected` (status `'error'`, `error` con el mensaje del backend). La UI muestra el error.
3. **Login correcto** → `pending` → `fulfilled`: `user` poblado, `isLoggedIn: true`, status vuelve a `'idle'`.
4. **Agregar producto al carrito** → una sola action `cart/addToCart` y el toast aparece solo (extraReducer de toastSlice). **Sin ningún request de red** — el carrito es local hasta el checkout.
5. **Checkout paso 2, cupón inválido** (ej. `NOEXISTE`) → `cart/applyCoupon/pending` → `rejected`; `couponStatus` hace `'idle' → 'loading' → 'idle'` y `couponError` queda con el mensaje. Un solo GET en Network.
6. **Cupón válido** (`OTONO2026`) → `pending` → `fulfilled`; `coupon` poblado; el resumen recalcula descuento y envío sin ningún request extra (es `selectCartTotals`, puro cliente).
7. **Navegar carrito ↔ checkout con cupón puesto** → Network en silencio: cero refetch (el cupón está en el store).
8. **Confirmar compra** → en Network: la secuencia carrito/items/cupón/checkout, cada request **una sola vez**.
9. **F5 en cualquier página** → el carrito y el cupón sobreviven (localStorage vía `CartPersist`), y los fetches iniciales siguen siendo uno por endpoint.

---

## 5. Hallazgos de la auditoría + fixes aplicados

| # | Hallazgo | Dónde estaba | Fix |
|---|---|---|---|
| 1 | try/catch manual en `applyCoupon` (con `rejectWithValue`, no silenciaba, pero es el patrón penalizado) | `Front/src/store/cartSlice.js:27-32` | Eliminado; el thunk quedó sin try/catch y `.rejected` lee `action.error.message` (`cartSlice.js:24-31` y `:118-121`) |
| 2 | try/catch manual en `loginThunk` y `registerThunk` (ídem) | `Front/src/store/authSlice.js:8-21` y `:27-41` | Eliminados; rejected lee `action.error.message` (`authSlice.js:7-36`, `:105-108`, `:120-123`) |
| 3 | Los mensajes amigables del backend se perdían al sacar `rejectWithValue` | — | Normalización única en el interceptor de axios: `error.message = error.response?.data?.message ?? error.message` (`Front/src/api/api.js:27`) |
| 4 | Doble fetch de catálogo en dev por StrictMode (montaje doble de `ProductsProvider`, sin guard) | `Front/src/context/ProductsContext.jsx:80` | Guard con `useRef`: el efecto de montaje corre una sola vez; `reload()` sigue funcionando para las vistas admin (`ProductsContext.jsx:87-92`) |

Verificación post-fix: `vitest run` → **34/34 tests pasan**; `vite build` → sin errores.

### Aclaraciones honestas (por si preguntan)

- **No existe una entidad "cajas/bigbox"** en este proyecto — eso era de otro grupo. Nuestras entidades son productos, variantes, fotos, carrito, descuentos, órdenes y usuarios. El análisis de cacheo se aplicó a todas (sección 3, última flashcard).
- **El backend no usa `@Cacheable`** — no hay capa de cache explícita en Spring. El cacheo del proyecto es del lado del cliente (store de Redux, promesas a nivel módulo, Context).
- En el paso final del checkout se re-aplica el cupón contra el backend (`PUT /carritos/{id}/descuento`). **No es un refetch duplicado**: es la sincronización necesaria para que la orden se cree con el descuento asociado en la base.
- **Persistencia del carrito entre sesiones (patrón `CartBackendSync`, `App.jsx:95-161`)**. Mientras el usuario navega el carrito es 100% local (Redux + localStorage). El backend solo se toca en los **bordes de la sesión**: se **vuelca** el snapshot con `PUT /api/carritos/{id}/items` (reemplazo atómico) al ocultar/cerrar la pestaña (`visibilitychange`/`pagehide`) y al hacer logout manual (paso 1 de `logoutThunk`, con el token aún válido; ver `authSlice.js:43-53`). Un dirty-check por snapshot serializado evita `PUT` duplicados. Al iniciar sesión (evento `auth:login`, login o registro), `loadBackendCart()` trae el carrito ACTIVO/VACIO del backend y `hydrateItems` lo **fusiona** con lo que hubiera local (suma por `lineId`, sin disparar el toast). El auto-logout por 401 **no** vuelca — el token ya no vale — pero el localStorage del mismo navegador conserva el carrito. Esto es lo que responde la pregunta de defensas anteriores: "¿los productos del carrito se recuperan al re-loguearse en otro dispositivo?" — **sí**, y sin castigar la performance con un `PUT` por click.
- **Envío gratis con cupón**: el umbral ($80.000) se evalúa sobre el **subtotal ANTES del cupón**, tanto en el front (`cartSlice.js:151`, dentro de `selectCartTotals`) como en el back (`CarritoServiceImpl.java:276-322`, sobre `subtotalSinDesc`). Un cupón que baja el total por debajo de $80.000 **no quita** el envío gratis ya ganado por monto de compra. Verificarlo en el paso "Confirmar" del Flujo 7 del checklist mirando `montoFinal` en la respuesta del checkout.
- `Front/src/hooks/useCartApi.js` y `Front/src/examples/CheckoutFlow.jsx` eran **código muerto** — se removieron antes de la defensa (junto con la carpeta `examples/`, que quedaba vacía). Si aparecen en `INTEGRACION_FRONTEND_BACKEND.md` o `REDUX_MIGRATION.md` son referencias históricas de la migración a Redux; no queda código que los use.
- La verificación de duplicados se hizo por análisis estático + tests; el checklist de la sección 4 es la confirmación empírica que conviene correr una vez antes de rendir.
- Productos usa **Context + useReducer**, no Redux. Si preguntan por qué: estado global de solo-lectura del catálogo, con normalización `byId/ids`; Redux quedó para el estado que muta con la interacción del usuario (carrito, sesión, toast). Es una decisión defendible — decirla como decisión, no como accidente.
