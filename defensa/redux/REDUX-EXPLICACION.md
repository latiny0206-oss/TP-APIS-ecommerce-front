# Redux en el proyecto Cumbre — explicación para exposición oral

> Archivo pensado para **defender el uso de Redux en la exposición**. Cada concepto teórico va acompañado del fragmento real del proyecto que lo implementa (archivo + código exacto), no de ejemplos genéricos. Complementa a `../DEFENSA_REDUX.md` (glosario aplicado + flashcards) y a los archivos de slice en `../slices/`.

---

## 1. ¿Qué problema resuelve Redux y por qué lo usamos en este proyecto?

Redux es una librería para manejar **estado global** — datos que necesitan estar disponibles en muchos componentes al mismo tiempo y que cambian por interacciones del usuario. Sin una solución central, ese estado se termina "levantando" a componentes cada vez más altos del árbol o pasando por callbacks entre padres e hijos ("prop drilling"), y se vuelve difícil saber quién lo modifica y cuándo.

En Cumbre hay tres piezas de estado que están en **muchos lugares** de la interfaz al mismo tiempo:
- **El carrito**: lo agrego desde el detalle del producto, el badge del número aparece en la Navbar, el resumen se ve en `/carrito` y en el checkout, y se persiste en localStorage.
- **La sesión del usuario**: la usan la Navbar (para mostrar "Ingresar" o el nombre), los guards de rutas (`AccountGuard`, `AdminGuard`), el Perfil, el AdminLayout y el Checkout.
- **El toast** de "agregado al carrito": lo dispara la página de producto pero el componente que lo muestra vive globalmente en `App`.

Sin Redux, cada uno de esos componentes tendría que recibir esos datos por props o suscribirse a un `Context`, y los efectos secundarios (como "al agregar al carrito, mostrar toast") habría que orquestarlos manualmente en varios lugares. Con Redux hay **una sola fuente** de esos datos, un patrón único para modificarlos, y los efectos cross-slice se resuelven en el propio slice sin que los componentes lo sepan.

> **Aclaración honesta que va a preguntar la docente**: en el proyecto **no todo** el estado global está en Redux. El catálogo (productos, variantes, fotos) vive en `ProductsContext` con `useReducer`, porque es un estado de **solo lectura** que se carga una vez y no muta con la interacción. Redux quedó para lo que el usuario cambia constantemente: carrito, sesión, toast. Es una decisión de diseño, no accidente.

---

## 2. Los tres principios de Redux — cómo se cumplen acá

### 2.1 Single source of truth (una sola fuente de verdad)

Todo el estado global vive en **un único objeto** ("store"). En Cumbre ese store combina exactamente tres slices y se define en un solo lugar:

**`Front/src/store/index.js`** (12 líneas, el archivo completo):
```js
import { configureStore } from '@reduxjs/toolkit'
import cartReducer  from './cartSlice.js'
import toastReducer from './toastSlice.js'
import authReducer  from './authSlice.js'

export const store = configureStore({
  reducer: {
    cart:  cartReducer,
    toast: toastReducer,
    auth:  authReducer,
  },
})
```

El estado global entero es `{ cart, toast, auth }`. Cualquier componente que necesita algo lo lee **de acá**, no de una copia local.

### 2.2 El estado es de solo lectura (read-only) — se cambia solo despachando actions

Ningún componente escribe el store directamente. Para modificar el estado hay que **despachar una action** — un objeto plano con un `type` (y opcionalmente un `payload`). Ejemplo real del proyecto:

**`Front/src/views/Carrito.jsx:119`** — botón "−" que decrementa cantidad:
```jsx
<button onClick={() => dispatch(updateQty({ lineId: line.lineId, qty: line.qty - 1 }))}>
```

El componente no toca `state.cart.items` directamente: le pide al store que aplique la action `updateQty`. Esa restricción es lo que permite que Redux DevTools muestre **cada cambio del estado** con su causa: quién despachó qué y cuándo.

