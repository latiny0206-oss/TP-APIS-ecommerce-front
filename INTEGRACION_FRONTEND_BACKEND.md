# Integración Frontend ↔ Backend — Cumbre Outdoor Gear

## 1. Introducción

Este documento describe la integración completa entre el frontend React (Vite 6) y el backend Spring Boot con autenticación JWT. Todos los mocks y datos estáticos han sido reemplazados por llamadas reales a la API REST.

**Stack:**
- Frontend: React 19, Vite 6.0.3, Tailwind CSS 3.4.16, React Router 7, Axios
- Backend: Spring Boot en `http://localhost:8080/api`
- Auth: JWT Bearer Token (24 h), roles `ADMIN` / `CLIENTE`

---

## 2. Arquitectura de la integración

```
┌─────────────────────────────────────────────────────┐
│                   React App                         │
│                                                     │
│  Views / Pages                                      │
│    ↕                                                │
│  Context API  ←──────────────┐                     │
│  (AuthContext, CartContext,   │                     │
│   ProductsContext)            │                     │
│    ↕                          │                     │
│  Custom Hooks                 │                     │
│  (useOrdenes, useCartApi,     │                     │
│   useProductsFetch, …)        │                     │
│    ↕                          │                     │
│  Service Layer ───────────────┘                     │
│  (authService, productService,                      │
│   cartService, orderService,                        │
│   discountService)                                  │
│    ↕                                                │
│  api.js — Axios instance + interceptors             │
│    ↕                                                │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP / JWT Bearer
┌──────────────────────▼──────────────────────────────┐
│           Spring Boot API (puerto 8080)             │
│   /api/auth  /api/productos  /api/variantes         │
│   /api/carritos  /api/ordenes  /api/descuentos      │
│   /api/categorias  /api/marcas  /api/fotos          │
└─────────────────────────────────────────────────────┘
```

---

## 3. Configuración del cliente HTTP

**`src/api/api.js`** — instancia base Axios con interceptores JWT:

```js
import axios from 'axios'

const BASE_URL = 'http://localhost:8080/api'
const TOKEN_KEY = 'cumbre_token'
const USER_KEY  = 'cumbre_user'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Inyecta el token JWT en cada request autenticado
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Manejo global de errores: 401 → logout automático
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      window.dispatchEvent(new Event('auth:logout'))
    }
    return Promise.reject(error)
  }
)

export const tokenStorage = {
  get:    ()      => localStorage.getItem(TOKEN_KEY),
  set:    (token) => localStorage.setItem(TOKEN_KEY, token),
  remove: ()      => localStorage.removeItem(TOKEN_KEY),
}

export const userStorage = {
  get:    ()     => { try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null } },
  set:    (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  remove: ()     => localStorage.removeItem(USER_KEY),
}

export function getErrorMessage(error) {
  return error.response?.data?.message ?? error.message ?? 'Error desconocido'
}
```

**Claves de localStorage:**

| Clave | Contenido |
|---|---|
| `cumbre_token` | JWT string |
| `cumbre_user` | `{ username, rol }` como JSON |

---

## 4. Capa de servicios

### 4.1 `authService` — `src/api/authService.js`

```js
export const authService = {
  async login({ username, password }) {
    const { data } = await api.post('/auth/login', { username, password })
    // data = { token, username, rol }
    tokenStorage.set(data.token)
    userStorage.set({ username: data.username, rol: data.rol })
    return data
  },

  async register({ username, email, password, nombre, apellido }) {
    const { data } = await api.post('/auth/register', { username, email, password, nombre, apellido })
    return data
  },

  logout()          { tokenStorage.remove(); userStorage.remove() },
  getStoredUser()   { return userStorage.get() },
  isAuthenticated() { return !!tokenStorage.get() },
}
```

### 4.2 `productService` — `src/api/productService.js`

| Método | Endpoint | Auth |
|---|---|---|
| `getCategorias()` | GET `/categorias` | No |
| `getMarcas()` | GET `/marcas` | No |
| `getProductos()` | GET `/productos` | No |
| `getProducto(id)` | GET `/productos/:id` | No |
| `getProductosByCategoria(id)` | GET `/productos/categoria/:id` | No |
| `getVariantes()` | GET `/variantes` | No |
| `getVariante(id)` | GET `/variantes/:id` | No |
| `getFotosByVariante(id)` | GET `/fotos/variante/:id` | No |
| `crearProducto(data)` | POST `/productos` | ADMIN |
| `actualizarProducto(id, data)` | PUT `/productos/:id` | ADMIN |
| `eliminarProducto(id)` | DELETE `/productos/:id` | ADMIN |
| `crearVariante(data)` | POST `/variantes` | ADMIN |
| `actualizarVariante(id, data)` | PUT `/variantes/:id` | ADMIN |
| `eliminarVariante(id)` | DELETE `/variantes/:id` | ADMIN |
| `crearCategoria(data)` | POST `/categorias` | ADMIN |
| `crearMarca(data)` | POST `/marcas` | ADMIN |

