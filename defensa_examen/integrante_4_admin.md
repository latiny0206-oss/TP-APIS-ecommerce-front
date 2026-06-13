# Integrante 4 — Panel de Administración (ABM / CRUD)
**Pantallas clave:** AdminLayout · AdminDashboard · AdminProducts · AdminUsers + módulos secundarios  
**Tiempo de exposición:** 3 minutos 45 segundos

---

## 1. Guión de Exposición (Speech)

> **Cierre del grupo — retomás del integrante 3:**

"Gracias [integrante 3]. Ahora cambiamos completamente de sombrero: dejo de ser usuario y me convierto en administrador de la tienda.

**Demo en vivo — guía paso a paso:**

1. **Cambio de layout al entrar al admin** → Iniciamos sesión con `admin@cumbre.com` / `admin123`. El `authReducer` detecta `rol === 'admin'` y navega a `'admin-dashboard'`. En `App.jsx`, las vistas admin se renderizan **sin** `<ShellPage>` (sin Navbar ni Footer públicos) — van directo a `<AdminLayout>`. Este cambio de layout se produce porque `ADMIN_VIEWS.includes(view)` es true, y el bloque if devuelve el panel en lugar del shell público.

2. **AdminLayout** → Shell del admin: sidebar fijo con `overflow-y-auto` independiente y área de contenido con scroll propio. El logo navega a `'admin-dashboard'` (no al home público). El botón 'Salir' llama a `logout()` del `AuthContext` y luego navega a `'home'` — limpia completamente el estado de auth y redirige al sitio público.

3. **Dashboard** → `AdminDashboard.jsx` usa `useProducts()` para leer el catálogo real del `ProductsContext` y calcular: cuántos productos activos hay, cuáles tienen stock bajo (≤ 3 unidades). Las órdenes recientes son datos mock. El gráfico de tendencia es un SVG puro — sin librerías externas.

4. **AdminProducts — ABM completo** → Tabla de productos con búsqueda. Click en 'Nuevo producto' → abre un **drawer** (panel lateral). El `ProductDrawer` recibe `productId` (null = nuevo, número = edición). Llenamos el formulario, validamos y guardamos. `upsert(next)` del `ProductsContext` actualiza el catálogo en memoria — el nuevo producto aparece en la tabla inmediatamente.

5. **AdminUsers** → Tabla de usuarios con búsqueda, toggle de roles y drawer de edición.

6. **Tour de módulos secundarios** → Variantes (stock por color/talle), Catálogo visual, Descuentos (ABM de cupones), Órdenes (listado), Fotos (cola de subida simulada)."

> **Cierre del grupo:**
"Con eso terminamos el recorrido completo de Cumbre — desde que un usuario descubre un producto hasta que el admin lo gestiona. Quedamos a disposición para preguntas."

---

## 2. Conceptos Teóricos "Salvavidas"

### Composición de componentes — AdminLayout con `children`

**Analogía del marco de cuadro:** `AdminLayout` es el marco — sidebar, header, contenedor. `children` es el cuadro que va adentro, que cambia según la vista activa. El marco no sabe qué cuadro va a contener; solo sabe cómo sostenerlo.

```jsx
// En App.jsx:
<AdminLayout>
  {view === 'admin-dashboard' && <AdminDashboard />}
  {view === 'admin-products'  && <AdminProducts />}
</AdminLayout>

// En AdminLayout.jsx:
export default function AdminLayout({ children }) {
  return (
    <div className="h-screen flex">
      <aside>...sidebar...</aside>
      <main>{children}</main>
    </div>
  )
}
```

Es el mismo concepto que el `<Outlet />` de React Router, pero implementado manualmente. El sidebar no se desmonta al cambiar de vista — evita re-renders innecesarios y mantiene el scroll del sidebar estable.

### Inmutabilidad del estado en operaciones CRUD

**Por qué nunca mutamos el estado directamente:**

```jsx
// ❌ INCORRECTO — React no detecta el cambio (misma referencia)
state.ids.push(newId)

// ✅ CORRECTO — retorna nuevo array (nueva referencia)
return { ...state, ids: [...state.ids, newId] }
```

React detecta cambios de estado **por referencia de objeto**. Si el objeto es el mismo en memoria, React asume que no hubo cambio y no re-renderiza. Al mutar directamente, el objeto tiene la misma referencia aunque su contenido cambió → el componente no se actualiza → bug silencioso.

En nuestro `ProductsContext`, el reducer `'UPSERT'` nunca modifica el estado existente:
```js
case 'UPSERT': {
  const isNew = !state.byId[action.payload.id]
  return {
    byId: { ...state.byId, [action.payload.id]: { ...state.byId[action.payload.id], ...action.payload } },
    ids:  isNew ? [action.payload.id, ...state.ids] : state.ids,
  }
}
```

### Estructura normalizada del estado de productos

`ProductsContext` guarda los productos en forma **normalizada**:
```js
{
  ids:  [101, 102, 103, ...],      // orden → O(1) para saber cuántos hay
  byId: { 101: {...}, 102: {...} } // búsqueda por ID → O(1)
}
```

**Alternativa ingenua:** array plano `[{id:101,...}, {id:102,...}]`. Para buscar un producto habría que recorrer el array entero → O(n). Con el mapa `byId`, la búsqueda es `byId[id]` → O(1). En una tabla con 500+ productos, la diferencia impacta directamente en la fluidez de la UI.

### ¿Por qué `ProductsContext` solo vive dentro de `AdminLayout`?

```jsx
export default function AdminLayout({ children }) {
  return (
    <ProductsProvider>   {/* solo para el admin */}
      <div className="h-screen flex">
        ...{children}...
      </div>
    </ProductsProvider>
  )
}
```

