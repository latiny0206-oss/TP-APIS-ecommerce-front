# Defensa de Examen — Panel de Administración
### Cumbre E-commerce · React + Vite + Context API + Tailwind CSS

---

## 1. GUION DE EXPOSICIÓN

### Apertura (30 segundos)

> "Buenas, les presento Cumbre, un e-commerce de indumentaria y equipamiento de montaña. Lo que voy a mostrarles hoy es el Panel de Administración: la sección que construimos para que los dueños del negocio gestionen el catálogo en tiempo real, sin tocar código."

### Cuerpo (2-3 minutos — mostralo en vivo mientras hablás)

**1. Acceso al panel**
> "Para entrar al panel, el admin inicia sesión con sus credenciales (`admin@cumbre.com` / `admin123`). El `AuthContext` ejecuta la función `login`, que valida contra el mock de usuarios. Si encuentra el usuario, despacha la acción `SUCCESS` con `safeUser` —el objeto de usuario sin la contraseña— y, al detectar `rol === 'admin'`, llama a `navigate('admin-dashboard')`. Una vez dentro, se carga el `AdminLayout`, que es el shell del panel: sidebar a la izquierda con siete ítems de navegación y overflow de scroll independiente, y el área de contenido a la derecha. Notar que `AdminLayout` es también quien instancia `<ProductsProvider>`, lo que significa que el estado de productos del admin existe solo mientras el layout está montado. Todo esto vive en `/views/admin/`."

**2. El Tablero (AdminDashboard)**
> "La primera pantalla es el Tablero. Acá se ven KPIs en tiempo real: la cantidad de productos activos —leída directamente del `ProductsContext` como `products.length`, donde `products = ids.map(id => byId[id])`—, órdenes pendientes, descuentos activos y clientes registrados. Abajo hay una tabla con las últimas órdenes con estados coloreados mediante el mapa `STATUS_COLORS`, y dos widgets de alerta: uno de stock bajo —filtra los productos con `p.stock > 0 && p.stock <= 3` y muestra hasta cuatro alertas— y uno de descuentos próximos a vencer. Si alguien crea o elimina un producto en `AdminProducts`, el KPI de Productos activos se actualiza de forma reactiva aquí también, porque ambas vistas leen del mismo contexto."

**3. ABM de Productos (AdminProducts)**
> "Acá está el corazón del panel. Hay una tabla con todos los productos, con búsqueda en tiempo real por nombre o marca: el estado `query` filtra `(p.nombre + ' ' + p.brand).toLowerCase().includes(query.toLowerCase())` en cada re-render. Cada fila tiene tres acciones: editar (abre el Drawer), gestionar imágenes (navega a `admin-photos` con `params: { productId: p.id }`) y eliminar (despacha `remove(p.id)` al contexto). Cuando hacés clic en editar o en 'Nuevo producto', se abre un Drawer —un panel lateral deslizante— con el formulario de alta/edición."

*[Mostrá en vivo: crear un producto, ponerle nombre, precio, descuento. Ver la previsualización de precio en tiempo real]*

> "El formulario tiene validación del lado del cliente: si dejás el nombre vacío o el precio en cero, muestra el error inline sin enviar nada. Si configurás un descuento entre 1 y 100%, la app computa en tiempo real el precio final con `Math.round(precioBase * (1 - descuentoPct / 100))` y lo muestra con el tachado del precio original, igual que lo ve el cliente en el catálogo."

**4. Gestor de Imágenes (AdminPhotos)**
> "Se accede desde el botón de imágenes en la tabla de productos: llama a `navigate({ view: 'admin-photos', params: { productId: p.id } })`. `AdminPhotos` lee `params.productId` del contexto de navegación para saber qué producto está editando. Tiene un área de drag-and-drop: arrastrás una imagen, `onDrop` dispara `fakeUpload(e.dataTransfer.files)`, que simula la subida con un `setInterval` que incrementa el progreso y, al llegar a 100%, mueve el ítem de `queue` a `photos`. El estado de fotos se inicializa de forma lazy con `useState(() => ...)` para que el mapeo de `product.images` corra solo una vez en el montaje."

