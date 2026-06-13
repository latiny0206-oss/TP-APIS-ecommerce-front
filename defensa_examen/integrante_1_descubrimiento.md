# Integrante 1 — Flujo de Descubrimiento y Navegación
**Pantallas clave:** Home (`/`) · Catálogo con filtros (`/catalogo`) · Detalle de producto (`/producto/:id`)
**Tiempo de exposición:** 3 minutos 45 segundos

---

## 1. Pantallas y rutas asignadas

| Pantalla           | Ruta                                            |
|--------------------|--------------------------------------------------|
| Home               | `/`                                              |
| Catálogo           | `/catalogo`                                      |
| Catálogo filtrado  | `/catalogo?categoria=indumentaria`               |
| Filtros combinados | `/catalogo?categoria=indumentaria&marca=Cumbre+Pro` |
| Detalle producto   | `/producto/1001`                                 |

---

## 2. Demo en vivo — guía paso a paso

1. **Home** → Mostrar `HeroSection`, `Categories` (con conteos dinámicos) y `Featured` (línea Cumbre Pro). El botón "Ver indumentaria" llama `navigate('/catalogo?categoria=indumentaria')` directamente — sin sessionStorage. El botón "Ver línea Cumbre Pro" navega a `/catalogo?marca=Cumbre+Pro`.

2. **Catálogo desde el Navbar** → Click en "Productos". Monta `Catalogo.jsx` sin filtros. Mostrar que la URL es `/catalogo`. Tildar "Calzado" → la URL cambia a `/catalogo?categoria=calzado`. Tildar "Cumbre Pro" → URL pasa a `/catalogo?categoria=calzado&marca=Cumbre+Pro`. Todos los filtros activos se reflejan en la URL en tiempo real.

3. **Filtros y Reset** → Mostrar que "Limpiar filtros" llama `setSearchParams({}, { replace: true })` y deja la URL en `/catalogo`. El rango de precio está en estado local (`useState`) y también se resetea.

4. **Detalle** → Click en un producto. La URL pasa de `/catalogo?categoria=calzado` a `/producto/2001`. El componente lee el ID con `useParams()` — no con query params. Seleccionar un talle con stock, ver el conteo disponible. Seleccionar un talle sin stock (cruz roja, no clickeable). El botón "Volver a Productos" hace `navigate(-1)` — el navegador retrocede a `/catalogo?categoria=calzado` con todos los filtros intactos.

5. **Cierre del bloque:**
> "Dejo la posta a [integrante 2] que les muestra cómo a partir del detalle se agrega al carrito y se completa la compra."

---

## 3. Archivos y componentes clave

| Archivo | Rol |
|---|---|
| `src/App.jsx` | Define el árbol de rutas completo con layouts, guards y rutas anidadas |
| `src/views/Catalogo.jsx` | Catálogo con filtros URL-driven (`useSearchParams`) |
| `src/views/ProductoDetalle.jsx` | Detalle con `useParams()` para leer el ID de ruta |
| `src/components/Navbar.jsx` | Navegación con detección de ruta activa via `useSearchParams` |
| `src/components/HeroSection.jsx` | CTAs con navegación directa a URL con query params |
| `src/components/Categories.jsx` | Cards con `navigate('/catalogo?categoria=...')` |
| `src/components/Featured.jsx` | CTA hacia `/catalogo?marca=Cumbre+Pro` |
| `src/data/index.js` | `NAV_ITEMS` con rutas `/catalogo?categoria=...` |

---

## 4. Tema técnico: Routing, composición de layouts y renderizado condicional

### Estructura del router (`App.jsx`)

La app usa **React Router DOM v7** con `<BrowserRouter>` en `main.jsx` y el árbol de rutas en `App.jsx`:

```jsx
// Tres layouts completamente separados:

// 1. Home — layout propio (LandingPage)
<Route path="/" element={<LandingPage />} />

// 2. Vistas públicas — ShellLayout (Navbar + Footer)
<Route element={<ShellLayout />}>
  <Route path="/catalogo"     element={<Catalogo />} />
  <Route path="/producto/:id" element={<ProductoDetalle />} />
  <Route path="/carrito"      element={<Carrito />} />
  <Route element={<AccountGuard />}>
    <Route path="/cuenta/ordenes" element={<Perfil />} />
  </Route>
</Route>

// 3. Admin — AdminGuard + AdminLayout (sidebar)
<Route path="/admin" element={<AdminGuard />}>
  <Route element={<AdminLayout />}>
    <Route path="dashboard" element={<AdminDashboard />} />
  </Route>
</Route>
```

**`ShellLayout`** usa `<Outlet />` de React Router: es el slot donde React Router inyecta el componente de la ruta activa. Navbar y Footer permanecen montados sin redibujarse al navegar entre catálogo, carrito, contacto, etc.

### Route params vs Query params

