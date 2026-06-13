# Defensa de Examen — Cumbre E-commerce
### React + Vite + Context API + Tailwind CSS

> **Estructura del documento:** cada integrante defiende la sección que implementó.
> El lenguaje técnico es uniforme y el nivel de profundidad es equivalente entre secciones.

---

# INTEGRANTE 1 — Panel de Administración

## 1. GUION DE EXPOSICIÓN

### Apertura (30 segundos)

> "Buenas, les presento Cumbre, un e-commerce de indumentaria y equipamiento de montaña. Lo que voy a mostrarles hoy es el Panel de Administración: la sección que construimos para que los dueños del negocio gestionen el catálogo en tiempo real, sin tocar código."

### Cuerpo (2-3 minutos — mostralo en vivo mientras hablás)

**1. Acceso al panel**
> "Para entrar al panel, el admin inicia sesión con sus credenciales (`admin@cumbre.com` / `admin123`). El `AuthContext` ejecuta la función `login`, que valida contra el mock de usuarios. Si encuentra el usuario, despacha la acción `SUCCESS` con `safeUser` —el objeto de usuario sin la contraseña— y, al detectar `rol === 'admin'`, llama a `navigate('admin-dashboard')`. Una vez dentro, se carga el `AdminLayout`, que es el shell del panel: sidebar a la izquierda con siete ítems de navegación y overflow de scroll independiente, y el área de contenido a la derecha. Notar que `AdminLayout` es también quien instancia `<ProductsProvider>`, lo que significa que el estado de productos del admin existe solo mientras el layout está montado."

**2. El Tablero (AdminDashboard)**
> "La primera pantalla es el Tablero. Acá se ven KPIs en tiempo real: la cantidad de productos activos —leída directamente del `ProductsContext` como `products.length`, donde `products = ids.map(id => byId[id])`—, órdenes pendientes, descuentos activos y clientes registrados. Abajo hay una tabla con las últimas órdenes con estados coloreados mediante el mapa `STATUS_COLORS`, y dos widgets de alerta: uno de stock bajo —filtra los productos con `p.stock > 0 && p.stock <= 3` y muestra hasta cuatro alertas— y uno de descuentos próximos a vencer. Si alguien crea o elimina un producto en `AdminProducts`, el KPI de Productos activos se actualiza reactivamente aquí también."

**3. ABM de Productos (AdminProducts)**
> "Acá está el corazón del panel. Hay una tabla con todos los productos, con búsqueda en tiempo real por nombre o marca. Cada fila tiene tres acciones: editar (abre el Drawer), gestionar imágenes (navega a `admin-photos` con `params: { productId: p.id }`) y eliminar (despacha `remove(p.id)` al contexto). Cuando hacés clic en editar o en 'Nuevo producto', se abre un Drawer —un panel lateral deslizante— con el formulario de alta/edición."

> "El formulario tiene validación del lado del cliente: si dejás el nombre vacío o el precio en cero, muestra el error inline sin enviar nada. Si configurás un descuento entre 1 y 100%, la app computa en tiempo real el precio final con `Math.round(precioBase * (1 - descuentoPct / 100))` y lo muestra con el tachado del precio original."

**4. Gestor de Imágenes (AdminPhotos)**
> "Se accede desde el botón de imágenes: llama a `navigate({ view: 'admin-photos', params: { productId: p.id } })`. El componente lee `params.productId` para identificar el producto. Tiene un área de drag-and-drop: `onDrop` dispara `fakeUpload`, que simula la subida con `setInterval` que incrementa el progreso y, al llegar a 100%, mueve el ítem de `queue` a `photos`."

### Cierre
> "En resumen, armamos un panel completo con lectura de datos del contexto global, escritura (altas, ediciones y bajas que persisten en memoria mientras navegás), validaciones de formulario, manejo de imágenes y una UX cuidada. Todo en React con Context API, sin Redux, sin recargar la página."

---

## 2. CONCEPTOS TEÓRICOS CLAVE

### ¿Qué es React y por qué lo usamos?

React es una **biblioteca de JavaScript** para construir interfaces de usuario. La idea central es dividir la UI en **componentes**: piezas de código que devuelven HTML y encapsulan su propia lógica.

Lo usamos porque:
- El código se organiza en partes pequeñas y reutilizables.
- Cuando cambia un dato, React actualiza **solo** la parte de la UI que lo necesita (reconciliación eficiente mediante Virtual DOM).
- Context API permite compartir estado global sin instalar librerías externas.

---

### ¿Qué es el Virtual DOM?

El DOM es la representación en memoria del HTML de la página. Modificarlo directamente es costoso.