### Cierre
> "En resumen, armamos un panel completo con lectura de datos del contexto global, escritura (altas, ediciones y bajas que persisten en memoria mientras navegás), validaciones de formulario, manejo de imágenes y una UX cuidada. Todo en React con Context API, sin Redux, sin recargar la página, implementando patrones reconocibles de la industria como estado normalizado, lazy initialization, flujo de datos unidireccional y enrutamiento declarativo custom."

---

## 2. CONCEPTOS TEÓRICOS CLAVE

### ¿Qué es React y por qué lo usamos?

React es una **biblioteca de JavaScript** para construir interfaces de usuario. La idea central es dividir la UI en **componentes**: piezas de código que devuelven HTML y encapsulan su propia lógica.

**Analogía:** pensá en una app como si fuera una maqueta de LEGO. React te da los bloques estandarizados (`Button`, `ProductCard`, `AdminLayout`). Podés armar distintas habitaciones (páginas) reutilizando los mismos bloques, sin fabricar uno nuevo cada vez.

Lo usamos porque:
- El código se organiza en partes pequeñas y reutilizables.
- Cuando cambia un dato, React actualiza **solo** la parte de la UI que lo necesita.
- Context API permite compartir estado global sin instalar librerías externas.

---

### ¿Qué es el Virtual DOM?

El DOM es la representación en memoria del HTML de la página. Modificarlo directamente es costoso.

React introduce el **Virtual DOM**: una copia liviana del DOM real en JavaScript. Cuando un estado cambia:
1. Genera un nuevo Virtual DOM con los cambios.
2. Lo compara con el anterior (algoritmo **diffing** o **reconciliation**).
3. Calcula exactamente qué nodos cambiaron.
4. Aplica **solo esos cambios** al DOM real.

**Analogía:** es como usar un papel de borrador antes de pasar en limpio. No borrás todo el dibujo, solo la parte que cambió.

---

### ¿Qué es el re-renderizado?

Un componente se **re-renderiza** cuando:
- Cambia su **estado interno** (`useState` / `useReducer`).
- Cambia alguna **prop** que recibe desde afuera.
- Cambia algún valor del **contexto global** que lee con `useContext`.

En nuestro proyecto: cuando el admin escribe en el buscador de productos, el estado `query` cambia → `AdminProducts` se re-renderiza → la tabla filtra los resultados. Solo esa tabla se actualiza, el resto del panel queda intacto.

---

### ¿Qué son el Estado y los Hooks?

**Estado** es cualquier dato que puede cambiar con el tiempo y que, cuando cambia, debe actualizar la pantalla.

**Hooks** son funciones especiales de React (empiezan con `use`) que permiten "enganchar" funcionalidades del framework dentro de componentes funcionales.

Los más usados en este proyecto:

| Hook | Para qué sirve |
|------|----------------|
| `useState` | Guardar y modificar estado local del componente |
| `useReducer` | Manejar estado complejo con acciones tipadas (carrito, auth, productos, navegación) |
| `useContext` | Leer valores del contexto global |
| `useEffect` | Ejecutar código con efectos secundarios (sincronizar con el historial del navegador, registrar listeners) |
| `useMemo` | Calcular valores derivados solo cuando cambian sus dependencias |

**Regla de oro de los hooks:** solo se pueden usar dentro de componentes funcionales o custom hooks, nunca dentro de `if`, `for` o funciones anidadas.

**Lazy initialization de `useState`:** una optimización importante que usamos en `ProductDrawer` y en `AdminPhotos`. En lugar de pasar un valor directo a `useState`, pasamos una función `() => calcularValorInicial()`. React ejecuta esa función **solo en el primer render**, ignorándola en los re-renders posteriores. Esto es crítico cuando la inicialización involucra trabajo costoso como mapear arrays o leer de un objeto.

---

### ¿Por qué Context API en lugar de Redux?

