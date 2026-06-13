# Integrante 1 — Flujo de Descubrimiento y Navegación
**Pantallas clave:** Home · Catálogo con filtros · Detalle de producto  
**Tiempo de exposición:** 3 minutos 45 segundos

---

## 1. Guión de Exposición (Speech)

> **Arranque natural — primeras palabras frente al profesor:**

"Buenas, mi nombre es [nombre]. Les presento **Cumbre**, una aplicación de e-commerce para equipamiento de expedición, construida íntegramente en React con Vite como bundler y Context API para el estado global — sin Redux, sin librerías de ruteo externas.

Yo me ocupo del flujo de **descubrimiento**: cómo el usuario llega al sitio, navega el catálogo y entra al detalle de un producto.

**Demo en vivo — guía paso a paso:**

1. **Home** → Mostramos el `HeroSection`, la sección `Categories` con los conteos dinámicos de productos, `Featured` con los productos de la línea Cumbre Pro, y la sección de descubrimiento que lleva al catálogo completo. Todo el home es la función `LandingPage` en `App.jsx` — cuatro secciones compuestas. Al hacer click en una tarjeta de categoría, `navigate({ view: 'catalogo', params: { categoria: 'equipamiento' } })` lleva a `/catalogo?categoria=equipamiento` — el mismo mecanismo que usa el Navbar.

2. **Catálogo** → Click en 'Productos' del menú. Se monta `Catalogo.jsx` sin categoría inicial. El título es siempre 'PRODUCTOS'. Los filtros de categoría, marca, temporada y precio están en estado local con `useState`. Al tildar 'Calzado' y 'Indumentaria' al mismo tiempo, los `useMemo` recalculan `filtrados` en tiempo real.

3. **Filtros y Reset** → Mostramos que el botón 'Limpiar filtros' resetea absolutamente todos los filtros activos, devolviendo el catálogo completo. No mantiene ninguna categoría pre-seleccionada.

4. **Detalle** → Click en un producto con talles. La selección de talle activa la visualización de stock disponible (antes de seleccionar talle, el stock no se muestra). Los talles sin stock aparecen marcados con una cruz (✕) y no se pueden seleccionar. El botón 'Volver a Productos' restaura los filtros desde `sessionStorage`."

> **Cierre de tu bloque:**
"Dejo la posta a [integrante 2] que les muestra cómo a partir del detalle se agrega al carrito y se completa la compra."

---

## 2. Conceptos Teóricos "Salvavidas"

### ¿Qué es React y por qué no usamos HTML/JS vanilla?

**Analogía del restaurante:** Con HTML/JS vanilla sos el mozo y el cocinero a la vez — cada vez que cambia algo tenés que ir vos a actualizar la mesa manualmente (`document.getElementById(...).textContent = ...`). React es como tener un sistema: vos definís *cómo debería verse la mesa* y React se encarga de actualizarla cuando cambian los datos. A eso se le llama **renderizado declarativo**.

### Virtual DOM — la clave de la eficiencia

React mantiene una copia del DOM en memoria (el Virtual DOM). Cuando cambia el estado:
1. Genera un nuevo Virtual DOM
2. Lo **compara** con el anterior (algoritmo de *diffing* o *reconciliation*)
3. Solo actualiza **los nodos que cambiaron** en el DOM real

**Ejemplo concreto del proyecto:** Cuando tildás un filtro en `Catalogo.jsx`, `setCategorias([...])` dispara un re-render. React recalcula solo la lista de productos (`filtrados`) y actualiza esos nodos — no redibuja el sidebar ni el header.

### Re-rendering cuando cambian los filtros

Cadena de eventos cuando cambia un checkbox:
```
onClick en <label> → onChange() → toggle(setCategorias)(value)
→ setCategorias(nuevo array) → React detecta nuevo estado
→ re-render de Catalogo → useMemo recalcula filtrados
→ React actualiza solo la grilla de productos en el DOM
```

`useMemo` es clave: evita recalcular `filtrados` en cada render si las dependencias no cambiaron.

### Routing por estado (sin React Router)

`NavigationContext.jsx` es nuestro router propio. `navigate({ view: 'catalogo', params: { categoria: 'indumentaria' } })` hace dos cosas:
1. `dispatch({ payload })` → actualiza `currentView` y `params` en el contexto vía `useReducer`
2. `window.history.pushState(...)` → sincroniza la URL a `/catalogo?categoria=indumentaria`