React introduce el **Virtual DOM**: una copia liviana del DOM real en JavaScript. Cuando un estado cambia:
1. Genera un nuevo Virtual DOM con los cambios.
2. Lo compara con el anterior (algoritmo **diffing** o **reconciliation**).
3. Calcula exactamente qué nodos cambiaron.
4. Aplica **solo esos cambios** al DOM real.

---

### ¿Qué son el Estado y los Hooks?

**Estado** es cualquier dato que puede cambiar con el tiempo y que, cuando cambia, debe actualizar la pantalla.

**Hooks** son funciones especiales de React (empiezan con `use`) que permiten usar funcionalidades del framework dentro de componentes funcionales.

| Hook | Para qué sirve |
|------|----------------|
| `useState` | Guardar y modificar estado local del componente |
| `useReducer` | Manejar estado complejo con acciones tipadas |
| `useContext` | Leer valores del contexto global |
| `useEffect` | Efectos secundarios (sincronizar con el navegador, listeners) |

**Lazy initialization de `useState`:** pasar una función `() => calcular()` en lugar de un valor directo. React la ejecuta solo en el primer render. Usamos este patrón en `ProductDrawer` y `AdminPhotos` para evitar cálculos costosos en cada re-render.

---

### ¿Por qué Context API en lugar de Redux?

Redux requiere instalar `@reduxjs/toolkit` y `react-redux`, definir slices, `configureStore` y conectar cada componente. Para Cumbre —cuatro dominios de estado bien delimitados— Context API + `useReducer` entrega el mismo contrato de inmutabilidad sin dependencias externas.

---

### Estado normalizado: el patrón `byId` + `ids`

`ProductsContext` estructura su estado como `{ byId: { 101: {...} }, ids: [101, 102, ...] }`. Ventajas:

1. **Búsqueda O(1):** `byId[productId]` sin iterar el array.
2. **Actualización inmutable eficiente:** upsert solo toca el objeto correspondiente.

```jsx
function init(products) {
  return {
    byId: Object.fromEntries(products.map((p) => [p.id, p])),
    ids:  products.map((p) => p.id),
  }
}
```

---

## 3. AUDITORÍA DEL CÓDIGO

### `AdminLayout.jsx`

```jsx
const { view: currentView, navigate } = useNavigation()
const { logout } = useAuth()
```

`AdminLayout` envuelve a sus `children` dentro de `<ProductsProvider>`. El estado de productos del admin **solo existe mientras el layout está montado**: si el usuario cierra sesión, la memoria se libera. Los cambios no persisten entre sesiones porque no hay backend.

```jsx
// Click en ítem de la sidebar
onClick={() => navigate(id)}
// Click en "Nuevo producto" → abre AdminProducts
onClick={() => navigate('admin-products')}
// Cerrar sesión
onClick={() => { logout(); navigate('home') }}
```

Las siete secciones del panel están en `ADMIN_NAV`. `AdminPhotos` es la única vista que **no está en la sidebar**: solo se accede desde el botón de imágenes en la tabla de productos, pasando `params: { productId: p.id }`.

---

### `AdminDashboard.jsx`

```jsx
const { ids, byId } = useProducts()
const products      = ids.map((id) => byId[id])
const lowStock      = products.filter((p) => p.stock > 0 && p.stock <= 3)
```

KPI "Productos activos" muestra `products.length`. Si alguien crea o elimina un producto en `AdminProducts`, este número se actualiza automáticamente porque ambas vistas consumen el mismo contexto.

---

### `AdminProducts.jsx`

```jsx
const [query,      setQuery]      = useState('')
const [drawerOpen, setDrawerOpen] = useState(false)
const [editId,     setEditId]     = useState(null)
const { ids, byId, remove }       = useProducts()
```

Dos estados independientes para el drawer porque tienen ciclos de vida distintos. `editId = null` para producto nuevo, `editId = p.id` para editar.

**Previsualización de precio como valor derivado** (no estado):
```jsx
const precioFinal = descuentoPct_ > 0
  ? Math.round(precioBase_ * (1 - descuentoPct_ / 100))
  : precioBase_
```

**Currying para handlers de formulario:**
```jsx
const f = (field) => (e) => setForm({ ...form, [field]: e.target.value })
```

---

### `AdminPhotos.jsx`

```jsx
const { params, navigate } = useNavigation()
const { ids, byId }        = useProducts()
const paramId  = params.productId           // productId, no id
const product  = byId[paramId] ?? byId[ids[0]]   // fallback al primer producto
```

---

## 4. ENRUTAMIENTO DINÁMICO — ARQUITECTURA

### Router custom sobre History API

Cumbre **no utiliza React Router**. El equipo implementó un router propio en `NavigationContext.jsx`.

```jsx
const [state, dispatch] = useReducer(reducer, {
  currentView: viewFromPath(),
  params:      paramsFromUrl(),   // lee ?id= y ?categoria= al montar
})
```