### 2.3 Los cambios se hacen con funciones puras (reducers)

Un **reducer** es una función `(estadoActual, action) → estadoNuevo`. No hace pedidos HTTP, no toca `Date.now()`, no muta el estado recibido: **calcula el próximo estado** a partir del anterior y de la action.

Con Redux Toolkit "parece" que mutamos el estado, pero por debajo se usa **Immer**, que crea una copia inmutable. Ejemplo real:

**`Front/src/store/cartSlice.js:42-61`** — reducer `addToCart`:
```js
addToCart(state, action) {
  const p   = action.payload
  const key = p.varianteId ? `v${p.varianteId}` : `p${p.productId}-${p.talle || 'unico'}`
  const qty = p.qty ?? 1
  const hit = state.items.find((i) => i.lineId === key)
  if (hit) {
    hit.qty += qty
  } else {
    state.items.push({
      lineId:     key,
      productId:  p.productId,
      // ...
      qty,
    })
  }
},
```

`hit.qty += qty` y `state.items.push(...)` parecen mutaciones, pero Immer las convierte en un objeto nuevo. La función es pura porque **el mismo estado y la misma action producen siempre el mismo resultado**.

---

## 3. Store, actions, reducers, dispatch — el flujo unidireccional

El flujo de datos en Redux es **siempre en una sola dirección**:

```
Componente ── dispatch(action) ──▶ Store ── reducer(state, action) ──▶ nuevo state
     ▲                                                                       │
     └──────────────── useSelector re-renderiza al cambiar ◄──────────────────┘
```

Recorrido concreto en el proyecto: el usuario toca "Agregar al carrito" en el detalle del producto.

**Paso 1 — El componente despacha una action.**
`Front/src/views/ProductoDetalle.jsx:132`:
```js
dispatch(addToCart({ productId, varianteId, nombre, precio, imagen, talle, qty }))
```

**Paso 2 — El store enruta esa action a todos los reducers registrados.**
Como el store combina `cart`, `toast` y `auth`, la action `cart/addToCart` pasa por los tres. Dos reaccionan:
- `cartSlice` en su reducer propio agrega la línea al array (fragmento del punto 2.3).
- `toastSlice` en un `extraReducer` — porque la action no nació en su slice — pone el toast visible:

**`Front/src/store/toastSlice.js:13-19`**:
```js
extraReducers(builder) {
  // Mostrar toast automáticamente cuando se agrega un item al carrito
  builder.addCase(addToCart, (state, action) => {
    state.visible     = true
    state.productName = action.payload.nombre
  })
},
```

**Paso 3 — El nuevo estado dispara re-renders.**
Los componentes suscriptos vía `useSelector` reciben el nuevo valor y se vuelven a renderizar:
- Navbar re-renderiza el badge (`useSelector(selectCartTotals).itemCount`).
- La vista `Carrito` re-renderiza la línea nueva.
- `<Toast/>` (que estaba oculto) aparece con el nombre del producto.

**Ninguno** de esos tres componentes se comunicó con los demás. Todos leen del store. Esa **desdirección** — un solo lugar donde escribir, muchos lugares donde leer — es lo que hace escalable el patrón.

---

## 4. Redux Toolkit — la forma moderna de escribir Redux

Redux "clásico" pedía escribir a mano las constantes de tipo, los creadores de acciones, los switches en los reducers y configurar el store con middleware. Todo eso era mucho código repetitivo. **Redux Toolkit (RTK)** es el paquete oficial que reduce el boilerplate. Este proyecto lo usa entero: `configureStore`, `createSlice`, `createAsyncThunk` y `createSelector`.

### 4.1 `createSlice` — reducers + actions en un solo bloque

Un "slice" es una porción del estado (por ejemplo `cart`) con su estado inicial, sus reducers y los actions creators generados automáticamente. Ejemplo mínimo real del proyecto (**`Front/src/store/toastSlice.js`**, archivo completo, 24 líneas):