**Adaptador `normalizeProducto(producto, variantes)`:**

El backend devuelve objetos anidados (`marca: { id, nombre }`, `categoria: { id, nombre }`) mientras las vistas esperan strings planos. Este método hace la conversión:

```js
normalizeProducto(producto, variantes = []) {
  const precioBase    = producto.precioBase ?? 0
  const descuentoPct  = producto.descuentoPct ?? 0
  const precio        = descuentoPct > 0
    ? Math.round(precioBase * (1 - descuentoPct / 100))
    : precioBase

  const categoriaNombre = (producto.categoria?.nombre ?? '').toLowerCase()
  const marcaNombre     = producto.marca?.nombre ?? ''

  const talles        = variantes.map((v) => v.talla ?? v.talle).filter(Boolean)
  const stock         = variantes.reduce((s, v) => s + (v.stock ?? 0), 0)
  const temporada     = variantes[0]?.estacion ?? '4 Estaciones'
  const stockPorTalle = variantes.reduce((acc, v) => {
    const t = v.talla ?? v.talle
    if (t) acc[t] = v.stock ?? 0
    return acc
  }, {})

  return {
    id, nombre, descripcion,
    marca: marcaNombre,
    categoria: categoriaNombre,
    precio: precioBase,       // precio sin descuento
    descuento: descuentoPct,
    precioFinal: precio,      // precio con descuento aplicado
    imagen: null,             // cargada por separado via fotos Base64
    talles: talles.length > 0 ? talles : ['Único'],
    stock, stockPorTalle, temporada,
    _variantes: variantes,    // referencia para obtener varianteId por talle
  }
}
```

**Fotos Base64:**
```js
// Obtener array de fotos
const fotos = await productService.getFotosByVariante(varianteId)
// Cada foto: { tipoContenido: "image/jpeg", datos: "<base64 string>" }

// Construir src para <img>
const src = productService.buildImageSrc(fotos[0])
// → "data:image/jpeg;base64,/9j/4AAQ..."
```

### 4.3 `cartService` — `src/api/cartService.js`

```js
export const cartService = {
  crearCarrito: ({ usuarioId, descuentoId } = {}) =>
    api.post('/carritos', { usuarioId, ...(descuentoId && { descuentoId }) }).then((r) => r.data),

  getCarritos: () => api.get('/carritos').then((r) => r.data),

  addItem: (carritoId, { idVariante, cantidad }) =>
    api.post(`/carritos/${carritoId}/items`, { idVariante, cantidad }).then((r) => r.data),

  removeItem: (carritoId, itemId) =>
    api.delete(`/carritos/${carritoId}/items/${itemId}`).then((r) => r.data),

  updateItemCantidad: (carritoId, itemId, cantidad) =>
    api.put(`/carritos/${carritoId}/items/${itemId}`, null, { params: { cantidad } }).then((r) => r.data),

  getTotal:  (carritoId) => api.get(`/carritos/${carritoId}/total`).then((r) => r.data),
  checkout:  (carritoId) => api.post(`/carritos/${carritoId}/checkout`).then((r) => r.data),
  vaciar:    (carritoId) => api.post(`/carritos/${carritoId}/vaciar`).then((r) => r.data),
}
```

### 4.4 `orderService` — `src/api/orderService.js`

```js
export const orderService = {
  getOrdenes:       ()       => api.get('/ordenes').then((r) => r.data),
  getOrden:         (id)     => api.get(`/ordenes/${id}`).then((r) => r.data),
  getOrdenesByUser: (userId) => api.get(`/ordenes/usuario/${userId}`).then((r) => r.data),
  confirmar:        (id)     => api.post(`/ordenes/${id}/confirmar`).then((r) => r.data),
  cancelar:         (id)     => api.post(`/ordenes/${id}/cancelar`).then((r) => r.data),
  eliminar:         (id)     => api.delete(`/ordenes/${id}`).then((r) => r.data),
}
```

> `cancelar` restaura el stock de variantes automáticamente en el backend.

