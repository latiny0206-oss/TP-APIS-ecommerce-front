# Integrante 4 — Panel de Administración (ABM / CRUD)
**Pantallas clave:** AdminLayout · AdminDashboard · AdminProducts · AdminUsers + resumen de módulos secundarios  
**Tiempo de exposición:** 3 minutos 45 segundos

---

## 1. Guión de Exposición (Speech)

> **Cierre del grupo — retomás del integrante 3:**

"Gracias [integrante 3]. Ahora cambiamos completamente de sombrero: dejo de ser usuario y me convierto en administrador de la tienda.

**Demo en vivo — guía paso a paso:**

1. **Cambio de layout al entrar al admin** → Iniciamos sesión con `admin@cumbre.com` / `admin123`. El `authReducer` detecta `rol === 'admin'` y navega a `'admin-dashboard'`. En `App.jsx`, las vistas admin se renderizan **sin** `<ShellPage>` (sin Navbar ni Footer públicos) — van directo a `<AdminLayout>`. Este es el cambio de layout que queremos mostrar.

2. **AdminLayout** → Es el shell del admin: sidebar fijo a la izquierda con `overflow-y-auto` y área de contenido a la derecha con scroll independiente. El logo del sidebar navega a `'admin-dashboard'` (no al home público — eso fue un bug que corregimos). El botón 'Salir' sí va al `'home'` público.

3. **Dashboard** → `AdminDashboard.jsx` usa `useProducts()` para leer el catálogo real y calcular: cuántos productos activos hay, cuáles tienen stock bajo (≤ 3 unidades). Las órdenes recientes son datos mock hardcodeados. El gráfico de tendencia es un SVG puro — sin librerías externas.

4. **AdminProducts — ABM completo** → Mostramos la tabla de productos con búsqueda. Click en 'Nuevo producto' → abre un **drawer** (panel lateral). El drawer es un `ProductDrawer` que recibe `productId` (null = nuevo, número = edición). Llenamos el formulario, validamos y hacemos 'Guardar'. `upsert(next)` del `ProductsContext` actualiza el catálogo en memoria — el nuevo producto aparece en la tabla inmediatamente.

5. **AdminUsers** → Tabla de usuarios con búsqueda, toggle de roles y drawer de edición.

6. **Tour rápido de módulos secundarios** → Variantes (stock por color/talle), Catálogo visual, Descuentos (ABM de cupones), Órdenes (listado), Fotos (cola de subida simulada)."

> **Cierre del grupo:**
"Con eso terminamos el recorrido completo de Cumbre — desde que un usuario descubre un producto hasta que el admin lo gestiona desde el panel. Quedamos a disposición para preguntas."

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
      <main>{children}</main>  {/* ← aquí va la vista activa */}
    </div>
  )
}
```

Es el mismo concepto que el `<Outlet />` de React Router, pero implementado manualmente. Permite que la vista cambie sin desmontar el sidebar — lo que evita re-renders innecesarios y mantiene el scroll del sidebar estable.

### Inmutabilidad del estado en operaciones CRUD

**Por qué nunca debemos mutar el estado directamente:**

```jsx
// ❌ INCORRECTO — muta el estado directamente
state.items.push(newProduct)

