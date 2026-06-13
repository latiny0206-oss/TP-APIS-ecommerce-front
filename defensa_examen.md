# Defensa de Examen — Panel de Administración
### Cumbre E-commerce · React + Vite + Context API + Tailwind CSS

---

## 1. GUION DE EXPOSICIÓN

### Apertura (30 segundos)

> "Buenas, les presento Cumbre, un e-commerce de indumentaria y equipamiento de montaña. Lo que voy a mostrarles hoy es el Panel de Administración: la sección que construimos para que los dueños del negocio gestionen el catálogo en tiempo real, sin tocar código."

### Cuerpo (2-3 minutos — mostralo en vivo mientras hablás)

**1. Acceso al panel**
> "Para entrar al panel, el admin inicia sesión con sus credenciales (`admin@cumbre.com` / `admin123`). El `AuthContext` detecta `rol === 'admin'` y navega a `admin-dashboard`. Una vez dentro, se carga el `AdminLayout`, que es el shell del panel: sidebar a la izquierda con overflow de scroll independiente y el área de contenido a la derecha. Todo esto vive en `/views/admin/`."

**2. El Tablero (AdminDashboard)**
> "La primera pantalla es el Tablero. Acá se ven KPIs en tiempo real: la cantidad de productos activos —leída directamente del `ProductsContext`—, órdenes pendientes, descuentos y clientes. Abajo hay una tabla con las últimas órdenes con estados coloreados, y widgets de alerta: uno de stock bajo —filtra los productos con tres o menos unidades— y uno de descuentos próximos a vencer."

**3. ABM de Productos (AdminProducts)**
> "Acá está el corazón del panel. Hay una tabla con todos los productos, con búsqueda en tiempo real por nombre o marca. Cada fila tiene tres acciones: editar, gestionar imágenes y eliminar. Cuando hacés click en editar o en 'Nuevo producto', se abre un Drawer —un panel lateral deslizante— con el formulario de alta/edición."

*[Mostrá en vivo: crear un producto, ponerle nombre, precio, descuento. Ver la previsualización de precio en tiempo real]*

> "El formulario tiene validación en el cliente: si dejás el nombre vacío o el precio en cero, te muestra el error inline sin enviar nada. Si ponés un descuento, la app muestra en tiempo real el precio que verá el cliente."

**4. Gestor de Imágenes (AdminPhotos)**
> "Permite subir y gestionar fotos por producto. Tiene un área de drag-and-drop: arrastrás una imagen, se simula la subida con una barra de progreso, y la foto aparece en la grilla. También se puede seleccionar archivos por click."

### Cierre
> "En resumen, armamos un panel completo con lectura de datos del contexto global, escritura (altas, ediciones y bajas que persisten mientras navegás), validaciones y una UX cuidada. Todo en React con Context API, sin Redux, sin recargar la página."

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
| `useReducer` | Manejar estado complejo con acciones tipadas (carrito, auth) |
| `useContext` | Leer valores del contexto global |
| `useEffect` | Ejecutar código con efectos secundarios (sincronizar con navegador, localStorage) |
| `useMemo` | Calcular valores derivados solo cuando cambian sus dependencias |

**Regla de oro de los hooks:** solo se pueden usar dentro de componentes funcionales o custom hooks, nunca dentro de `if`, `for` o funciones anidadas.

---

### ¿Por qué Context API en lugar de Redux?

Redux requiere instalar librerías adicionales (`@reduxjs/toolkit`, `react-redux`), definir slices, `configureStore`, `Provider` y conectar cada componente. Para una aplicación de este tamaño es sobrediseño.

Context API es nativa de React y suficiente cuando:
- Los datos globales son pocos y bien delimitados (auth, carrito, navegación, productos del admin).
- No necesitás middleware complejo ni DevTools de Redux.
- El equipo prefiere menos capas de abstracción.

En Cumbre usamos un patrón `useReducer` + `createContext` en cada contexto, que ofrece las mismas garantías de inmutabilidad que Redux pero sin dependencias externas.

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

#### Eventos

```jsx
// Click en ítem de la sidebar → cambia la vista del panel
onClick={() => navigate(id)}

// Click en "Nuevo producto" → navega a la vista de productos
onClick={() => navigate('admin-products')}

// Click en "Salir" → limpia las credenciales y redirige al home público
onClick={() => { logout(); navigate('home') }}
```

---

### `AdminDashboard.jsx`

#### Hooks

```jsx
const { byId, ids } = useProducts()
```

**¿Qué hace en Cumbre?**
`useProducts()` es el custom hook que expone el `ProductsContext`. Construye el array completo de productos y filtra los de stock bajo (`p.stock > 0 && p.stock <= 3`). El KPI "Productos activos" muestra `ids.length` — si alguien crea o elimina un producto en `AdminProducts`, este número se actualiza aquí también, porque ambas vistas leen del mismo contexto.