Redux requiere instalar librerías adicionales (`@reduxjs/toolkit`, `react-redux`), definir slices, `configureStore`, `Provider` y conectar cada componente. Para una aplicación de este tamaño es sobrediseño.

Context API es nativa de React y suficiente cuando:
- Los datos globales son pocos y bien delimitados (auth, carrito, navegación, productos del admin).
- No necesitás middleware complejo ni DevTools de Redux.
- El equipo prefiere menos capas de abstracción.

En Cumbre usamos un patrón `useReducer` + `createContext` en cada contexto, que ofrece las mismas garantías de inmutabilidad que Redux pero sin dependencias externas.

---

### Estado normalizado: el patrón `byId` + `ids`

Un detalle arquitectónico importante de `ProductsContext` es cómo se estructura el estado:

```jsx
// Estado: { byId: { 101: {...}, 102: {...} }, ids: [101, 102, ...] }
```

En lugar de guardar los productos en un array plano, usamos un **objeto indexado por ID** (`byId`) junto con un **array de IDs ordenado** (`ids`). Este patrón —conocido en la industria como _normalized state_ y adoptado por Redux Toolkit's `createEntityAdapter`— tiene dos ventajas concretas:

1. **Búsqueda O(1):** `byId[productId]` es acceso directo al objeto, sin iterar el array.
2. **Actualización inmutable eficiente:** al hacer upsert, React solo re-renderiza los componentes que leen `byId[id]` específico, no toda la lista.

La función `init` inicializa este estado desde el array seed:

```jsx
function init(products) {
  return {
    byId: Object.fromEntries(products.map((p) => [p.id, p])),
    ids:  products.map((p) => p.id),
  }
}
```

---

## 3. AUDITORÍA DE MI CÓDIGO

### `AdminLayout.jsx`

#### Hooks

```jsx
const { view: currentView, navigate } = useNavigation()
const { logout } = useAuth()
```

**¿Qué hace en Cumbre?**
`currentView` es el "¿en qué pantalla estoy?" que viene del `NavigationContext`. Con ese dato, el layout resalta el ítem activo de la sidebar con la clase `bg-alpenglow`. No necesita estado local propio: la fuente de verdad sobre la navegación vive en el contexto.

**Detalle arquitectónico importante:** `AdminLayout` envuelve a sus `children` dentro de `<ProductsProvider>`. Esto significa que el estado de productos del administrador —los 8 productos del seed, más los que se creen en sesión— **solo existe mientras el layout está montado**. Es una decisión de scoping consciente: si el usuario cierra sesión y el layout se desmonta, la memoria se libera. Los cambios no persisten entre sesiones porque no hay backend; son en memoria.

#### Eventos

```jsx
// Click en ítem de la sidebar → cambia la vista del panel
onClick={() => navigate(id)}

// Click en "Nuevo producto" en el footer de la sidebar → navega a la vista de productos
onClick={() => navigate('admin-products')}

// Click en "Salir" → limpia las credenciales y redirige al home público
onClick={() => { logout(); navigate('home') }}
```

#### Las siete secciones del panel

El `ADMIN_NAV` define **siete vistas** accesibles desde la sidebar: Tablero, Productos, Variantes, Catálogo, Descuentos, Órdenes y Usuarios. `AdminPhotos` es la única vista que **no está en la sidebar**: se accede exclusivamente desde el botón de imágenes en la tabla de `AdminProducts`, pasando `params: { productId: p.id }`.

---

### `AdminDashboard.jsx`

#### Hooks

```jsx
const { ids, byId } = useProducts()
const products      = ids.map((id) => byId[id])
const lowStock      = products.filter((p) => p.stock > 0 && p.stock <= 3)
```

**¿Qué hace en Cumbre?**
`useProducts()` es el custom hook que expone el `ProductsContext`. Reconstruye el array completo de productos a partir del estado normalizado y filtra los de stock bajo (`p.stock > 0 && p.stock <= 3`; el `p.stock > 0` es importante porque excluye los agotados, que tienen su propia lógica de presentación). El KPI "Productos activos" muestra `products.length` — si alguien crea o elimina un producto en `AdminProducts`, este número se actualiza aquí también, porque ambas vistas leen del mismo `ProductsContext`.