La función `navigate` acepta string o objeto:
```jsx
const navigate = (payload, options = {}) => {
  dispatch({ payload })
  const view   = typeof payload === 'string' ? payload : payload.view
  const params = typeof payload === 'object' ? (payload.params ?? {}) : {}
  const path   = buildPath(view, params)
  if (window.location.pathname + window.location.search !== path) {
    window.history.pushState({ view, params }, '', path)
  }
}
```

`buildPath` construye `/catalogo?categoria=indumentaria` o `/producto?id=1001`. `paramsFromUrl` los lee al recargar la página, garantizando que las URLs sean compartibles y favoriteables.

---

## 5. ARQUITECTURA DE CARPETAS

```
src/
├── components/          ← piezas reutilizables (presentación)
│   └── ui/              ← átomos: Button, ProductCard, SectionHeader, Toast
├── views/               ← páginas completas (una por ruta)
│   ├── admin/
│   │   ├── AdminLayout.jsx      ← shell + ProductsProvider
│   │   ├── AdminDashboard.jsx   ← KPIs reactivos
│   │   ├── AdminProducts.jsx    ← ABM (tabla + drawer)
│   │   ├── AdminPhotos.jsx      ← drag-and-drop
│   │   ├── AdminVariants.jsx
│   │   ├── AdminCatalog.jsx
│   │   ├── AdminDiscounts.jsx
│   │   ├── AdminOrders.jsx
│   │   └── AdminUsers.jsx
├── context/             ← estado global (Context API + useReducer)
│   ├── AuthContext.jsx
│   ├── CartContext.jsx
│   ├── NavigationContext.jsx
│   └── ProductsContext.jsx
├── data/index.js        ← seed admin, helpers (fmt, computePrice)
├── mocks/data.js        ← datos mock públicos (MOCK_PRODUCTOS, MOCK_USERS)
└── App.jsx              ← router principal + lazy loading
```

**"¿Por qué Context API y no Redux?"**
Para Cumbre, que tiene cuatro dominios de estado bien delimitados, Context API + `useReducer` entrega el mismo contrato de inmutabilidad sin agregar ninguna dependencia externa. Elegir Redux aquí sería *over-engineering*.

---

## 6. VALOR AGREGADO

### `computePrice` — fuente única de verdad para precios

```jsx
export const computePrice = (product) => ({
  price:    product.descuentoPct > 0
    ? Math.round(product.precioBase * (1 - product.descuentoPct / 100))
    : product.precioBase,
  oldPrice: product.descuentoPct > 0 ? product.precioBase : product.precioAnterior,
})
```

Usado tanto en `AdminProducts` como en `ProductCard` del catálogo público. **DRY**: un único lugar donde cambiar la lógica de descuentos.

### Flujo de datos unidireccional

Datos fluyen de `ProductsContext` → vistas vía `useProducts()`. Actualizaciones van exclusivamente a través de los dispatchers `upsert` y `remove` → el reducer retorna nuevo estado → React re-renderiza todos los consumidores automáticamente.

---
---

# INTEGRANTE 2 — Catálogo, Filtros Reactivos y Vista de Detalle

## 1. GUION DE EXPOSICIÓN

### Apertura (30 segundos)

> "Me encargo de la experiencia de compra pública: el Catálogo de productos con sus filtros, y la Vista de Detalle donde el cliente elige talle y agrega al carrito."

### Cuerpo (2-3 minutos)

**1. El Catálogo con filtros reactivos**
> "El catálogo lee los productos de `MOCK_PRODUCTOS`. Los filtros —categoría, marca, temporada y rango de precios— son estado local del componente. Cada vez que el usuario activa un checkbox, el estado cambia y el array de resultados se recalcula con `useMemo`. No hay botón de 'Buscar': la reactividad de React hace que los resultados se actualicen en tiempo real al escribir o filtrar."

*[Mostrá en vivo: aplicar un filtro de categoría, ver el contador de resultados cambiar, limpiar filtros]*

**2. Persistencia de filtros con sessionStorage**
> "Hay un mecanismo que preserva los filtros cuando el usuario navega al detalle de un producto y vuelve. Cuando hace clic en un producto desde el catálogo, guardamos todo el estado de filtros en `sessionStorage`. Al volver, el `useEffect` de Catalogo lo lee, restaura los filtros exactamente como estaban, y borra la entrada del storage. Esto da la sensación de que la página 'recuerda' dónde estabas."

**3. Vista de Detalle y stock por talle**
> "En `ProductoDetalle`, la lógica más interesante es el control de stock por talle. Algunos productos tienen un campo `stockPorTalle` que mapea cada talle a su stock real. Si no existe, calculamos un stock estimado distribuyendo el stock total con una función que asigna más unidades a los talles del centro que a los extremos. Los talles agotados aparecen deshabilitados con un ícono de X, sin posibilidad de selección."