// ✅ CORRECTO — retorna un nuevo array (inmutable)
return { ...state, items: [...state.items, newProduct] }
```

React detecta cambios de estado **por referencia** — si el objeto es el mismo en memoria, React asume que no cambió y no re-renderiza. Al mutar directamente, el objeto tiene la misma referencia aunque su contenido cambió → el componente no se actualiza → bug difícil de rastrear.

En nuestro `ProductsContext`, el reducer `'UPSERT'` nunca toca el array existente:
```js
case 'UPSERT': {
  const hit = state.ids.find(id => id === product.id)
  return hit
    ? { ...state, byId: { ...state.byId, [product.id]: product } }  // nuevo objeto byId
    : { ...state, ids: [...state.ids, product.id], byId: { ...state.byId, [product.id]: product } }
}
```

### Estructura normalizada del estado de productos

`ProductsContext` guarda los productos en forma **normalizada**:
```js
{
  ids: [101, 102, 103, ...],     // orden
  byId: { 101: {...}, 102: {...} } // acceso O(1) por id
}
```
Alternativa ingenua: array plano `[{id:101,...}, {id:102,...}]`. El problema: para buscar un producto tenés que recorrer el array entero → O(n). Con el mapa `byId`, la búsqueda es `byId[id]` → O(1). En una tabla con 500+ productos, la diferencia se nota.

---

## 3. Auditoría de Código — Hooks y Eventos Reales

### ProductsContext.jsx

| Elemento | Para qué sirve |
|---|---|
| `useReducer(productsReducer, initialState)` | Estado mutable del catálogo admin |
| `ids: PRODUCTS_SEED.map(p => p.id)` | Array de IDs que define el orden de la tabla |
| `byId: Object.fromEntries(...)` | Mapa ID → producto para acceso O(1) |
| `action 'UPSERT'` | Crea o actualiza un producto sin mutar el estado — retorna nuevos objetos |
| `action 'REMOVE'` | Filtra el array de ids y elimina del mapa byId |
| `useProducts()` — hook custom | Abstraen `useContext(ProductsContext)` — cualquier componente admin consume el catálogo |

### AdminLayout.jsx

| Elemento | Para qué sirve |
|---|---|
| `useNavigation()` — `currentView` | Sabe qué vista está activa para marcar el botón del sidebar como active |
| `h-screen overflow-hidden flex` | El contenedor ocupa exactamente el viewport — no hay scroll del body |
| `overflow-y-auto` en sidebar | El sidebar scrollea internamente si hay muchos items de nav |
| `overflow-y-auto flex flex-col` en main | El área de contenido scrollea independientemente del sidebar |
| `sticky top-0` en el header interno | El header del admin se queda fijo al hacer scroll del contenido |
| `onClick={() => navigate('admin-dashboard')}` en logo | Redirige al dashboard admin, no al home público |
| `onClick={() => navigate('home')}` en botón Salir | Salida al sitio público |

### AdminDashboard.jsx

| Elemento | Para qué sirve |
|---|---|
| `useProducts()` | Lee el catálogo para calcular KPIs reales |
| `products.filter(p => p.stock > 0 && p.stock <= 3)` | Detecta productos con stock bajo para las alertas |
| `KpiCard` | Componente reutilizable: recibe Icon, label, value, accentClass — 4 instancias |
| `RECENT_ORDERS.map(o => <tr key={o.id}>)` | Tabla de órdenes recientes con `key` por ID de orden |
| `SVG` puro para el gráfico | Sin librerías de charts externas — polyline con puntos hardcodeados |

### AdminProducts.jsx — Drawer de edición

| Elemento | Para qué sirve |
|---|---|
| `useState(null)` — `editingId` | null = sin drawer abierto; número = edición; `'new'` = creación |
| `ProductDrawer({ productId, onClose })` | Componente de formulario que recibe el ID o null |
| `useState(() => existing ? {...existing} : defaultValues)` | Inicialización lazy del form — solo se ejecuta una vez al montar el drawer |
| `useState({})` — `errors` | Errores de validación del form del drawer |
| `validate()` | Valida nombre, precio y descuento antes de guardar |
| `save()` → `upsert(next)` | Construye el objeto producto completo y lo envía al contexto |
| `onChange={(e) => setForm({...form, [field]: e.target.value})}` | Input controlado con computed property name |
| `key={editingId}` en `ProductDrawer` | Fuerza remontaje del drawer cuando cambia el producto en edición — limpia el form |

### AdminUsers.jsx — patrón similar

| Elemento | Para qué sirve |
|---|---|
| `useState(MOCK_USERS)` | Copia local de usuarios para CRUD sin modificar los mocks originales |
| `useState('')` — `search` | Filtro de búsqueda por nombre o email |
| `users.filter(u => ...)` | Filtra en el render — no hay estado separado para los resultados |
| `toggle(u.id)` | Alterna el rol entre `'cliente'` y `'admin'` — retorna nuevo array |

---

## 4. Defensa de la Arquitectura (El punto fuerte ante el profesor)

### Por qué el admin tiene su propio layout y contexto

El admin es un **dominio completamente separado** del site público:
- Layout diferente (sin Navbar, sin Footer, sidebar propio)
- Estado diferente (catálogo editable, vs catálogo de solo lectura del público)
- Usuarios diferentes (solo acceden admins)

Por eso:
- `AdminLayout` es independiente de `ShellPage`
- `ProductsContext` lo provee solo `AdminLayout` (no está en `main.jsx`) → solo se inicializa cuando se accede al panel admin, el usuario común no carga ese contexto nunca

```jsx
// AdminLayout.jsx envuelve con su propio Provider
export default function AdminLayout({ children }) {
  return (
    <ProductsProvider>   {/* ← solo para el admin */}
      <div className="h-screen flex">
        ...
      </div>
    </ProductsProvider>
  )
}
```

### Cómo el admin está dividido en docenas de sub-componentes

**Vista en VS Code de AdminProducts.jsx:** El archivo contiene múltiples componentes definidos localmente:
- `FieldLabel` — wrapper de label de formulario (1 prop)
- `AdminInput` — wrapper de input con estilos del admin (1 prop extra)
- `ProductDrawer` — el panel lateral completo de edición
- `ProductRow` — fila de la tabla con acciones (editar, fotos, eliminar)

Esto mantiene la función `AdminProducts()` principal limpia — solo orquesta el estado y el renderizado de alto nivel. Cada sub-componente tiene una sola responsabilidad.

**Pregunta del profesor:** "¿Por qué no extraen `ProductDrawer` a su propio archivo?"

**Respuesta:** Porque `ProductDrawer` está **fuertemente acoplado** a `AdminProducts` — usa `useProducts()` directamente, recibe `onClose` que modifica estado del padre. Extraerlo a un archivo separado no agregaría reusabilidad (no lo usa nadie más) y sí agregaría fricción de importaciones. La modularización tiene un costo — solo vale la pena cuando hay reutilización real.

### Tabla de módulos del admin — visión de conjunto

| Vista | Responsabilidad | Estado principal |
|---|---|---|
| `AdminDashboard` | KPIs + órdenes recientes + alertas | `useProducts()` (derivado) |
| `AdminProducts` | ABM completo de productos | `useState` local + `upsert/remove` del contexto |
| `AdminVariants` | Stock por variante (color+talle) | `useState` local |
| `AdminCatalog` | Vista visual del catálogo | `useProducts()` (solo lectura) |
| `AdminDiscounts` | ABM de cupones | `useState` local |
| `AdminOrders` | Listado y gestión de órdenes | `useState` local |
| `AdminUsers` | Gestión de usuarios y roles | `useState` local (copia de mocks) |
| `AdminPhotos` | Cola de subida de imágenes | `useState` local |

Todos comparten el mismo `AdminLayout` (sidebar + header) y el mismo `ProductsContext` para el catálogo. El estado específico de cada ABM es local al componente — no necesita ser global porque ningún otro módulo lo consume.