**Flujo de datos unidireccional:** el dato nace en `ProductsContext`, fluye por props y hooks hacia los consumidores (`AdminDashboard`, `AdminProducts`), y se actualiza solo a través de los dispatchers `upsert` y `remove`. Nadie modifica el estado directamente; siempre pasan por el reducer.

---

### `AdminProducts.jsx`

#### Hooks

```jsx
const [query,      setQuery]      = useState('')
const [drawerOpen, setDrawerOpen] = useState(false)
const [editId,     setEditId]     = useState(null)
const { ids, byId, remove }       = useProducts()
const { navigate }                = useNavigation()
```

**¿Qué hace en Cumbre?**
`query` controla el input de búsqueda — cada vez que el usuario escribe, React re-renderiza y la tabla filtra en tiempo real sin botón de "buscar". `drawerOpen` es el flag booleano que controla la visibilidad del drawer. `editId` almacena el ID del producto a editar: `null` cuando el drawer abre para un producto nuevo, o el ID numérico cuando edita uno existente. Son dos estados independientes porque tienen ciclos de vida distintos.

#### Apertura y cierre del Drawer

```jsx
const openDrawer  = (id = null) => { setEditId(id); setDrawerOpen(true) }
const closeDrawer = ()          => { setDrawerOpen(false); setEditId(null) }
```

#### Eventos

```jsx
// Escribir en el buscador → actualiza el filtro en tiempo real
onChange={(e) => setQuery(e.target.value)}

// Click en "Nuevo producto" → abre drawer sin producto asociado (editId = null)
onClick={() => openDrawer()}

// Click en editar → abre drawer con datos del producto (editId = p.id)
onClick={() => openDrawer(p.id)}

// Click en imágenes → navega al gestor con el ID del producto en params
onClick={() => navigate({ view: 'admin-photos', params: { productId: p.id } })}

// Click en eliminar → despacha REMOVE al contexto inmediatamente
onClick={() => remove(p.id)}
```

#### `ProductDrawer` — sub-componente del formulario

```jsx
// Lazy initialization: la función se ejecuta solo en el primer render
const [form, setForm] = useState(() =>
  existing
    ? {
        nombre:       existing.nombre,
        descripcion:  existing.descripcion || '',
        marcaId:      existing.marcaId,
        categoriaId:  existing.categoriaId,
        precioBase:   existing.precioBase,
        estado:       existing.estado || 'ACTIVO',
        tag:          existing.tag || '',
        descuentoPct: existing.descuentoPct ?? 0,
      }
    : { nombre: '', descripcion: '', marcaId: 1, categoriaId: 1, precioBase: 0, estado: 'ACTIVO', tag: '', descuentoPct: 0 }
)
const [errors, setErrors] = useState({})

// Currying: f('campo') devuelve el handler onChange para ese campo específico
const f = (field) => (e) => setForm({ ...form, [field]: e.target.value })

// Guardar: valida → si ok, construye el objeto producto y despacha upsert al contexto
const save = () => {
  const e = validate()
  if (Object.keys(e).length > 0) { setErrors(e); return }

  const descuentoPct = Number(form.descuentoPct)
  const precioBase   = Number(form.precioBase)
  const next = {
    ...(existing || {}),
    id:           existing?.id ?? (Date.now() % 100000 + 200),
    nombre:       form.nombre,
    precioBase,
    descuentoPct,
    price:        descuentoPct > 0 ? Math.round(precioBase * (1 - descuentoPct / 100)) : precioBase,
    precioAnterior: descuentoPct > 0 ? precioBase : (existing?.precioAnterior ?? null),
    // ...resto de campos
  }
  upsert(next)
  onClose()
}
```

**Previsualización de precio en tiempo real:** mientras el usuario escribe en los campos de precio y descuento, el componente deriva `precioFinal` directamente en el cuerpo de la función —sin estado adicional, sin `useEffect`— y lo muestra condicionalmente:

```jsx
const precioBase_   = Number(form.precioBase)  || 0
const descuentoPct_ = Number(form.descuentoPct) || 0
const precioFinal   = descuentoPct_ > 0
  ? Math.round(precioBase_ * (1 - descuentoPct_ / 100))
  : precioBase_
```

Esto es un ejemplo de **valor derivado**: no es estado, es el resultado de calcular sobre el estado existente. Calcularlo en render es más simple y correcto que mantener un tercer `useState`.

**Validación del formulario** (client-side):

```jsx
const validate = () => {
  const e = {}
  if (!form.nombre.trim())            e.nombre      = 'Ingresá un nombre'
  if (Number(form.precioBase) <= 0)   e.precioBase  = 'El precio debe ser mayor a 0'
  const pct = Number(form.descuentoPct)
  if (pct < 0 || pct > 100)          e.descuentoPct = 'Ingresá un valor entre 0 y 100'
  return e
}
```

Los errores se muestran `inline` bajo cada campo al intentar guardar. Si el objeto `e` tiene al menos una clave, `setErrors(e)` actualiza el estado de errores y `return` aborta el guardado sin tocar el contexto.

---

### `AdminPhotos.jsx`

#### Hooks

```jsx
const { params, navigate }  = useNavigation()
const { ids, byId }         = useProducts()
const paramId  = params.productId          // viene de navigate({ params: { productId: p.id } })
const product  = byId[paramId] ?? byId[ids[0]]   // fallback al primer producto si no hay id

const [photos,   setPhotos]   = useState(() =>
  (product?.images || []).map((src, i) => ({
    id: `ph${i}`, src, name: `${product?.id ?? 0}_foto_${i + 1}.jpg`, size: '2.4 MB',
  }))
)
const [queue,    setQueue]    = useState([...])
const [dragOver, setDragOver] = useState(false)
```

**¿Qué hace en Cumbre?**
El parámetro `params.productId` (no `params.id`) es la clave que identifica el producto a gestionar. Este parámetro llega porque `AdminProducts` navega con `{ view: 'admin-photos', params: { productId: p.id } }`. Si no existiera ese param, el componente hace fallback al primer producto del contexto para no quedar vacío.

`dragOver` controla el estilo visual de la zona de drop (borde verde animado). `queue` persiste el historial de subidas con su progreso porcentual. La función `fakeUpload` usa `setInterval` para simular la progresión: en cada tick incrementa el progreso con un valor aleatorio, y cuando supera 100 limpia el intervalo, marca el ítem como `done: true` en `queue` y lo agrega a `photos`.

---

## 4. ENRUTAMIENTO DINÁMICO — ARQUITECTURA Y CORRECCIÓN

### ¿Cómo está implementado el sistema de rutas en Cumbre?

Cumbre **no utiliza React Router** ni ninguna librería externa de navegación. El equipo implementó un router propio sobre la History API del navegador, encapsulado en `NavigationContext.jsx`. Esta decisión reduce el bundle final y elimina una dependencia que resultaría sobredimensionada para la cantidad de vistas del proyecto.

El sistema tiene tres piezas clave:

**1. Estado de navegación con `useReducer`**

```jsx
// NavigationContext.jsx
const [state, dispatch] = useReducer(reducer, {
  currentView: viewFromPath(),   // lee la URL actual al montar
  params:      paramsFromUrl(),  // lee ?id=XXXX y ?categoria=XXX de la query string
})
```

`currentView` determina qué vista renderiza `App.jsx`. `params` transporta el ID del producto o la categoría activa sin necesidad de path segments adicionales.

**2. La función `navigate` como despacho + historial**

```jsx
const navigate = (payload, options = {}) => {
  dispatch({ payload })                                    // actualiza el contexto React
  const view   = typeof payload === 'string' ? payload : payload.view
  const params = typeof payload === 'object' ? (payload.params ?? {}) : {}
  const path   = buildPath(view, params)                   // construye la URL con ?id y/o ?categoria
  if (window.location.pathname + window.location.search !== path) {
    if (options.replace) {
      window.history.replaceState({ view, params }, '', path)
    } else {
      window.history.pushState({ view, params }, '', path)  // nueva entrada en el historial
    }
  }
}
```