**4. Breadcrumbs dinámicos y navegación de regreso**
> "Los breadcrumbs muestran `Inicio > Categoría > Producto`. Al hacer clic en la categoría, el comportamiento depende de cómo llegó el usuario: si vino del catálogo, restaura todos sus filtros; si vino desde el home o un producto destacado, navega a `/catalogo?categoria=nombre` y el catálogo se inicializa con ese filtro activo. Nunca hay URLs hardcodeadas."

---

## 2. CONCEPTOS TEÓRICOS CLAVE

### `useMemo` — filtrado sin re-cálculo innecesario

`useMemo` memoriza el resultado de una función costosa y solo lo recalcula cuando cambian sus dependencias:

```jsx
const filtrados = useMemo(
  () => MOCK_PRODUCTOS.filter((p) => {
    if (categorias.length && !categorias.includes(p.categoria)) return false
    if (marcas.length     && !marcas.includes(p.marca))         return false
    if (temporadas.length && !temporadas.includes(p.temporada)) return false
    const pf = precioFinal(p)
    if (pf < precioMin || pf > precioMax) return false
    if (busqueda && !p.nombre.toLowerCase().includes(busqueda.toLowerCase())) return false
    return true
  }),
  [busqueda, categorias, marcas, temporadas, precioMin, precioMax]
)
```

Sin `useMemo`, esta función correría en **cada render** del componente, aunque el usuario no haya tocado los filtros. Con `useMemo`, solo corre cuando una de las seis dependencias cambia.

---

### Patrón `toggle` con currying

En lugar de escribir un `handler` por cada filtro, usamos una función de orden superior:

```jsx
const toggle = (setter) => (value) =>
  setter((prev) => prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value])

const toggleCategoria = toggle(setCategorias)
const toggleMarca     = toggle(setMarcas)
const toggleTemporada = toggle(setTemporadas)
```

`toggle` recibe el setter como argumento y devuelve una función que alterna un valor en el array. Es **inmutable**: nunca muta el array anterior, siempre crea uno nuevo con `filter` o spread. Esto es fundamental para que React detecte el cambio de estado y dispare el re-render.

---

### El `key` prop como mecanismo de remontado

En `App.jsx`:
```jsx
<Catalogo key={params.categoria ?? '__all__'} />
```

Cuando la prop `key` cambia (por ejemplo, de `'__all__'` a `'indumentaria'`), React **desmonta el componente existente y monta uno nuevo**. Esto reinicializa todo el estado local, incluyendo `useState(categoriaInicial ? [categoriaInicial] : [])`. Es un patrón React válido para "resetear" un componente ante un cambio de contexto importante, sin necesidad de un `useEffect` que limpie manualmente cada estado.

---

### Persistencia de filtros con `sessionStorage`

`sessionStorage` es un almacenamiento del navegador que persiste solo durante la sesión del tab (a diferencia de `localStorage`, que sobrevive cierres del navegador). Usamos dos entradas:

- **`catalogoState`**: guarda los filtros activos cuando el usuario navega a un producto desde el catálogo. El catálogo lo lee al montar y restaura el estado, luego lo borra.
- **`catalogoReturnFilters`**: se actualiza en tiempo real con cada cambio de filtro, para que otras partes de la app (Carrito) puedan ofrecer "Continuar comprando".

```jsx
// Al navegar al detalle desde el catálogo
const handleProductNavigate = (productoId) => {
  sessionStorage.setItem('catalogoState', JSON.stringify({
    backView: 'catalogo',
    busqueda, categorias, marcas, temporadas, precioMin, precioMax,
  }))
  navigate({ view: 'producto', params: { id: productoId } })
}
```

---

## 3. AUDITORÍA DEL CÓDIGO

### `Catalogo.jsx` — inicialización de filtros

```jsx
const categoriaInicial = params.categoria ?? null

const [busqueda,   setBusqueda]   = useState('')
const [categorias, setCategorias] = useState(categoriaInicial ? [categoriaInicial] : [])
const [marcas,     setMarcas]     = useState([])
const [temporadas, setTemporadas] = useState([])
const [precioMin,  setPrecioMin]  = useState(0)
const [precioMax,  setPrecioMax]  = useState(PRECIO_GLOBAL_MAX)
```

`params.categoria` viene del `NavigationContext` —puede ser `'indumentaria'`, `'calzado'` o `'equipamiento'`— y se convierte en el filtro inicial de categoría. Si el usuario navega desde el breadcrumb de un producto, este param ya está seteado y el catálogo abre directamente filtrado.

