# Integrante 4 — Panel de Administración (ABM / CRUD)
**Pantallas clave:** AdminLayout · AdminDashboard (`/admin/dashboard`) · AdminProducts (`/admin/productos`) · AdminUsers (`/admin/usuarios`)
**Tiempo de exposición:** 3 minutos 45 segundos

---

## 1. Pantallas y rutas asignadas

| Pantalla            | Ruta                        |
|---------------------|-----------------------------|
| Tablero             | `/admin/dashboard`          |
| Productos (tabla)   | `/admin/productos`          |
| Producto editando   | `/admin/productos/:id`      |
| Imágenes            | `/admin/fotos/:productId`   |
| Usuarios            | `/admin/usuarios`           |

---

## 2. Demo en vivo — guía paso a paso

1. **Login como admin** → Credenciales: `admin@cumbre.com` / `admin123`. El `authReducer` procesa `'SUCCESS'` con `safeUser`. Como `safeUser.rol === 'admin'`, `AuthContext.login()` navega a `/admin/dashboard` en lugar del `returnTo`. En la URL ya se ve el cambio de layout.

2. **Cambio de layout** → Desaparece el Navbar y el Footer del sitio público. Aparece el sidebar oscuro de `AdminLayout`. Esto pasa porque en `App.jsx` las rutas `/admin/*` están declaradas bajo una `<Route element={<AdminGuard />}>` separada de `<ShellLayout>`. `AdminGuard` verifica `isLoggedIn && user.rol === 'admin'`; si no se cumple, redirige a `/login`.

3. **AdminLayout — navegación interna** → El sidebar usa `<NavLink>` de React Router para detectar la ruta activa: el ítem activo recibe `bg-alpenglow`. El logo es un `<NavLink to="/admin/dashboard">` — no lleva al home público. El botón 'Salir' llama `logout()` del `AuthContext` (despacha `'LOGOUT'`, resetea el state) y luego `navigate('/')`.

4. **Tablero** → `AdminDashboard.jsx` llama `useProducts()` y calcula KPIs en tiempo real: total de productos, productos con stock bajo (≤ 3). Las métricas se derivan del mismo `ProductsContext` que usa `AdminProducts` — si se crea un producto, el tablero lo refleja sin recarga.

5. **AdminProducts — ABM completo** → Tabla con buscador. Click en `Edit2` → `openDrawer(p.id)` → la URL cambia a `/admin/productos/${id}` (con `replace: true`) y se abre el `ProductDrawer`. Modificar nombre y precio → `save()` valida y llama a `upsert(next)` del `ProductsContext` → el cambio se refleja en la tabla inmediatamente. Click en `Image` → navega a `/admin/fotos/${p.id}`.

6. **Drawer — nuevo producto** → Click en 'Nuevo producto'. El `ProductDrawer` recibe `productId = null` → el form inicia vacío. Completar el formulario, ver la preview de precio final en tiempo real. Guardar → `upsert` con `id: Date.now() % 100000 + 200` → aparece en la tabla.

7. **AdminPhotos** → Cola de subida simulada con `setInterval`. Drag & drop o selector de archivos activa `fakeUpload()`. Cada archivo muestra barra de progreso hasta 100%, luego pasa a "fotos actuales". La breadcrumb usa `useParams().productId` para mostrar el nombre del producto.

8. **Cierre del grupo:**
> "Con esto terminamos el recorrido completo de Cumbre — desde que el usuario descubre un producto hasta que el admin lo gestiona. Quedamos a disposición para preguntas."

---

## 3. Archivos y componentes clave

| Archivo | Rol |
|---|---|
| `src/App.jsx` | `AdminGuard` como layout route; rutas `/admin/*` anidadas bajo él |
| `src/views/admin/AdminLayout.jsx` | Shell del admin: sidebar + `<Outlet />` + `ProductsProvider` |
| `src/views/admin/AdminDashboard.jsx` | KPIs derivados de `useProducts()`, SVG puro para tendencias |
| `src/views/admin/AdminProducts.jsx` | Tabla + `ProductDrawer` inline, `useParams` para auto-open |
| `src/views/admin/AdminPhotos.jsx` | `useParams().productId`, cola de subida simulada |
| `src/views/admin/AdminUsers.jsx` | CRUD local sobre `MOCK_USERS`, toggle de roles |
| `src/context/ProductsContext.jsx` | `useReducer` normalizado (`ids` + `byId`), acciones `UPSERT`/`REMOVE` |

---

## 4. Tema técnico: Arquitectura por roles, layout separado, drawers, CRUD con estado normalizado

### Protección de rutas de admin — `AdminGuard`