El payload puede ser un `string` (navegación simple: `navigate('catalogo')`) o un objeto con `view` y `params` (navegación con datos: `navigate({ view: 'producto', params: { id: 1001 } })`). El reducer discrimina ambos casos.

El estado de la navegación vive en memoria (React Context) y se sincroniza con el historial del navegador vía `pushState`. El botón "atrás" dispara el evento `popstate`, que a su vez actualiza el contexto con los datos guardados en el historial. El listener se registra en un `useEffect` con array de dependencias vacío (se ejecuta solo una vez al montar el provider).

**3. Persistencia del ID y la categoría en la URL**

La función auxiliar `buildPath` construye URLs del tipo `/producto?id=1001` o `/catalogo?categoria=indumentaria`, y `paramsFromUrl` las lee al cargar la página. También maneja compatibilidad con URLs legadas como `/indumentaria` (redirige a `/catalogo?categoria=indumentaria`):

```jsx
function buildPath(view, params) {
  const base = view === 'home' ? '/' : `/${view}`
  const search = new URLSearchParams()
  if (params?.id != null)  search.set('id',       String(params.id))
  if (params?.categoria)   search.set('categoria', params.categoria)
  const qs = search.toString()
  return qs ? `${base}?${qs}` : base
}

function paramsFromUrl() {
  const search = new URLSearchParams(window.location.search)
  const id       = search.get('id')
  const categoria = search.get('categoria')
  const legacyCategoria = LEGACY_CATEGORY_MAP[
    window.location.pathname.replace(/^\//, '').split('/')[0]
  ]
  return {
    ...(id !== null ? { id: Number(id) } : {}),
    ...(categoria ? { categoria } : legacyCategoria ? { categoria: legacyCategoria } : {}),
  }
}
```

---

### El bug de enrutamiento que existía y cómo se resolvió

#### Diagnóstico

El sistema de rutas tenía **tres defectos relacionados** que producían redirecciones rotas al navegar al detalle de un producto:

**Defecto 1 — URL sin parámetro de producto (crítico)**
La función `navigate` construía rutas sin incluir el ID del producto:
```jsx
// ANTES (bug): URL siempre era /producto sin importar qué producto
const path = view === 'home' ? '/' : `/${view}`
```
Consecuencia: al recargar la página estando en `/producto`, el contexto se inicializaba con `params: {}`, `getProductoById(undefined)` devolvía `null`, y el componente `ProductoDetalle` mostraba la pantalla de error "Producto no encontrado".

**Defecto 2 — Estado inicial sin lectura de query string**
El estado inicial del contexto ignoraba la query string de la URL:
```jsx
// ANTES (bug): params siempre arrancaba vacío
const [state, dispatch] = useReducer(reducer, {
  currentView: viewFromPath(),
  params: {},  // ← nunca leía ?id=1001 de la URL
})
```

**Defecto 3 — Comparación incompleta de URL en `navigate`**
La condición que decide si llamar a `pushState` comparaba solo el `pathname`, ignorando la query string:
```jsx
// ANTES (bug): /producto?id=1001 y /producto?id=1002 se consideraban la misma URL
if (window.location.pathname !== path) { ... }
```
Consecuencia: navegar de un producto a otro sin cambiar de vista no generaba una nueva entrada en el historial del navegador.

#### Corrección aplicada

Se introdujeron las funciones auxiliares `paramsFromUrl` y `buildPath` en `NavigationContext.jsx` y se ajustaron las llamadas correspondientes:

```jsx
// Lee el ?id y ?categoria de la query string al cargar la app (sobrevive recarga de página)
function paramsFromUrl() { ... }

// Construye la URL canónica incluyendo todos los query params relevantes
function buildPath(view, params) { ... }
```