`App.jsx` lee `view` y renderiza condicionalmente:
```jsx
{view === 'catalogo' && (
  <ShellPage>
    <Catalogo key={params.categoria ?? '__all__'} />
  </ShellPage>
)}
```
El prop `key` es la clave de la reactividad: cuando el usuario navega de `/catalogo?categoria=calzado` a `/catalogo?categoria=indumentaria`, React detecta que el `key` cambió y **fuerza el remonte** del componente `Catalogo`. Esto garantiza que el estado inicial (`useState`) y el `useEffect` de restauración de `sessionStorage` se ejecuten frescos para cada categoría, sin ningún efecto secundario de estado previo.

### Persistencia de filtros con sessionStorage

Cuando el usuario navega del catálogo al detalle de producto, la app guarda el estado de filtros en `sessionStorage` bajo la clave `catalogoState` (con `backView: 'catalogo'`). Al volver desde el detalle, `Catalogo.jsx` lee esa clave en un `useEffect` de montaje y restaura exactamente los mismos filtros — búsqueda, categorías, marcas, temporadas y rango de precios. Esto evita que el usuario tenga que volver a filtrar desde cero.

El mismo mecanismo funciona cuando el usuario regresa desde el carrito con el botón "Continuar comprando". La unificación de la ruta a `/catalogo` simplificó la lógica: la condición `saved.backView === 'catalogo'` es ahora universal, sin necesidad de comparar contra nombres de vistas específicas de categoría.

### Talles con stock cero — UX defensiva

Para evitar que un usuario seleccione un talle sin stock (lo que generaría un pedido inválido), la UI:
1. Muestra el talle con texto atenuado y una cruz `✕` superpuesta
2. Desactiva el botón con `disabled={agotado}` — el navegador lo marca como no interactuable
3. Oculta el contador de stock hasta que se selecciona un talle disponible

---

## 3. Auditoría de Código — Hooks y Eventos Reales

### HeroSection.jsx
| Hook / Función | Para qué sirve |
|---|---|
| `MOCK_PRODUCTOS.length` | Conteo dinámico de stock en tiempo real desde el array mock |
| `useNavigation()` | Para el botón CTA que navega al catálogo |

### Categories.jsx
| Hook / Función | Para qué sirve |
|---|---|
| `MOCK_PRODUCTOS.filter(p => p.categoria === cat.categoriaKey).length` | Computa el total de productos por categoría en tiempo real desde el array mock |
| `navigate({ view: 'catalogo', params: { categoria: cat.categoriaKey } })` | Navega a `/catalogo?categoria=equipamiento` — el filtro viaja en la URL como query param, igual que el Navbar |

### Navbar.jsx / data/index.js
| Elemento | Para qué sirve |
|---|---|
| `NAV_ITEMS[i].params = { categoria: '...' }` | Los ítems del nav ahora llevan sus propios params; el componente los pasa a `navigate()` sin hardcodeo |
| `isItemActive(item)` | Compara `currentView === item.view && params.categoria === item.params?.categoria` — el estado activo del link refleja el filtro, no solo la vista |
| `go(view, navParams)` | Wrapper que construye el payload `{ view, params }` y cierra el menú móvil |

### Catalogo.jsx
| Hook / Función | Para qué sirve |
|---|---|
| `useState('')` — `busqueda` | Texto del buscador |
| `useState([])` — `categorias` | Array de categorías activas (siempre empieza vacío) |
| `useState([])` — `marcas` | Array de marcas activas |
| `useState([])` — `temporadas` | Array de temporadas activas |
| `useState(0)` / `useState(PRECIO_GLOBAL_MAX)` | Rango de precios |
| `useEffect(() => {...}, [])` | Restaura filtros desde `sessionStorage` al montar |
| `useEffect([busqueda, ...])` | Guarda estado actual en `catalogoReturnFilters` para el carrito |
| `useMemo(() => filtrar, [deps])` | Recalcula los filtrados solo cuando cambian las dependencias |
| `toggle(setter)(value)` | Higher-order function: agrega o quita un valor de un array de filtros |
| `resetFilters()` | Limpia **todos** los filtros incluyendo categorías (sin excepciones) |