```jsx
// En App.jsx:
function AdminGuard() {
  const { isLoggedIn, user } = useAuth()
  if (!isLoggedIn || user?.rol !== 'admin') {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}

// Rutas admin — completamente separadas de ShellLayout:
<Route path="/admin" element={<AdminGuard />}>
  <Route element={<AdminLayout />}>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard"       element={<AdminDashboard />} />
    <Route path="productos"       element={<AdminProducts />} />
    <Route path="productos/:id"   element={<AdminProducts />} />
    <Route path="fotos/:productId" element={<AdminPhotos />} />
    <Route path="variantes"       element={<AdminVariants />} />
    <Route path="catalogo"        element={<AdminCatalog />} />
    <Route path="descuentos"      element={<AdminDiscounts />} />
    <Route path="ordenes"         element={<AdminOrders />} />
    <Route path="usuarios"        element={<AdminUsers />} />
  </Route>
</Route>
```

`AdminGuard` tiene doble condición: `!isLoggedIn` (no autenticado) **o** `user.rol !== 'admin'` (autenticado pero sin privilegios). Un cliente logueado que intente ir a `/admin/dashboard` es redirigido a `/login`.

### `AdminLayout` — layout route con `<Outlet />`

```jsx
// AdminLayout.jsx — el sidebar se mantiene montado al cambiar de vista
export default function AdminLayout() {
  const { pathname } = useLocation()
  const currentSegment = pathname.split('/').pop()
  const currentLabel   = VIEW_LABELS[currentSegment] ?? 'Tablero'

  return (
    <ProductsProvider>
      <div className="bg-ivory text-rock h-screen overflow-hidden flex">
        <aside className="w-64 shrink-0 bg-rock text-ivory flex flex-col overflow-y-auto">
          <NavLink to="/admin/dashboard">Logo</NavLink>
          <nav>
            {ADMIN_NAV.map(({ path, label, Icon }) => (
              <NavLink key={path} to={path}
                className={({ isActive }) => isActive ? 'bg-alpenglow text-ivory' : 'text-ivory/70'}>
                {({ isActive }) => (
                  <><Icon />{label}{isActive && <ChevronRight />}</>
                )}
              </NavLink>
            ))}
          </nav>
          <button onClick={() => { logout(); navigate('/') }}>Salir</button>
        </aside>

        <div className="flex-1 overflow-y-auto flex flex-col">
          <header className="sticky top-0"><h1>{currentLabel}</h1></header>
          <main className="p-8 flex-1">
            <Outlet />   {/* React Router inyecta la vista activa aquí */}
          </main>
        </div>
      </div>
    </ProductsProvider>
  )
}
```

`h-screen overflow-hidden` en el contenedor raíz: el body no scrollea. Sidebar y main tienen `overflow-y-auto` independiente — scrollean por separado. `sticky top-0` en el header del main: permanece visible al scrollear el contenido.

### `ProductsContext` — estado normalizado con `useReducer`

```js
// Estado normalizado:
{
  ids:  [1001, 1002, 1003],          // orden → O(1) para saber cuántos hay
  byId: { 1001: {...}, 1002: {...} } // lookup por ID → O(1)
}

// Acción UPSERT — crear o actualizar sin mutar:
case 'UPSERT': {
  const isNew = !state.byId[action.payload.id]
  return {
    byId: { ...state.byId, [action.payload.id]: action.payload },
    ids:  isNew ? [action.payload.id, ...state.ids] : state.ids,
  }
}

// Acción REMOVE — eliminar sin mutar:
case 'REMOVE': {
  const { [action.payload]: _, ...rest } = state.byId
  return {
    byId: rest,
    ids:  state.ids.filter((id) => id !== action.payload),
  }
}
```

**Por qué estructura normalizada y no array plano:** con un array plano `[{id:1001,...}, ...]`, cada lookup requiere recorrer el array entero — O(n). Con `byId`, `byId[1001]` es O(1). En una tabla con filtrado y edición en tiempo real, se evitan recorridos innecesarios en cada render.

### Drawer de edición — `ProductDrawer`

```jsx
function ProductDrawer({ productId, onClose }) {
  const { byId, upsert } = useProducts()
  const existing = productId ? byId[productId] : null

  // Lazy init — el cálculo corre solo al montar el drawer
  const [form, setForm] = useState(() =>
    existing
      ? { nombre: existing.nombre, precioBase: existing.precioBase, ... }
      : { nombre: '', precioBase: 0, marcaId: 1, categoriaId: 1, estado: 'ACTIVO', ... }
  )

  const save = () => {
    const errors = validate(form)
    if (Object.keys(errors).length > 0) { setErrors(errors); return }
    upsert(buildProductObject(form, existing))
    onClose()
  }

  // Preview de precio final en tiempo real — valor derivado, no almacenado:
  const precioFinal = form.descuentoPct > 0
    ? Math.round(form.precioBase * (1 - form.descuentoPct / 100))
    : form.precioBase

  return (
    <>
      <div className="fixed inset-0 bg-rock/60 z-40" onClick={onClose} />
      <aside className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-ivory z-50">
        {/* Formulario controlado */}
      </aside>
    </>
  )
}
```