### 4.5 `discountService` — `src/api/discountService.js`

```js
export const discountService = {
  getDescuentosActivos: () => api.get('/descuentos/activos').then((r) => r.data),
  calcular: (descuentoId, monto) =>
    api.get(`/descuentos/${descuentoId}/calcular`, { params: { monto } }).then((r) => r.data),

  // Admin
  getDescuentos:       ()          => api.get('/descuentos').then((r) => r.data),
  crearDescuento:      (data)      => api.post('/descuentos', data).then((r) => r.data),
  actualizarDescuento: (id, data)  => api.put(`/descuentos/${id}`, data).then((r) => r.data),
  eliminarDescuento:   (id)        => api.delete(`/descuentos/${id}`).then((r) => r.data),
}
```

---

## 5. Custom Hooks

### `useProductsFetch` — `src/hooks/useProductsFetch.js`

Hook genérico `useFetch(fetcher, deps)` que envuelve fetch + loading + error + reload:

```js
export function useProductos()                    // GET /productos
export function useCategorias()                   // GET /categorias
export function useMarcas()                       // GET /marcas
export function useProductosByCategoria(catId)    // GET /productos/categoria/:id
export function useVariante(varianteId)           // GET /variantes/:id
export function useFotosVariante(varianteId)      // GET /fotos/variante/:id
```

Todos retornan `{ data, loading, error, reload }`.

### `useCartApi` / `useCarritoActivo` — `src/hooks/useCartApi.js`

```js
// Para operar sobre un carrito existente
const { addItem, removeItem, updateCantidad, getTotal, checkout, vaciar, loading, error }
  = useCartApi(carritoId)

// Para obtener o crear el carrito activo
const { carritoId, init, loading, error } = useCarritoActivo()
await init(usuarioId)   // busca carrito ACTIVO, si no existe lo crea
```

### `useOrdenes` / `useOrden` — `src/hooks/useOrders.js`

```js
// Lista (admin: todas / cliente: por userId)
const { ordenes, loading, error, reload, confirmar, cancelar } = useOrdenes(userId?)

// Detalle de una orden
const { orden, loading, error } = useOrden(id)
```

---

## 6. Flujos de integración

### 6.1 Autenticación

```
Login.jsx
  └─ useAuth().login(username, password)
       └─ authService.login({ username, password })
            └─ POST /api/auth/login
                 ↓ { token, username, rol }
            localStorage: cumbre_token, cumbre_user
       └─ navigate('/admin/dashboard') si rol === 'ADMIN'
          navigate(returnTo) si rol === 'CLIENTE'

Registro.jsx
  └─ useAuth().register({ username, email, password, nombre, apellido })
       └─ authService.register(...)
            └─ POST /api/auth/register
       └─ navigate('/login')

Logout (cualquier componente)
  └─ useAuth().logout()
       └─ authService.logout()  → limpia localStorage
       └─ navigate('/')

Auto-logout (401)
  Interceptor de api.js detecta status 401
    → dispara evento DOM 'auth:logout'
    → AuthContext listener: dispatch LOGOUT + navigate('/login')
```

**Restauración de sesión al recargar:**
```js
// AuthContext.jsx — se ejecuta 1 vez al montar
useEffect(() => {
  const stored = authService.getStoredUser()
  if (stored && authService.isAuthenticated()) {
    dispatch({ type: 'SUCCESS', payload: stored })
  }
}, [])
```

### 6.2 Catálogo de productos

```
ProductsContext.jsx (montaje)
  └─ Promise.all([
       productService.getProductos(),    // GET /api/productos
       productService.getVariantes(),    // GET /api/variantes
     ])
  └─ Agrupa variantes por producto (v.idProducto ?? v.productoId)
  └─ normalizeProducto(producto, variantes) por cada producto
  └─ dispatch({ type: 'SET_ALL', payload: normalized })

Catálogo.jsx
  └─ useProducts() → { ids, byId }
  └─ Filtra por marca / categoría / precio / temporada desde datos normalizados

ProductoDetalle.jsx
  └─ productService.getProducto(id)              // GET /api/productos/:id
  └─ productService.getVariantes()               // GET /api/variantes (filtrado local)
  └─ productService.getFotosByVariante(vId)      // GET /api/fotos/variante/:id
  └─ Al agregar al carrito: addToCart({ ..., varianteId: variante.id })
```

### 6.3 Carrito y Checkout