### ProductoDetalle.jsx
| Hook / Función | Para qué sirve |
|---|---|
| `useState(null)` — `talleSeleccionado` | Guarda el talle elegido por el usuario |
| `useState(1)` — `cantidad` | Cantidad a agregar al carrito |
| `useState(false)` — `agregado` | Controla el estado temporal "¡Agregado!" del botón |
| `getStockParaTalle(talle)` | Retorna stock del talle: usa `stockPorTalle[talle]` si el producto tiene el campo, si no distribuye proporcionalmente |
| `talleSeleccionado && <span>{stockActual} disponibles</span>` | El stock solo se muestra una vez que hay un talle seleccionado |
| `disabled={agotado}` en botón de talle | Impide seleccionar un talle sin stock |
| `handleBack()` | Lee `sessionStorage.catalogoState` para volver al catálogo con filtros restaurados |

---

## 4. Defensa de la Arquitectura

### ¿Por qué `ShellPage` y `LandingPage` viven en `App.jsx`?

Son layouts livianos de 5-8 líneas que actúan como "armadores" de Navbar + contenido + Footer. Extraerlos a archivos separados agregaría complejidad de importaciones sin ningún beneficio real — son demasiado simples para justificar su propio archivo. En React, el criterio para extraer un componente a su propio archivo es: ¿lo van a importar más de una vista? Si no, queda inline.

### ¿Por qué unificamos toda la navegación en la ruta única `/catalogo`?

La versión anterior tenía rutas separadas `/indumentaria`, `/calzado`, `/equipamiento` en el router. Cada una renderizaba `<Catalogo categoria="...">` y el componente recibía un prop estático para inicializar los filtros. Este diseño generaba tres problemas concretos:

1. **Redirecciones rotas:** cualquier enlace que apuntara a `/indumentaria` en lugar de `/catalogo` era una ruta separada que el router debía conocer; un typo o un enlace mal actualizado producía una vista en blanco o el fallback al home.
2. **Estado duplicado:** el componente `Catalogo` se montaba y desmontaba con cada cambio de categoría, perdiendo el estado de los filtros cruzados (por ejemplo, "Calzado de la marca Salomon").
3. **Inconsistencia de URLs:** la URL `/indumentaria` no tenía query params y no era extensible; agregar un segundo filtro simultáneo era imposible sin rediseñar el router.

La solución fue **centralizar en `/catalogo?categoria=X`**. La arquitectura resultante es:

- `NavigationContext` extiende `buildPath()` para incluir `categoria` en la query string y `paramsFromUrl()` para leerlo al cargar. Las URLs legadas (`/indumentaria`) se mapean automáticamente a `{ view: 'catalogo', params: { categoria: 'indumentaria' } }` sin romper bookmarks.
- `App.jsx` renderiza un único branch `{view === 'catalogo' && <Catalogo key={params.categoria ?? '__all__'} />}`. El `key` dinámico controla cuándo React remonta el componente: cambiar de categoría fuerza un remonte limpio; navegar a "Productos" (sin categoría) limpia todos los filtros.
- `Catalogo.jsx` lee `params.categoria` del contexto para inicializar su estado local, sin depender de props externos.

El título `"PRODUCTOS"` es invariante porque el catálogo es conceptualmente uno solo — la categoría es un filtro, no una vista distinta. El breadcrumb refleja la categoría activa cuando hay exactamente una seleccionada, usando el objeto `TITLES` del módulo.

### ¿Por qué usamos `sessionStorage` en lugar de un Context para los filtros del catálogo?

El estado de los filtros del catálogo es efímero — solo importa mientras el usuario navega entre catálogo, detalle y carrito en la misma sesión. `sessionStorage` es el storage apropiado para este caso: persiste entre navegaciones del mismo tab, pero se limpia cuando el usuario cierra el tab o el navegador. No tiene sentido meterlo en un Context global que viviría durante toda la sesión aunque el usuario no esté en el catálogo.

La decisión de usar `sessionStorage` en lugar de pasar los filtros como query params adicionales en la URL fue deliberada: los filtros complejos (múltiples categorías + marcas + rango de precios) generarían URLs muy largas y difíciles de compartir. `sessionStorage` los mantiene privados a la sesión de navegación, que es exactamente la semántica que necesitamos.