El usuario público del e-commerce **nunca** necesita el catálogo editable del admin. Si pusiéramos `ProductsProvider` en `main.jsx`, el contexto se inicializaría para todos los usuarios, cargando datos que el 99% de las visitas nunca usarán. Al colocarlo solo en `AdminLayout`, el contexto existe únicamente cuando se accede al panel — es lazy loading de estado global.

---

## 3. Auditoría de Código — Hooks y Eventos Reales

### ProductsContext.jsx

| Elemento | Para qué sirve |
|---|---|
| `useReducer(reducer, PRODUCTS_SEED, init)` | Inicializa el catálogo con todos los productos del seed; el tercer argumento es una función init lazy |
| `ids: products.map(p => p.id)` | Array de IDs que define el orden de la tabla |
| `byId: Object.fromEntries(...)` | Mapa ID → producto para acceso O(1) |
| `action 'UPSERT'` | Crea o actualiza un producto sin mutar el estado — retorna nuevos objetos con spread |
| `action 'REMOVE'` | Destruyendo con rest `{ [id]: _, ...byId }` elimina del mapa; filtra el array de ids |
| `useProducts()` — hook custom | Abstrae `useContext(ProductsContext)` — interfaz limpia para los consumers |

### AdminLayout.jsx

| Elemento | Para qué sirve |
|---|---|
| `useNavigation()` — `currentView` | Sabe qué vista está activa para marcar el botón del sidebar como activo |
| `h-screen overflow-hidden flex` | El contenedor ocupa exactamente el viewport — no hay scroll del body |
| `overflow-y-auto` en sidebar | El sidebar scrollea internamente si hay muchos items |
| `overflow-y-auto` en main | El área de contenido scrollea independientemente del sidebar |
| `sticky top-0` en el header interno | El header del admin se queda fijo al hacer scroll del contenido |
| `onClick={() => { logout(); navigate('home') }}` en Salir | Limpia el estado de auth y redirige al sitio público |

### AdminDashboard.jsx

| Elemento | Para qué sirve |
|---|---|
| `useProducts()` | Lee el catálogo real para calcular KPIs en tiempo real |
| `products.filter(p => p.stock > 0 && p.stock <= 3)` | Detecta productos con stock bajo para alertas |
| `KpiCard` | Componente reutilizable: Icon + label + value + accentClass — 4 instancias |
| SVG puro para el gráfico | Sin librerías de charts — polyline con puntos hardcodeados, demuestra conocimiento de SVG |

### AdminProducts.jsx — Drawer de edición

| Elemento | Para qué sirve |
|---|---|
| `useState(null)` — `editingId` | null = drawer cerrado; `'new'` = creación; número = edición de ese ID |
| `ProductDrawer({ productId, onClose })` | Componente de formulario que recibe el ID o null |
| `useState(() => existing ? {...existing} : defaults)` | Inicialización lazy — el cálculo del form inicial corre solo una vez al montar el drawer |
| `useState({})` — `errors` | Errores de validación del form |
| `key={editingId}` en `ProductDrawer` | Fuerza remontaje del drawer cuando cambia el producto — garantiza que el form se limpie |
| `save()` → `upsert(next)` | Construye el objeto producto completo y lo envía al contexto; el cambio se propaga inmediatamente a la tabla |

### AdminUsers.jsx

| Elemento | Para qué sirve |
|---|---|
| `useState(MOCK_USERS)` | Copia local de usuarios para CRUD sin modificar los mocks originales |
| `useState('')` — `search` | Filtro de búsqueda por nombre o email |
| `users.filter(u => ...)` | Filtra en el render — sin estado separado para los resultados (derivado, no almacenado) |
| `toggle(u.id)` | Alterna el rol entre `'cliente'` y `'admin'` — retorna nuevo array (inmutable) |

---

## 4. Defensa de la Arquitectura

### Por qué el admin tiene su propio layout y contexto

El admin es un **dominio completamente separado** del sitio público:
- Layout diferente (sin Navbar, sin Footer, sidebar propio)
- Estado diferente (catálogo editable vs catálogo de solo lectura)
- Usuarios diferentes (solo acceden admins autenticados)

Esta separación se refleja en la estructura de carpetas (`views/admin/`), en el condicional de `App.jsx` (`if (isAdmin) return <AdminLayout>`) y en el `ProductsProvider` localizado en `AdminLayout`.

### Tabla de módulos del admin

| Vista | Responsabilidad | Estado principal |
|---|---|---|
| `AdminDashboard` | KPIs + órdenes + alertas | `useProducts()` (derivado, solo lectura) |
| `AdminProducts` | ABM completo de productos | `useState` local + `upsert/remove` del contexto |
| `AdminVariants` | Stock por variante (color+talle) | `useState` local |
| `AdminCatalog` | Vista visual del catálogo | `useProducts()` (solo lectura) |
| `AdminDiscounts` | ABM de cupones | `useState` local |
| `AdminOrders` | Listado y gestión de órdenes | `useState` local |
| `AdminUsers` | Gestión de usuarios y roles | `useState` local (copia de mocks) |
| `AdminPhotos` | Cola de subida de imágenes | `useState` local |

Todos comparten el mismo `AdminLayout` y el `ProductsContext`. El estado específico de cada ABM es local al componente — ningún otro módulo lo consume, por lo que no necesita ser global.

### ¿Por qué no extraer `ProductDrawer` a su propio archivo?

Porque `ProductDrawer` está **fuertemente acoplado** a `AdminProducts` — usa `useProducts()` directamente, recibe `onClose` que modifica estado del padre, y no existe en ningún otro contexto del sistema. Extraerlo agregaría una importación cruzada sin ningún beneficio de reutilización. La regla es: extraer solo cuando hay reutilización real. Modularización innecesaria es deuda técnica disfrazada de organización.