Con estas correcciones:
- La URL de un producto es `/producto?id=1001` — compartible, favoritable y sobrevive recarga.
- El estado inicial lee el ID desde la URL: `params: paramsFromUrl()`.
- La condición en `navigate` compara `pathname + search` completo, generando una entrada de historial independiente por cada producto visitado.
- El botón "atrás" restaura correctamente el producto anterior porque `pushState` guarda el objeto `{ view, params }` en el historial, y `popstate` lo recupera.

#### Flujo de navegación corregido (extremo a extremo)

```
Usuario hace clic en ProductCard (id: 1001)
  → navigate({ view: 'producto', params: { id: 1001 } })
    → dispatch() actualiza el contexto React
    → buildPath() genera "/producto?id=1001"
    → pushState({ view: 'producto', params: { id: 1001 } }, '', '/producto?id=1001')
      → App.jsx re-renderiza → view === 'producto' → <ProductoDetalle />
        → useNavigation() → params.id === 1001
          → getProductoById(1001) → producto encontrado ✅

Usuario recarga la página en /producto?id=1001
  → viewFromPath() → 'producto'
  → paramsFromUrl() → { id: 1001 }
  → getProductoById(1001) → producto encontrado ✅

Usuario presiona "Atrás" en el navegador
  → popstate dispara con e.state = { view: 'catalogo', params: {} }
  → dispatch() actualiza el contexto → vuelve al catálogo ✅
```

---

## 5. ARQUITECTURA DE CARPETAS

```
src/
├── components/          ← piezas reutilizables (presentación)
│   ├── ui/              ← átomos: Button, ProductCard, SectionHeader, Toast, StatusBadge
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── HeroSection.jsx
│   ├── Categories.jsx
│   └── Featured.jsx
│
├── views/               ← páginas completas (una por ruta)
│   ├── Login.jsx
│   ├── Registro.jsx
│   ├── Catalogo.jsx
│   ├── ProductoDetalle.jsx
│   ├── Carrito.jsx
│   ├── Checkout.jsx
│   ├── Perfil.jsx
│   ├── Contacto.jsx
│   ├── FAQ.jsx
│   ├── GuiaTallas.jsx
│   └── admin/
│       ├── AdminLayout.jsx    ← estructura del panel (sidebar + topbar) + ProductsProvider
│       ├── AdminDashboard.jsx ← KPIs reactivos y widgets de alerta
│       ├── AdminProducts.jsx  ← ABM de productos (tabla con búsqueda + drawer)
│       ├── AdminPhotos.jsx    ← gestor de imágenes drag-and-drop
│       ├── AdminVariants.jsx  ← gestión de variantes (talle/color/stock)
│       ├── AdminCatalog.jsx   ← configuración del catálogo
│       ├── AdminDiscounts.jsx ← gestión de descuentos y cupones
│       ├── AdminOrders.jsx    ← listado y gestión de órdenes
│       └── AdminUsers.jsx     ← administración de usuarios
│
├── context/             ← estado global (Context API + useReducer)
│   ├── AuthContext.jsx       ← auth: login, register, logout, returnTo
│   ├── CartContext.jsx       ← carrito: items, totals, coupon, clearCart
│   ├── NavigationContext.jsx ← router custom: view, params, navigate, navigateSilent
│   └── ProductsContext.jsx   ← productos admin: byId, ids, upsert, remove
│
├── data/index.js        ← constantes, seed de productos, helpers (fmt, computePrice)
├── mocks/data.js        ← datos mock de productos, usuarios, pedidos
├── App.jsx              ← router principal + layouts
└── main.jsx             ← punto de entrada (monta providers globales)
```

### El argumento para la profesora

**"¿Por qué Context API y no Redux?"**

Redux es una herramienta poderosa para aplicaciones a escala corporativa con docenas de slices, middleware de logging y DevTools avanzados. Para Cumbre, que tiene cuatro dominios de estado bien delimitados (auth, carrito, navegación, productos admin), Context API + `useReducer` entrega exactamente el mismo contrato de inmutabilidad e inspectabilidad sin agregar ninguna dependencia externa. Elegir Redux aquí sería lo que los ingenieros llaman "over-engineering": usar una excavadora para hacer un hoyo de jardín.