| Tipo | Cuándo usarlo | Ejemplo en el proyecto |
|---|---|---|
| **Route param** (`:id`) | Recurso identificado por ID | `/producto/:id` → `useParams().id` |
| **Query param** (`?key=val`) | Filtros opcionales y combinables | `/catalogo?categoria=calzado&marca=Cumbre+Pro` |

**Antes (incorrecto):** `/producto?id=1001` — el ID del producto en query param.
**Ahora (correcto):** `/producto/1001` — el ID en ruta, leído con `useParams()`.

### Filtros de catálogo en la URL (`Catalogo.jsx`)

**Source of truth = URL**. No hay `useState` para los filtros de categoría, marca ni temporada:

```jsx
const [searchParams, setSearchParams] = useSearchParams()

// Derivado de URL — siempre sincronizado
const categorias = searchParams.getAll('categoria')
const marcas     = searchParams.getAll('marca')
const busqueda   = searchParams.get('q') ?? ''

// Mutar URL al tildar un filtro
const toggleItem = (key, value) => {
  const current = searchParams.getAll(key)
  const next = current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value]
  const params = new URLSearchParams(searchParams)
  params.delete(key)
  next.forEach((v) => params.append(key, v))
  setSearchParams(params, { replace: true })  // no agrega entrada al historial
}
```

**Ventaja:** el botón "Volver" del navegador restaura automáticamente todos los filtros, ya que la URL anterior los contiene. Se eliminó completamente el sessionStorage.

### `navigate(-1)` — navegación basada en historial

En `ProductoDetalle.jsx`, el botón "Volver a Productos" hace:
```jsx
<button onClick={() => navigate(-1)}>Volver a Productos</button>
```
`navigate(-1)` es equivalente al botón "Atrás" del navegador. La URL anterior (con los filtros del catálogo) se restaura automáticamente desde el historial del navegador.

### Renderizado condicional en `ProductoDetalle.jsx`

```jsx
// Si no existe el producto (ID inválido en la URL)
if (!producto) return <ErrorState />

// Stock por talle — solo se muestra después de elegir talle
{talleSeleccionado && (
  <span>{stockActual} disponibles</span>
)}

// Talles sin stock — deshabilitados con X superpuesta
const agotado = getStockParaTalle(talle) === 0
<button disabled={agotado} onClick={() => !agotado && handleTalleSelect(talle)}>
  {agotado && <X size={14} className="text-rock/40" />}
</button>
```

---

## 5. Preguntas probables del examen

**P: ¿Qué es `<Outlet />` y para qué sirve en este proyecto?**
R: Es un componente de React Router que actúa como "slot" dentro de un layout route. En `ShellLayout`, `<Outlet />` renderiza el componente hijo que corresponde a la ruta activa. Esto permite que Navbar y Footer permanezcan en el DOM sin desmontarse al navegar entre `/catalogo`, `/carrito`, `/producto/1001`, etc.

**P: ¿Por qué `/producto/:id` y no `/producto?id=1001`?**
R: Los route params son para recursos identificados por ID — son parte del recurso, no filtros opcionales. `/producto/1001` y `/producto/1002` son dos recursos distintos. Los query params son para filtros opcionales que se pueden combinar, como en `/catalogo?categoria=calzado&marca=Cumbre+Pro`.

**P: ¿Cómo se restauran los filtros del catálogo al presionar "Volver" desde el detalle?**
R: La URL `/catalogo?categoria=calzado&marca=Cumbre+Pro` queda en el historial del navegador cuando se navega a `/producto/1001`. Al hacer `navigate(-1)`, el navegador vuelve a esa URL y React Router vuelve a renderizar `Catalogo.jsx` con `searchParams` que ya contiene los filtros. No se necesita sessionStorage.

**P: ¿Qué es `replace: true` en `setSearchParams`?**
R: Hace que el cambio de URL reemplace la entrada actual del historial en lugar de agregar una nueva. Se usa en los filtros del catálogo para que tildar/destildar filtros no genere decenas de entradas en el historial — evita que el usuario tenga que presionar "Atrás" 15 veces para salir del catálogo.

**P: ¿Cómo detecta el Navbar qué ítem de navegación está activo?**
R: Compara `pathname` y `searchParams.get('categoria')` con los datos de cada ítem:
```jsx
const isItemActive = (item) =>
  pathname === '/catalogo' && searchParams.get('categoria') === item.categoria
```
Si la URL es `/catalogo?categoria=calzado`, solo el link de Calzado queda activo.

**P: ¿Por qué `AdminGuard` y `AccountGuard` son componentes separados?**
R: Tienen reglas de protección distintas. `AccountGuard` solo exige estar logueado (`isLoggedIn`). `AdminGuard` exige además `user?.rol === 'admin'`. Si un cliente intenta ir a `/admin/dashboard`, `AdminGuard` lo redirige a `/login`. Ambos usan `<Outlet />` para renderizar sus rutas hijas si la condición se cumple, o `<Navigate>` si no.