El drawer usa **portal visual** (overlay + panel fijo) sin `createPortal` de React — funciona igual porque `AdminLayout` tiene `overflow-hidden` en el contenedor raíz. El overlay `bg-rock/60` ocupa el inset del viewport.

### `useParams` para auto-open del drawer

```jsx
// AdminProducts.jsx — la ruta /admin/productos/:id auto-abre el drawer:
const { id: paramId } = useParams()
const [drawerOpen, setDrawerOpen] = useState(!!paramId)
const [editId,     setEditId]     = useState(paramId ? Number(paramId) : null)

const openDrawer = (id = null) => {
  setEditId(id)
  setDrawerOpen(true)
  if (id) navigate(`/admin/productos/${id}`, { replace: true })
}
const closeDrawer = () => {
  setDrawerOpen(false)
  setEditId(null)
  if (paramId) navigate('/admin/productos', { replace: true })
}
```

Navegar directamente a `/admin/productos/1001` abre el drawer del producto 1001 automáticamente — la URL es bookmarkeable y compartible entre admins.

### `ProductsProvider` solo en `AdminLayout`

```jsx
// AdminLayout.jsx envuelve todo con ProductsProvider:
<ProductsProvider>
  <div className="h-screen flex">
    <aside>...</aside>
    <main><Outlet /></main>
  </div>
</ProductsProvider>
```

El `ProductsProvider` **no** está en `main.jsx`. Si estuviera ahí, inicializaría el catálogo editable para todos los visitantes — incluyendo el 99% que nunca acceden al admin. Al colocarlo solo en `AdminLayout`, el contexto existe únicamente mientras hay una sesión admin activa. Es lazy loading de estado global: el contexto se monta cuando se necesita, se desmonta al salir del panel.

---

## 5. Preguntas probables del examen

**P: ¿Qué diferencia hay entre `AccountGuard` y `AdminGuard`?**
R: `AccountGuard` solo verifica `isLoggedIn` — cualquier usuario autenticado puede pasar. `AdminGuard` verifica además `user?.rol === 'admin'`. Un cliente logueado que accede a `/admin/dashboard` pasa `AccountGuard` pero no `AdminGuard`, que lo redirige a `/login`. Las condiciones son diferentes porque los dominios son diferentes: rutas de cuenta vs panel de control.

**P: ¿Por qué el estado de productos es `{ ids, byId }` y no un array?**
R: La estructura normalizada separa el orden (`ids: [1001, 1002]`) del acceso por clave (`byId: { 1001: {...} }`). Lookup por ID es O(1) con `byId[id]` en lugar de O(n) con `array.find(p => p.id === id)`. En la tabla del admin, cada fila necesita leer su producto por ID en cada render — con 500 productos, la diferencia de complejidad impacta directamente en la fluidez.

**P: ¿Qué hace `useState(() => ...)` (la función arrow en la inicialización)?**
R: Es inicialización lazy de `useState`. El argumento de `useState` normalmente se evalúa en cada render aunque solo se use la primera vez. Con la función arrow, React llama a `() => calcularValorInicial()` **solo en el primer render**. En `ProductDrawer`, el form inicial depende de `byId[productId]` — sin lazy init, ese cálculo correría en cada re-render del drawer aunque el valor ya no se use para nada.

**P: ¿Por qué `ProductDrawer` está definido en el mismo archivo que `AdminProducts` y no en su propio archivo?**
R: Porque `ProductDrawer` está fuertemente acoplado a `AdminProducts`: consume `useProducts()` directamente, recibe un `onClose` que modifica el estado local del padre, y no existe en ningún otro contexto del sistema. Extraerlo a un archivo propio agregaría una importación cruzada sin ningún beneficio de reutilización. La regla es: extraer solo cuando hay reutilización real o cuando el componente se vuelve difícil de leer en contexto.

**P: ¿Cómo funciona el dual scroll del `AdminLayout`?**
R: El contenedor raíz tiene `h-screen overflow-hidden` — ocupa exactamente el viewport y corta cualquier overflow. Dentro, el sidebar tiene `overflow-y-auto` propio y el área de contenido también. Ambos scrollean en forma independiente porque cada uno tiene su propio contexto de overflow. El header del contenido tiene `sticky top-0` — se queda fijo relativo al scroll del main, no del viewport.

**P: ¿Por qué el botón 'Salir' llama primero `logout()` y luego `navigate('/')`? ¿No alcanzaría con navegar?**
R: Solo navegar no limpia el estado de auth. `logout()` despacha `'LOGOUT'` al `authReducer`, que resetea el estado a `initialState` (sin usuario, sin token, `isLoggedIn: false`). Si el admin navegara al home sin hacer logout, `AuthContext` seguiría teniendo `user.rol === 'admin'` y el usuario podría presionar "Atrás" y volver al panel — o acceder directamente por URL. `AdminGuard` lo detectaría, pero el estado quedaría corrupto. El orden correcto es: primero limpiar el estado, luego navegar.