```
CartContext.jsx (estado local)
  └─ items: [{ lineId, productId, varianteId, nombre, precio, talle, qty, img }]
  └─ La clave es: varianteId ? `v${varianteId}` : `p${productId}-${talle}`

Checkout.jsx — flujo real al confirmar:
  1. cartService.crearCarrito({ usuarioId: user.id })
       → POST /api/carritos
  2. Por cada item con varianteId:
       cartService.addItem(carritoId, { idVariante: item.varianteId, cantidad: item.qty })
       → POST /api/carritos/:id/items
  3. cartService.checkout(carritoId)
       → POST /api/carritos/:id/checkout
       ← { id: ordenId, ... }
  4. clearCart() → limpia CartContext local
  5. navigate('/confirmacion', { state: { orderNumber: `#ORD-${orden.id}`, ordenId } })
```

> **Importante:** Los items sin `varianteId` (agregados sin seleccionar talle) son omitidos
> del checkout. ProductoDetalle siempre pasa `varianteId` al llamar `addToCart`.

### 6.4 Órdenes

```
Perfil.jsx
  └─ useOrdenes() → GET /api/ordenes (todas las del usuario autenticado)

CuentaOrdenDetalle.jsx
  └─ useOrden(id) → GET /api/ordenes/:id

AdminOrders.jsx
  └─ useOrdenes() → GET /api/ordenes (admin ve todas)
  └─ confirmar(id) → POST /api/ordenes/:id/confirmar
  └─ cancelar(id)  → POST /api/ordenes/:id/cancelar
```

**Campos del objeto orden (backend):**

| Campo UI esperado | Campo backend posible |
|---|---|
| `orden.items` | `orden.items` / `orden.detalles` |
| `item.cantidad` | `item.cantidad` / `item.qty` |
| `item.precioUnitario` | `item.precioUnitario` / `item.precio` |
| `item.nombreProducto` | `item.nombreProducto` / `item.nombre` |
| `orden.usuario` | `orden.usuario` / `orden.cliente` |

Las vistas usan el operador `??` para manejar ambos nombres.

---

## 7. Manejo de errores

| Escenario | Comportamiento |
|---|---|
| 401 Unauthorized | Interceptor borra token + dispara `auth:logout` → AuthContext navega a `/login` |
| 403 Forbidden | El error llega al `catch` de la vista (no manejado globalmente) |
| 404 Not Found | Las vistas muestran estado "no encontrado" |
| 5xx Server Error | `getErrorMessage(e)` extrae `error.response.data.message` o `error.message` |
| Red sin conexión | `error.message` = "Network Error" |
| Validación (422/400) | `alert(getErrorMessage(e))` en forms de admin; estado `error` en hooks |

**Utilitario:**
```js
export function getErrorMessage(error) {
  return error.response?.data?.message ?? error.message ?? 'Error desconocido'
}
```

---

## 8. Checklist de validación

### Autenticación
- [ ] Login con credenciales correctas guarda token en `localStorage.cumbre_token`
- [ ] Login como ADMIN redirige a `/admin/dashboard`
- [ ] Login como CLIENTE redirige a la ruta previa (`returnTo`) o `/`
- [ ] Recargar la página mantiene la sesión (restauración desde localStorage)
- [ ] Token expirado (simulado borrando manualmente) redirige a `/login`
- [ ] Registro crea cuenta y redirige a `/login`

### Catálogo
- [ ] `/catalogo` carga productos reales del backend
- [ ] Filtros de marca, categoría, precio y temporada funcionan con datos reales
- [ ] `/producto/:id` muestra detalle con variantes y fotos Base64
- [ ] Seleccionar talla habilita "Agregar al carrito" con `varianteId` correcto

### Carrito y Checkout
- [ ] Agregar producto suma item con `varianteId` en CartContext
- [ ] `/checkout` al confirmar crea carrito en backend y ejecuta checkout
- [ ] Orden generada aparece en `/confirmacion` con número real
- [ ] Items sin `varianteId` muestran advertencia en checkout

### Perfil y Órdenes
- [ ] `/perfil` lista órdenes reales del usuario autenticado
- [ ] `/perfil/orden/:id` muestra detalle completo de la orden
- [ ] Status de la orden se mapea correctamente (PENDIENTE / CONFIRMADA / ENTREGADA / CANCELADA)

### Panel Admin
- [ ] `/admin/products` lista, crea, edita y elimina productos vía API
- [ ] `/admin/variants` lista variantes por producto, actualiza stock/precio, crea nuevas
- [ ] `/admin/catalog` CRUD de categorías y marcas
- [ ] `/admin/orders` lista órdenes, puede confirmar y cancelar
- [ ] `/admin/discounts` CRUD de cupones, toggle activo/inactivo

---

## 9. Guía de validación paso a paso

### Paso 1 — Verificar que el backend corre

```bash
curl http://localhost:8080/api/productos
# Debe devolver array JSON de productos
```

### Paso 2 — Verificar login

Abrir DevTools → Network → ir a `/login`:

1. Ingresar usuario y contraseña
2. Buscar request `POST /api/auth/login`
3. Verificar response: `{ token: "eyJ...", username: "...", rol: "CLIENTE" }`
4. En Application → Local Storage: debe aparecer `cumbre_token`

### Paso 3 — Verificar carga del catálogo

En `/catalogo`, pestaña Network:

1. Buscar `GET /api/productos` → status 200, array de objetos
2. Buscar `GET /api/variantes` → status 200, array con `idProducto`
3. Los productos deben aparecer en pantalla con nombre y precio reales

### Paso 4 — Verificar detalle de producto

En `/producto/1` (o cualquier id), Network:

1. `GET /api/productos/1` → datos del producto
2. `GET /api/variantes` → filtrado local por `idProducto === 1`
3. `GET /api/fotos/variante/:id` → array con `{ tipoContenido, datos }`
4. Imagen debe renderizarse con `src="data:image/jpeg;base64,..."`

### Paso 5 — Verificar checkout

1. Agregar producto con talle seleccionado al carrito
2. Ir a `/checkout` y confirmar
3. Network muestra en orden:
   - `POST /api/carritos` → `{ id: carritoId, ... }`
   - `POST /api/carritos/:id/items` (una vez por item)
   - `POST /api/carritos/:id/checkout` → `{ id: ordenId, ... }`
4. Redirige a `/confirmacion` con `#ORD-{ordenId}`