**"¿Muchos componentes y pocas vistas, por qué?"**

Muchos componentes y pocas vistas es la señal de que el código está bien diseñado en React. Los componentes capturan la reutilización; las vistas, la composición. Un `Button` con 6 variantes se usa en la sidebar del admin, el drawer, el catálogo y el checkout — un único archivo que cambiar. Si hubiésemos copiado el HTML del botón en cada vista, ese cambio requeriría tocar 15 archivos.

---

## 6. VALOR AGREGADO: CONCEPTOS QUE FORTALECEN LA DEFENSA

### La función `computePrice` — fuente única de verdad para precios

En `data/index.js` existe un helper puro `computePrice`:

```jsx
export const computePrice = (product) => ({
  price:    product.descuentoPct > 0
    ? Math.round(product.precioBase * (1 - product.descuentoPct / 100))
    : product.precioBase,
  oldPrice: product.descuentoPct > 0 ? product.precioBase : product.precioAnterior,
})
```

Esta función se utiliza en `AdminProducts` para mostrar el precio con tachado en la tabla. Al centralizar el cálculo en una función pura, garantizamos que el precio que ve el admin en la tabla y el precio que ve el cliente en el catálogo son calculados con la misma lógica. Es el principio **DRY (Don't Repeat Yourself)** aplicado a la lógica de negocio.

---

### Validaciones con Regex en Checkout

`Checkout.jsx` implementa validaciones robustas sobre los datos de envío y pago usando **expresiones regulares**. Algunos ejemplos:

```jsx
// Dirección debe contener letras Y números (calle + número)
if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(s.direccion)) e.direccion = 'Debe contener letras'
if (!/\d/.test(s.direccion))                      e.direccion = 'Debe incluir número de calle'

// Ciudad y provincia: solo letras, sin números
if (/\d/.test(s.ciudad))    e.ciudad    = 'Solo letras permitidas'
if (/\d/.test(s.provincia)) e.provincia = 'Solo letras permitidas'

// Código postal y teléfono: solo dígitos
if (!/^\d+$/.test(s.cp))       e.cp       = 'Solo números'
if (!/^\d+$/.test(s.telefono)) e.telefono = 'Solo números'

// Tarjeta: exactamente 16 dígitos (sin espacios)
if (!/^\d{16}$/.test(d)) e.numero = '16 dígitos requeridos'

// Titular: al menos dos palabras (nombre y apellido)
if (c.titular.trim().split(/\s+/).filter(Boolean).length < 2)
  e.titular = 'Ingresá nombre y apellido'
```

Además, los campos de tarjeta tienen **input masking** en tiempo real:

```jsx
const fmtCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
const fmtExp  = (v) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length >= 3 ? d.slice(0,2)+'/'+d.slice(2) : d }
```

`fmtCard` elimina todo lo que no sea dígito, limita a 16 y agrega un espacio cada 4 caracteres. `fmtExp` formatea el vencimiento como `MM/AA` automáticamente mientras el usuario tipea. Esto mejora la UX sin necesidad de librerías externas de máscaras.

---

### El flujo de datos unidireccional (one-way data flow)

Un principio fundamental de React que se materializa en toda la app: **los datos fluyen de padres a hijos vía props, y los eventos fluyen de hijos a padres vía callbacks**.

En el panel admin:
1. `ProductsContext` (proveedor) → mantiene el estado canónico.
2. `AdminDashboard` y `AdminProducts` (consumidores) → leen vía `useProducts()`.
3. Cuando el usuario elimina un producto, `AdminProducts` llama `remove(p.id)` → el contexto despacha `REMOVE` al reducer → el reducer retorna un nuevo estado sin ese ID → React re-renderiza **todos** los consumidores del contexto automáticamente (incluyendo el KPI de Dashboard).

Nadie muta el estado directamente. El reducer garantiza que cada transición de estado sea predecible y testeable.