### `useEffect` de restauración de filtros

```jsx
useEffect(() => {
  const raw = sessionStorage.getItem('catalogoState')
  if (!raw) return
  try {
    const saved = JSON.parse(raw)
    if (saved.backView === 'catalogo') {
      setBusqueda(saved.busqueda ?? '')
      setCategorias(saved.categorias ?? (categoriaInicial ? [categoriaInicial] : []))
      // ...resto de setters
      sessionStorage.removeItem('catalogoState')
    }
  } catch { /* ignore malformed state */ }
}, []) // array vacío → solo corre al montar
```

El array de dependencias vacío garantiza que este efecto corre **una sola vez** al montar el componente. Si corriera en cada render, entraríamos en un ciclo: leer sessionStorage → actualizar estado → re-render → leer sessionStorage...

---

### `ProductoDetalle.jsx` — stock condicional por talle

```jsx
const getStockParaTalle = (talle) => {
  if (!hayTalles) return producto.stock
  if (producto.stockPorTalle) {
    return talle ? (producto.stockPorTalle[talle] ?? 0) : producto.stock
  }
  // Distribución estimada cuando no hay datos por talle
  const idx = producto.talles.indexOf(talle)
  const n   = producto.talles.length
  const mid = (n - 1) / 2
  const dist = Math.abs(idx - mid)
  const pct  = Math.max(0.15, 1 - (dist / (mid + 1)) * 0.75)
  return Math.max(1, Math.round(producto.stock * pct))
}
```

**Prioridad:** si existe `stockPorTalle` (mapa explícito), se usa directamente. Si no, se distribuye el stock total con una función que asigna más unidades a los talles centrales (los más vendidos en la industria textil). `Math.max(1, ...)` garantiza que nunca mostremos "0 disponibles" para un talle que no esté marcado como agotado.

**Renderizado condicional de talles agotados:**
```jsx
const agotado = stockT === 0
<button
  disabled={agotado}
  className={agotado ? 'border-rock/10 text-rock/25 cursor-not-allowed' : '...activo...'}
>
  <span className={agotado ? 'opacity-40' : ''}>{t}</span>
  {agotado && <X size={14} className="absolute inset-0" />}
</button>
```

El talle agotado es visualmente degradado y tiene `cursor-not-allowed`. El ícono `X` se superpone con `position: absolute`. `disabled` previene el click, pero la apariencia visual es igualmente importante para la UX.

---

### Breadcrumbs — navegación de regreso unificada

```jsx
const handleBack = () => {
  const raw = sessionStorage.getItem('catalogoState')
  if (raw) {
    try {
      const saved = JSON.parse(raw)
      if (saved.backView === 'catalogo') {
        navigate('catalogo')    // useEffect en Catalogo restaura filtros
        return
      }
    } catch { /* ignore */ }
  }
  // Sin historial (vino desde home o enlace directo): navega con filtro de categoría
  navigate({ view: 'catalogo', params: { categoria: producto.categoria } })
}
```

**El bug que existía y cómo se resolvió:** la versión anterior hacía `navigate(producto.categoria)` como fallback, lo que intentaba navegar a una vista llamada `'indumentaria'` o `'equipamiento'`. Esas vistas no existen en el router (no están en `KNOWN_VIEWS`), por lo que `App.jsx` renderizaba el `<LandingPage>` en su lugar. La corrección consiste en navegar siempre a la vista `'catalogo'` pasando la categoría como `params`, lo que activa el filtro reactivamente a través del `key` prop de `App.jsx` y la inicialización de `useState`.

---

## 4. CONCEPTOS ADICIONALES PARA LA DEFENSA

### Conteo dinámico con `countFor`

El componente `FilterContent` muestra cuántos productos tiene cada opción de filtro, considerando los demás filtros activos:

```jsx
const countFor = (dimension, value) =>
  MOCK_PRODUCTOS.filter((p) => {
    const cats = dimension === 'categoria' ? [value] : (categorias.length ? categorias : null)
    if (cats && !cats.includes(p.categoria)) return false
    // ... mismo patrón para marca y temporada
    return pf >= precioMin && pf <= precioMax
  }).length
```

Es una función pura que simula la aplicación de los filtros actuales **más** el valor que se está evaluando. Permite mostrar `(0)` junto a un checkbox cuando activarlo dejaría la lista vacía.

### Estado de UI vs estado de dominio

El catálogo tiene dos tipos de estado claramente separados:
- **Estado de dominio:** `busqueda`, `categorias`, `marcas`, `temporadas`, `precioMin`, `precioMax`. Son los datos.
- **Estado de UI:** `mobileOpen`. Controla si el drawer de filtros móviles está abierto. No tiene impacto en los resultados.