### Paso 6 — Verificar panel admin

1. Loguear como ADMIN (usuario con `rol: "ADMIN"` en la DB)
2. En `/admin/products`:
   - Lista productos reales
   - Crear producto → `POST /api/productos`
   - Editar → `PUT /api/productos/:id`
   - Eliminar → `DELETE /api/productos/:id`

---

## 10. Troubleshooting

| Síntoma | Causa probable | Solución |
|---|---|---|
| Pantalla en blanco en `/catalogo` | Backend no responde o CORS | Verificar que Spring Boot corre en `:8080` y tiene CORS configurado para `localhost:5173` |
| "Error desconocido" al login | Backend devuelve error sin campo `message` | Revisar logs de Spring Boot; el campo debe ser `{ message: "..." }` |
| Productos sin imagen | No hay fotos en la DB | Normal — la imagen queda `null`; las vistas tienen fallback |
| Checkout falla silenciosamente | Items sin `varianteId` | Asegurarse de seleccionar talle en ProductoDetalle antes de agregar al carrito |
| Admin no puede crear producto | Token expirado o rol incorrecto | Logout y login nuevamente; verificar que el usuario tiene `rol: ADMIN` en la DB |
| `GET /api/descuentos` da 403 | Endpoint requiere ADMIN | AdminDiscounts tiene fallback a `/descuentos/activos` automáticamente |
| Variantes no aparecen | Campo `idProducto` vs `productoId` | ProductService agrupa por `v.idProducto ?? v.productoId`; verificar cuál devuelve el backend |
| Sesión se pierde al recargar | `cumbre_user` no está en localStorage | Verificar que `userStorage.set()` se llama en `authService.login()` |
| 401 en rutas protegidas | Token mal enviado | Verificar en Network que el header `Authorization: Bearer eyJ...` está presente |

---

## 11. Conclusión

La integración cubre todos los flujos principales del e-commerce:

- **Autenticación JWT** con persistencia de sesión, auto-logout ante 401 y restauración al recargar
- **Catálogo** cargado desde API con normalización de DTOs backend → formato UI
- **Carrito local** (CartContext) con `varianteId` para mapear al backend en checkout
- **Checkout on-demand** que crea el carrito en backend solo al confirmar, evitando sincronización constante
- **Órdenes** accesibles tanto desde el perfil del cliente como desde el panel admin
- **CRUD admin** completo para productos, variantes, categorías, marcas y cupones

Todos los archivos de mock en `/src/mocks/` pueden mantenerse como referencia pero ya no son usados por ninguna vista en producción. El único archivo utilitario extraído de mocks es `src/utils/format.js` (`fmtPrice`, `precioFinal`).