```js
import { createSlice } from '@reduxjs/toolkit'
import { addToCart } from './cartSlice.js'

const toastSlice = createSlice({
  name: 'toast',
  initialState: { visible: false, productName: null },
  reducers: {
    hideToast(state) {
      state.visible     = false
      state.productName = null
    },
  },
  extraReducers(builder) {
    builder.addCase(addToCart, (state, action) => {
      state.visible     = true
      state.productName = action.payload.nombre
    })
  },
})

export const { hideToast } = toastSlice.actions
export default toastSlice.reducer
```

De ese bloque salen:
- **El reducer** (`toastSlice.reducer`, que se registra en el store como `toast`).
- **Los action creators** (`hideToast()` devuelve `{ type: 'toast/hideToast' }` sin escribir el string a mano).
- **El manejo de una action ajena** (`extraReducers` reacciona a `addToCart`, que pertenece a otro slice).

### 4.2 `createAsyncThunk` — llamadas asincrónicas al backend

Un **thunk** es una función que se despacha como si fuera una action pero que puede hacer trabajo asincrónico (por ejemplo, un `fetch`). `createAsyncThunk` genera automáticamente **tres tipos de acción** — `pending`, `fulfilled` y `rejected` — que el slice puede manejar en `extraReducers`.

Ejemplo real del proyecto: aplicar un cupón de descuento en el checkout.

**`Front/src/store/cartSlice.js:24-31`** — el thunk:
```js
// Sin try/catch: createAsyncThunk captura el rechazo y despacha .rejected solo;
// el mensaje del backend llega por action.error.message (normalizado en api.js).
export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async (code) => {
    const trimmed = (code || '').trim().toUpperCase()
    if (!trimmed) return null
    return await discountService.buscarPorCodigo(trimmed)
  }
)
```

**`Front/src/store/cartSlice.js:107-121`** — los `extraReducers` que responden al ciclo:
```js
.addCase(applyCoupon.pending, (state) => {
  state.couponStatus = 'loading'
  state.couponError  = null
})
.addCase(applyCoupon.fulfilled, (state, action) => {
  state.couponStatus = 'idle'
  if (action.payload) {
    state.coupon      = action.payload
    state.couponError = null
  }
})
.addCase(applyCoupon.rejected, (state, action) => {
  state.couponStatus = 'idle'
  state.couponError  = action.error.message ?? 'Error al aplicar el cupón'
})
```

Y el componente lo dispara así (**`Front/src/views/Checkout.jsx:313`**):
```js
await dispatch(applyCoupon(codigo)).unwrap()
```

El proyecto tiene **cuatro thunks**: `applyCoupon` en `cartSlice`, y `loginThunk` / `registerThunk` / `logoutThunk` en `authSlice`. Este último no llama al backend: es un **thunk de orquestación local** que agrupa tres pasos (volcar carrito, limpiar localStorage, despachar `logout`) — muestra que un thunk no siempre es "una request HTTP".

### 4.3 `createSelector` — cálculos derivados memoizados

A veces el componente no necesita el estado crudo sino algo **calculado** a partir de él (subtotal + descuento + envío = total). Si ese cálculo se hace dentro del componente, se recalcula en cada render. `createSelector` (de la librería **reselect**, incluida en RTK) devuelve un selector que **memoiza el resultado**: solo recalcula si sus inputs cambian.

**`Front/src/store/cartSlice.js:136-156`** — el selector `selectCartTotals`:
```js
export const selectCartTotals = createSelector(
  (state) => state.cart.items,
  (state) => state.cart.coupon,
  (items, coupon) => {
    const subtotal  = items.reduce((s, i) => s + i.precio * i.qty, 0)
    const itemCount = items.reduce((n, i) => n + i.qty, 0)

    let discount = 0
    if (coupon) {
      const val = Number(coupon.valor ?? 0)
      if (coupon.tipo === 'PORCENTAJE')  discount = Math.round(subtotal * val / 100)
      else if (coupon.tipo === 'FIJO')   discount = Math.min(val, subtotal)
    }

    const subtotalConDesc = Math.max(0, subtotal - discount)
    const shipping        = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
    const total           = subtotalConDesc + shipping

    return { subtotal, discount, subtotalConDesc, shipping, total, itemCount }
  }
)
```