---

### `AdminProducts.jsx`

#### Hooks

```jsx
const [query,      setQuery]      = useState('')
const [editingId,  setEditingId]  = useState(null)
const { byId, ids, upsert, remove } = useProducts()
```

**¿Qué hace en Cumbre?**
`query` controla el input de búsqueda — cada vez que el usuario escribe, React re-renderiza y la tabla filtra en tiempo real sin botón de "buscar". `editingId` controla si el drawer está abierto y qué producto editar (`null` = cerrado, `'new'` = creación, número = edición).

#### Eventos

```jsx
// Escribir en el buscador → actualiza el filtro
onChange={(e) => setQuery(e.target.value)}

// Click en "Nuevo producto" → abre drawer vacío
onClick={() => setEditingId('new')}

// Click en editar → abre drawer con datos del producto
onClick={() => setEditingId(p.id)}

// Click en eliminar → borra del contexto inmediatamente
onClick={() => remove(p.id)}
```

#### ProductDrawer — sub-componente del formulario

```jsx
// Inicialización lazy del estado del form
const [form, setForm] = useState(() =>
  existing
    ? { nombre: existing.nombre, precioBase: existing.precioBase, ... }
    : { nombre: '', precioBase: 0, ... }
)
const [errors, setErrors] = useState({})

// Helper que genera un onChange para cualquier campo
const f = (field) => (e) => setForm({ ...form, [field]: e.target.value })

// Guardar: valida → si ok, despacha upsert al contexto
const save = () => {
  const e = validate(form)
  if (Object.keys(e).length) { setErrors(e); return }
  upsert(buildProduct(form))
  onClose()
}
```

---

### `AdminPhotos.jsx`

#### Hooks

```jsx
const [photos,   setPhotos]   = useState([...fotos del producto...])
const [queue,    setQueue]    = useState([])
const [dragOver, setDragOver] = useState(false)
const { byId }  = useProducts()
const { params } = useNavigation()
```

**¿Qué hace en Cumbre?**
`dragOver` controla el estilo visual de la zona de drop. `queue` persiste el historial de subidas con su progreso. Cuando una subida "completa" (simulado con `setInterval`), el archivo pasa de `queue` a `photos`.

---

## 4. ARQUITECTURA DE CARPETAS

```
src/
├── components/          ← piezas reutilizables (presentación)
│   ├── ui/              ← átomos: Button, ProductCard, SectionHeader, Toast
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── HeroSection.jsx
│   ├── Categories.jsx
│   └── Featured.jsx
│
├── views/               ← páginas completas (una por ruta)
│   ├── Login.jsx
│   ├── Catalogo.jsx
│   ├── ProductoDetalle.jsx
│   ├── Carrito.jsx
│   ├── Checkout.jsx
│   ├── Perfil.jsx
│   └── admin/
│       ├── AdminLayout.jsx    ← estructura del panel (sidebar + topbar)
│       ├── AdminDashboard.jsx ← KPIs y alertas
│       ├── AdminProducts.jsx  ← ABM de productos (tabla + drawer)
│       └── AdminPhotos.jsx    ← gestor de imágenes drag-and-drop
│
├── context/             ← estado global (Context API + useReducer)
│   ├── AuthContext.jsx
│   ├── CartContext.jsx
│   ├── NavigationContext.jsx
│   └── ProductsContext.jsx
│
├── data/index.js        ← constantes, seed de productos, helpers
├── mocks/data.js        ← datos mock de productos, usuarios, pedidos
├── App.jsx              ← router principal + layouts
└── main.jsx             ← punto de entrada
```

### El argumento para la profesora

**"¿Por qué Context API y no Redux?"**

Redux es una herramienta poderosa para aplicaciones a escala corporativa con docenas de slices, middleware de logging y DevTools avanzados. Para Cumbre, que tiene cuatro dominios de estado bien delimitados (auth, carrito, navegación, productos admin), Context API + `useReducer` entrega exactamente el mismo contrato de inmutabilidad e inspectabilidad sin agregar ninguna dependencia externa. Elegir Redux aquí sería lo que los ingenieros llaman "over-engineering": usar una excavadora para hacer un hoyo de jardín.

**"¿Muchos componentes y pocas vistas, por qué?"**

Muchos componentes y pocas vistas es la señal de que el código está bien diseñado en React. Los componentes capturan la reutilización; las vistas, la composición. Un `Button` con 6 variantes se usa en la sidebar del admin, el drawer, el catálogo y el checkout — un único archivo que cambiar. Si hubiésemos copiado el HTML del botón en cada vista, ese cambio requeriría tocar 15 archivos.