Separar estos conceptos es una buena práctica porque el estado de UI es efímero (se resetea en cada visita), mientras que el estado de dominio puede persistirse.

---
---

# INTEGRANTE 3 — Autenticación, Carrito, Checkout y Contextos Globales

## 1. GUION DE EXPOSICIÓN

### Apertura (30 segundos)

> "Me ocupé del sistema de autenticación, el carrito de compras y el proceso de checkout. Son los tres flujos que conectan la navegación del usuario con la conversión final."

### Cuerpo (2-3 minutos)

**1. Autenticación**
> "El login valida contra `MOCK_USERS`. Si el email y la contraseña coinciden, despachamos la acción `SUCCESS` con el usuario —sin su contraseña, que se elimina antes de guardarla en el estado—. Si el usuario tenía un intento de navegar a una página protegida antes de loguearse, el campo `returnTo` lo redirige ahí automáticamente después del login."

**2. Carrito con persistencia**
> "El carrito usa `CartContext` con `useReducer`. El estado tiene los `items`, el cupón activo y el toast de notificación. Lo interesante es que **persiste en `localStorage`**: cada vez que el estado cambia, un `useEffect` serializa `items` y `coupon` a JSON y los guarda. Al recargar la página, `loadSaved()` recupera esos datos para inicializar el reducer."

*[Mostrá: agregar productos, cerrar el tab, abrir de nuevo — el carrito se mantiene]*

**3. Sistema de cupones**
> "El carrito acepta cupones. Hay dos tipos: porcentaje (10% sobre el subtotal) y monto fijo ($5.990 de descuento). La lógica vive en el reducer con la acción `APPLY_COUPON`. `computeTotals` es una función pura que calcula subtotal, descuento y total a partir de `items` y el cupón activo."

**4. Checkout en tres pasos**
> "El checkout es un wizard de tres pasos: Envío, Pago y Confirmación. El estado `step` controla cuál se muestra. Las validaciones son estrictas: dirección debe tener letras y números, ciudad y provincia solo letras, código postal solo dígitos. Para tarjetas, verificamos que sean 16 dígitos, que el titular tenga nombre y apellido, y el formato MM/AA del vencimiento. Todo con expresiones regulares que evaluamos antes de avanzar al siguiente paso."

---

## 2. CONCEPTOS TEÓRICOS CLAVE

### `useReducer` para estado complejo

Cuando un estado tiene múltiples sub-valores que se actualizan de forma relacionada, `useReducer` es más apropiado que múltiples `useState`. El carrito tiene: `items`, `coupon`, `couponError`, `toast`. Cualquier acción puede afectar varios de estos a la vez:

```jsx
case 'ADD': {
  // Modifica items Y activa toast simultáneamente
  return { ...state, items: [...], toast: { visible: true, productName: p.nombre } }
}
```

Con `useState` separados, necesitaríamos dos llamadas consecutivas a setters y correríamos el riesgo de renders inconsistentes entre ellas.

---

### Inmutabilidad del estado

React detecta cambios de estado por **referencia**, no por contenido. Por eso, siempre retornamos nuevos objetos:

```jsx
// CORRECTO — nuevo objeto, nueva referencia → React detecta el cambio
return { ...state, items: state.items.map((i) => i.lineId === key ? { ...i, qty: i.qty + qty } : i) }

// INCORRECTO — mutación directa → React NO detecta el cambio
state.items.push(nuevoItem)  // ❌
return state
```

El operador spread `{...state}` crea una copia superficial del objeto. Para arrays, `filter` y `map` también crean nuevos arrays.

---

### Persistencia en `localStorage` con `useEffect`

```jsx
const prevRef = useRef(state)
useEffect(() => {
  if (state === prevRef.current) return    // evita escritura innecesaria
  prevRef.current = state
  localStorage.setItem('cumbre_cart', JSON.stringify({ items: state.items, coupon: state.coupon }))
}, [state])
```

El `useRef` actúa como un "valor anterior": si `state` no cambió de referencia, no escribimos en localStorage. Esto evita una escritura en cada render aunque el estado no haya cambiado. El `useEffect` con `[state]` como dependencia corre cada vez que el reducer retorna un nuevo estado.

**localStorage vs sessionStorage:**
- `localStorage`: persiste indefinidamente (hasta que el usuario lo borre). Ideal para el carrito.
- `sessionStorage`: persiste solo en la sesión del tab. Ideal para estado temporal de navegación (filtros del catálogo).

---

### Validaciones con Expresiones Regulares

`Checkout.jsx` implementa dos funciones de validación que usan regex:

```jsx
function validateShip(s) {
  const e = {}
  if (!s.nombre.trim()) e.nombre = 'Requerido'

  // Dirección debe contener letras Y números (calle + número)
  if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(s.direccion)) e.direccion = 'Debe contener letras'
  if (!/\d/.test(s.direccion))                      e.direccion = 'Debe incluir número de calle'

  // Ciudad y provincia: solo letras (no aceptamos "4ta Sección")
  if (/\d/.test(s.ciudad))    e.ciudad    = 'Solo letras permitidas'

  // CP y teléfono: solo dígitos
  if (!/^\d+$/.test(s.cp))       e.cp       = 'Solo números'
  if (s.telefono.length < 8)     e.telefono = 'Mínimo 8 dígitos'

  return e
}

function validateCard(c) {
  const e = {}
  const d = c.numero.replace(/\s/g, '')          // quitar espacios del formato visual

  if (!/^\d{16}$/.test(d))   e.numero  = '16 dígitos requeridos'

  // Titular: solo letras y al menos 2 palabras (nombre y apellido)
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(c.titular))             e.titular = 'Solo letras'
  if (c.titular.trim().split(/\s+/).filter(Boolean).length < 2)     e.titular = 'Ingresá nombre y apellido'

  if (!/^\d{2}\/\d{2}$/.test(c.exp)) e.exp = 'Formato MM/AA'
  if (!/^\d{3,4}$/.test(c.cvv))      e.cvv = 'CVV inválido'

  return e
}
```

El patrón es siempre el mismo: retornar un objeto `e` donde cada clave es un campo con error. Si `Object.keys(e).length > 0`, hay errores y no avanzamos al siguiente paso.

---

### Input masking en tiempo real

Los campos de tarjeta tienen formateo automático mientras el usuario escribe:

```jsx
const fmtCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
// "4111111111111111" → "4111 1111 1111 1111"

const fmtExp  = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4)
  return d.length >= 3 ? d.slice(0,2) + '/' + d.slice(2) : d
}
// "1225" → "12/25"
```

`fmtCard` elimina todo carácter no-dígito, limita a 16 y agrega un espacio cada cuatro dígitos con un regex de captura de grupo. `fmtExp` inserta el `/` automáticamente cuando se tienen más de 2 dígitos. Estas transformaciones ocurren en el handler `onChange` antes de guardar en el estado, sin librerías externas.

---

## 3. AUDITORÍA DEL CÓDIGO

### `AuthContext.jsx`

```jsx
const initialState = {
  user:       null,
  isLoggedIn: false,
  status:     'idle',   // 'idle' | 'loading' | 'error'
  error:      null,
  returnTo:   'home',
}
```

El estado `status` con tres valores es un patrón común para representar flujos asíncronos: `'idle'` (en reposo), `'loading'` (esperando), `'error'` (falló). Así el componente de login puede mostrar un spinner mientras `status === 'loading'` y el mensaje de error cuando `status === 'error'`.

**Strip de contraseña antes de guardar en estado:**
```jsx
const { password: _, ...safeUser } = user
dispatch({ type: 'SUCCESS', payload: safeUser })
```

Destructuring con renombramiento (`password: _`) extrae el campo `password` y con `...safeUser` captura el resto del objeto. La contraseña nunca llega al estado de React ni al contexto global. Es una práctica básica de seguridad aunque los datos sean mock.

**Flujo de `returnTo`:**
```jsx
navigate(safeUser.rol === 'admin' ? 'admin-dashboard' : (state.returnTo || 'home'))
```

Si el usuario intentó acceder a una vista protegida (ej. Perfil) sin estar logueado, `setReturnTo` guarda esa vista. Después del login exitoso, se redirige automáticamente ahí. Si no hay `returnTo`, va al home (o al panel admin si es admin).

---

### `CartContext.jsx`

**Line ID compuesto para unicidad por talle:**
```jsx
const key = `p${p.productId}-${p.talle || 'unico'}`
```

Dos ítems del mismo producto pero de distinto talle son líneas separadas en el carrito. `p10001-M` y `p10001-L` son líneas distintas. Si se agrega el mismo producto+talle, se incrementa la cantidad en lugar de crear una línea nueva:

```jsx
const hit = state.items.find((i) => i.lineId === key)
return {
  ...state,
  items: hit
    ? state.items.map((i) => i.lineId === key ? { ...i, qty: i.qty + qty } : i)
    : [...state.items, { lineId: key, ... }],
  toast: { visible: true, productName: p.nombre },
}
```

**`computeTotals` — función pura:**
```jsx
function computeTotals(items, coupon) {
  const subtotal = items.reduce((s, i) => s + i.precio * i.qty, 0)
  const discount = coupon
    ? coupon.type === 'percent' ? Math.round(subtotal * coupon.value) : coupon.value
    : 0
  return {
    subtotal,
    discount,
    total:     Math.max(0, subtotal - discount),
    itemCount: items.reduce((n, i) => n + i.qty, 0),
  }
}
```