Lo consume la Navbar (para el badge), la vista Carrito y el Checkout. Si cambia `state.auth` o `state.toast`, este selector **no** se recalcula — solo depende de `items` y `coupon`.

---

## 5. Conexión con React — Provider, useSelector, useDispatch

Redux es agnóstico de React. La librería `react-redux` (también instalada) hace el puente.

### 5.1 `<Provider>` — deja el store disponible en todo el árbol

En la raíz de la app se envuelve todo con `<Provider store={store}>`. A partir de ahí, cualquier componente del árbol puede acceder al store con los hooks.

**`Front/src/main.jsx`** (archivo completo, 21 líneas):
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/index.js'
import { ProductsProvider } from './context/ProductsContext.jsx'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <ProductsProvider>
          <App />
        </ProductsProvider>
      </Provider>
    </BrowserRouter>
  </StrictMode>,
)
```

### 5.2 `useSelector` — leer del store y suscribirse a cambios

Devuelve la porción del estado que uno le pide. El componente se **re-renderiza automáticamente** cuando esa porción cambia (y solo cuando cambia).

**`Front/src/components/Navbar.jsx:40-41`** — dos lecturas simultáneas del store:
```js
const { isLoggedIn, user } = useSelector((state) => state.auth)
const cartCount = useSelector(selectCartTotals).itemCount
```

Si en la primera línea nadie más cambia `state.auth`, la Navbar no se re-renderiza aunque cambien `cart` o `toast`. Y como la segunda usa el selector memoizado, tampoco recalcula el `itemCount` si items/coupon no cambiaron.

### 5.3 `useDispatch` — obtener la función `dispatch` para modificar el store

**`Front/src/components/Navbar.jsx:39, 70-74`**:
```js
const dispatch = useDispatch()
// ...
const handleLogout = () => {
  dispatch(logoutThunk())
  navigate('/')
  closeMobile()
}
```

Ese `dispatch(logoutThunk())` es la puerta de entrada al patrón entero: el store recibe la action, los reducers producen el nuevo estado, los componentes suscriptos re-renderizan.

---

## 6. Patrón cross-slice (**la perla conceptual del proyecto**)

Los `extraReducers` no son solo para thunks. También sirven para que **un slice reaccione a la action de otro**. En Cumbre esto se usa dos veces y es lo que hace ver "que entendemos Redux" en la exposición:

### Ejemplo A — `toastSlice` escucha `addToCart` del `cartSlice`

Ya visto arriba (punto 3, paso 2). **Un solo dispatch, dos slices reaccionan**. `ProductoDetalle` no sabe que existe el toast.

### Ejemplo B — `cartSlice` escucha `logout` del `authSlice`

**`Front/src/store/cartSlice.js:124-129`**:
```js
.addCase(logout, (state) => {
  state.items        = []
  state.coupon       = null
  state.couponError  = null
  state.couponStatus = 'idle'
})
```

Los tres botones de logout (Navbar, Perfil, AdminLayout) despachan `logoutThunk`, que como último paso hace `dispatch(logout())`. El carrito **se vacía solo** porque este `extraReducer` está escuchando. Los componentes de logout no saben nada del cartSlice. Si mañana se agrega un cuarto botón de logout, funciona sin tocar el carrito.

Esa dirección de dependencia — el que se entera del otro es el que tiene el efecto, no al revés — es lo que hace el código **desacoplado**.

---

## 7. Preguntas frecuentes en la defensa — respuestas cortas

**1. "¿Por qué eligieron Redux y no solo React Context?"**
Porque el estado del carrito y de la sesión **muta con la interacción** del usuario en muchos puntos de la app, y necesitamos DevTools para inspeccionar cada cambio y patrones como los `extraReducers` cross-slice (toast escuchando al cart, cart escuchando al auth) que Context no da. Para el catálogo, que es **solo lectura**, sí usamos Context (`ProductsContext`) — es la decisión inversa deliberada.

**2. "¿Qué es una action y qué es un reducer?"**
Una **action** es un objeto plano con un `type` (y opcionalmente un `payload`) que describe qué pasó — por ejemplo `{ type: 'cart/updateQty', payload: { lineId: 'v10', qty: 2 } }`. Un **reducer** es una función pura que recibe el estado actual y la action, y devuelve el estado nuevo — nunca muta el original, nunca hace pedidos HTTP. En este proyecto los generamos con `createSlice`, así que el action creator y el reducer nacen juntos.

**3. "¿Qué es `dispatch` y por qué es la única forma de cambiar el estado?"**
`dispatch` es la función del store que recibe una action y la envía al reducer raíz. Es la única forma porque garantiza que **todo cambio pasa por el mismo lugar**: eso permite hacer trazabilidad en DevTools, permite que los `extraReducers` cross-slice funcionen y hace imposible que un componente "escriba" el store por su cuenta y rompa la trazabilidad.

**4. "¿Qué pasa cuando despachamos un thunk?"**
`createAsyncThunk` envuelve la función asíncrona y despacha **tres actions** por el ciclo: `pending` al arrancar (nosotros ponemos `couponStatus = 'loading'`), `fulfilled` si la promesa resuelve (guardamos el cupón en `state.cart.coupon`) o `rejected` si rechaza (el mensaje queda en `couponError` desde `action.error.message`). Por eso **no escribimos try/catch** en el thunk: sería redundante y podría silenciar el `.rejected`.

**5. "¿Dónde guardan el token JWT? ¿En Redux?"**
**No**. El token vive en `localStorage` (clave `cumbre_token`) y lo inyecta el interceptor de axios en cada request (`Front/src/api/api.js:14-18`). El slice `auth` guarda solo los datos del usuario para la UI (nombre, email, rol, `isLoggedIn`). Ventajas: el token sobrevive a un F5 sin serializar nada del store, y ningún componente necesita leerlo para hacer peticiones.

**6. "¿Cómo persiste el carrito si Redux vive en memoria?"**
Con un componente invisible `CartPersist` (**`App.jsx:77-88`**) que usa `useSelector` para observar `state.cart.items` y `state.cart.coupon`, y un `useEffect` con esas dependencias que escribe `localStorage['cumbre_cart']` en cada cambio. Al recargar la página, el módulo `cartSlice.js` importa `loadSaved()` (líneas 8-17), que lee ese localStorage y lo usa como `initialState` — sin thunk, sin efecto de rehidratación.

**7. "¿Qué es un `extraReducer` y por qué existen si ya hay `reducers`?"**
Los `reducers` de un slice manejan **sus propias** actions. Los `extraReducers` manejan **actions de afuera** — típicamente los tres tipos generados por un `createAsyncThunk`, pero también actions que pertenecen a otro slice. En este proyecto lo usamos para las dos cosas: el ciclo del thunk `applyCoupon` en `cartSlice`, y para el patrón cross-slice: `toastSlice` reacciona a `addToCart` del cart, y `cartSlice` reacciona a `logout` del auth.

**8. "¿Cómo se conecta Redux con React?"**
Con la librería `react-redux`. En `main.jsx` envolvemos toda la app con `<Provider store={store}>`. Los componentes leen del store con el hook `useSelector((state) => state.cart.items)` — que **suscribe** ese componente a esa porción del estado y lo re-renderiza cuando cambia — y modifican el store con el hook `useDispatch()`, que devuelve la función `dispatch` para enviar actions o thunks.