Es una función pura: dado el mismo input, siempre da el mismo output. No tiene efectos secundarios. Se llama en el `value` del Provider para que todos los consumidores siempre lean `totals` actualizado.

---

### `Checkout.jsx` — wizard de tres pasos

```jsx
const [step, setStep] = useState(1)   // 1 = Envío, 2 = Pago, 3 = Confirmación

const goStep2 = () => {
  const e = validateShip(ship)
  if (Object.keys(e).length > 0) { setShipErrors(e); return }
  setShipErrors({})
  setStep(2)
  window.scrollTo({ top: 0 })
}
```

Cada transición de paso valida el formulario actual. Si hay errores, `setStep(2)` no se ejecuta: el `return` aborta la función. Esto garantiza que el usuario no pueda avanzar con datos inválidos.

**Renderizado condicional por paso:**
```jsx
{step === 1 && <Section title="Datos de envío">...</Section>}
{step === 2 && <Section title="Medio de pago">...</Section>}
{step === 3 && <Section title="Confirmá tu pedido">...</Section>}
```

Los tres pasos **comparten el mismo `useState` de orden**: `ship`, `card`, `payMethod`. Esto permite que el Paso 3 muestre un resumen con los datos ingresados en los pasos anteriores, y que el usuario pueda editar y volver sin perder lo completado.

**Confirmación asíncrona simulada:**
```jsx
const confirmar = async () => {
  setProcessing(true)
  await new Promise((r) => setTimeout(r, 900))   // simula latencia de red
  const n = `#ORD-${Math.floor(Math.random() * 90000 + 10000)}`
  setOrderNumber(n)
  clearCart()
  setProcessing(false)
}
```

Mientras `processing === true`, el botón muestra un spinner y queda `disabled`. Al completar, `clearCart()` despacha la acción `CLEAR` al `CartContext`, que vacía los items y el cupón, y `localStorage` se actualiza automáticamente por el `useEffect` de persistencia.

---

## 4. CONCEPTOS ADICIONALES PARA LA DEFENSA

### El Toast como estado global

El `CartContext` incluye un sub-estado para el toast de "¡Producto agregado!":
```jsx
toast: { visible: false, productName: null }
```

Cuando se despacha `ADD`, el reducer activa `toast.visible = true`. El componente `Toast.jsx` en `App.jsx` lo lee con `useCart()` y se muestra automáticamente. Un `useEffect` en `Toast` con `setTimeout` despacha `HIDE_TOAST` después de 3 segundos. Este patrón desacopla el "disparo" del toast (CartContext) de su "visualización" (Toast component) sin pasar props.

### Por qué `useRef` para el valor anterior en el efecto de localStorage

```jsx
const prevRef = useRef(state)
useEffect(() => {
  if (state === prevRef.current) return
  prevRef.current = state
  localStorage.setItem(...)
}, [state])
```

`useRef` crea un contenedor mutable que **no provoca re-renders** cuando cambia. Es la herramienta correcta para guardar el "estado anterior" sin crear un ciclo de render. Si usáramos `useState` para esto, actualizar el valor anterior causaría un render, que podría causar el efecto nuevamente, creando un loop.

---
---

# GLOSARIO TÉCNICO UNIFICADO

| Término | Definición en el contexto de Cumbre |
|---------|-------------------------------------|
| **SPA** (Single-Page Application) | Cumbre es una SPA: el navegador carga el HTML una sola vez. La navegación entre vistas es gestionada por JavaScript (el `NavigationContext`) sin recargas de página. |
| **Estado reactivo** | Dato que, al cambiar, provoca que React re-renderice los componentes que lo consumen. Todo `useState` y `useReducer` es estado reactivo. |
| **Flujo de datos unidireccional** | Los datos fluyen de contextos/providers → componentes (hacia abajo). Las actualizaciones van de componentes → dispatchers/setters → contextos (hacia arriba). Nunca hay flujo lateral directo. |
| **Renderizado condicional** | Mostrar u ocultar partes de la UI según el estado. Ejemplo: `{hayTalles && <SelectorTalles />}`. |
| **Inmutabilidad** | El estado nunca se muta directamente. Siempre se crea un nuevo objeto con los cambios. React compara referencias para decidir si re-renderizar. |
| **Lazy loading** | `App.jsx` usa `React.lazy()` para cargar los componentes de vista solo cuando el usuario navega a ellos, reduciendo el bundle inicial. |
| **Derivar vs almacenar** | Si un valor se puede calcular a partir de otros estados, no debe tener su propio `useState`. Ejemplos: `filtrados` (de `useMemo`), `precioFinal` (calculado en render), `totals` (de `computeTotals`). |
