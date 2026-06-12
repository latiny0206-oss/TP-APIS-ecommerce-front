# Integrante 1 — Flujo de Descubrimiento y Navegación
**Pantallas clave:** Home · Catálogo con filtros · Detalle de producto  
**Tiempo de exposición:** 3 minutos 45 segundos

---

## 1. Guión de Exposición (Speech)

> **Arranque natural — primeras palabras frente al profesor:**

"Buenas, mi nombre es [nombre]. Vamos a presentar **Cumbre**, una aplicación de e-commerce para equipamiento de expedición, construida íntegramente en React con Vite como bundler y Context API para el estado global — sin Redux, sin librerías de ruteo externas.

Yo me ocupo del flujo de **descubrimiento**: cómo el usuario llega al sitio, navega el catálogo y entra al detalle de un producto.

**Demo en vivo — guía paso a paso:**

1. **Home** → Mostramos el `HeroSection`, la sección `Categories` con los conteos dinámicos de productos, y `Featured` con los primeros cuatro ítems del mock. Todo el home es el componente `LandingPage` en `App.jsx` — tres secciones compuestas.

2. **Catálogo** → Click en 'Indumentaria'. Se monta `Catalogo.jsx` con `categoria='indumentaria'`. Los filtros de categoría, marca, temporada y precio están en estado local con `useState`. Mostramos cómo tildar 'Calzado' también activa esa categoría — los `useMemo` recalculan los `filtrados` en tiempo real.

3. **Filtros** → Mostramos que al hacer click tanto en el texto como en el ícono del checkbox se activa el filtro. La función `toggle` es un higher-order function que envuelve `setState`.

4. **Detalle** → Click en un producto. Se navega con `navigate({ view: 'producto', params: { id: 1001 } })`. En `ProductoDetalle.jsx` el stock cambia según el talle seleccionado — `getStockParaTalle` distribuye el stock proporcionalmente. El botón 'Volver a Productos' restaura los filtros desde `sessionStorage`."

> **Cierre de tu bloque:**
"Dejo la posta a [integrante 2] que les muestra cómo a partir del detalle se agrega al carrito y se completa la compra."

---

## 2. Conceptos Teóricos "Salvavidas"

### ¿Qué es React y por qué no usamos HTML/JS vanilla?

**Analogía del restaurante:** Con HTML/JS vanilla sos el mozo y el cocinero a la vez — cada vez que cambia algo tenés que ir vos a actualizar la mesa manualmente (`document.getElementById(...).textContent = ...`). React es como tener un sistema: vos definís *cómo debería verse la mesa* y React se encarga de actualizarla cuando cambian los datos. A eso se le llama **renderizado declarativo**.

### Virtual DOM — la clave de la eficiencia

React mantiene una copia del DOM en memoria (el Virtual DOM). Cuando cambia el estado:
1. Genera un nuevo Virtual DOM
2. Lo **compara** con el anterior (algoritmo de *diffing*)
3. Solo actualiza **los nodos que cambiaron** en el DOM real

**Ejemplo concreto del proyecto:** Cuando tildás un filtro en `Catalogo.jsx`, `setCategorias([...])` dispara un re-render. React recalcula solo la lista de productos (`filtrados`) y actualiza esos nodos — no redibuja el sidebar ni el header.

### Re-rendering cuando cambian los filtros

Cadena de eventos cuando cambia un checkbox:
```
onClick en <label> → onChange() → toggle(setCategorias)(value)
→ setCategorias(nueva array) → React detecta nuevo estado
→ re-render de Catalogo → useMemo recalcula filtrados
→ React actualiza solo la grilla de productos en el DOM
```

`useMemo` es clave: evita recalcular `filtrados` en cada render si las dependencias no cambiaron.

### Routing por estado (sin React Router)

`NavigationContext.jsx` es nuestro router casero. `navigate('indumentaria')` hace dos cosas:
1. `dispatch({ payload: 'indumentaria' })` → actualiza `currentView` en el contexto
2. `window.history.pushState(...)` → sincroniza la URL del navegador

`App.jsx` lee `view` y renderiza condicionalmente:
```jsx
{view === 'indumentaria' && <Catalogo categoria="indumentaria" />}
```
Es renderizado condicional puro — no hay `<Route>` ni `<Switch>`.

---

## 3. Auditoría de Código — Hooks y Eventos Reales

### HeroSection.jsx
| Hook / Función | Línea | Para qué sirve |
|---|---|---|
| `useState('midnight')` | L32 | Guarda la variante de imagen del hero (preparado para cambios dinámicos) |
| `MOCK_PRODUCTOS.length` | L35 | Conteo dinámico de stock en tiempo real desde el array mock |

### Categories.jsx
| Hook / Función | Para qué sirve |
|---|---|
| `MOCK_PRODUCTOS.filter(p => p.categoria === cat.categoriaKey).length` | Computa el total de productos por categoría en cada render |
| `onClick={() => navigate(view)}` | Navega al catálogo de la categoría clickeada |

### Catalogo.jsx
| Hook / Función | Línea aprox. | Para qué sirve |
|---|---|---|
| `useState('')` — `busqueda` | L51 | Texto del buscador |
| `useState([categoria])` — `categorias` | L52 | Array de categorías activas |
| `useState([])` — `marcas` | L53 | Array de marcas activas |
| `useState([])` — `temporadas` | L54 | Array de temporadas activas |
| `useState(0)` / `useState(PRECIO_GLOBAL_MAX)` | L55-56 | Rango de precios |
| `useEffect(() => {...}, [])` | L61-74 | Restaura filtros desde `sessionStorage` al volver del detalle |
| `useMemo(() => filtrar, [deps])` | L105-116 | Recalcula los productos filtrados solo cuando cambian las dependencias |
| `toggle(setter)(value)` | L78-79 | Higher-order function: agrega o quita un valor de un array de filtros |
| `resetFilters()` | L83-89 | Limpia todos los filtros a valores iniciales |
| `handleProductNavigate(id)` | L91-96 | Guarda estado en `sessionStorage` y navega al detalle |

### ProductoDetalle.jsx
| Hook / Función | Para qué sirve |
|---|---|
| `useState(null)` — `talleSeleccionado` | Guarda el talle elegido por el usuario |
| `useState(1)` — `cantidad` | Cantidad a agregar al carrito |
| `useState(false)` — `agregado` | Controla el estado temporal "¡Agregado!" del botón |
| `getStockParaTalle(talle)` | Distribuye el stock total proporcionalmente según la posición del talle |
| `handleTalleSelect(t)` | Actualiza talle Y resetea cantidad a 1 |
| `handleAgregar()` | Llama a `addToCart()` del `CartContext` |
| `handleBack()` | Lee `sessionStorage` para volver al catálogo con los filtros restaurados |

### Evento onClick en Checkbox (Catalogo.jsx)
```jsx
// El <label> wrappea todo → un solo onClick activa el filtro
// sin importar si clickeás el ícono check o el texto
<label onClick={onChange} className="... cursor-pointer select-none">
  <div className="visual-checkbox">{checked && <Check />}</div>
  <span>{label}</span>
</label>
```

---

## 4. Defensa de la Arquitectura

### Estructura `src/` — por qué está bien organizada

```
src/
├── components/          ← Bloques reutilizables (se usan en múltiples vistas)
│   ├── Navbar.jsx       ← Aparece en TODAS las vistas con shell
│   ├── HeroSection.jsx  ← Sección del home
│   ├── Categories.jsx   ← Sección del home
│   ├── Featured.jsx     ← Sección del home
│   ├── Footer.jsx       ← Aparece en TODAS las vistas con shell
│   └── ui/              ← Átomos: Button, ProductCard, Toast, etc.
│
├── context/             ← Estado global compartido entre vistas
│
├── views/               ← Una vista = una pantalla completa
│   ├── Catalogo.jsx
│   ├── ProductoDetalle.jsx
│   └── ...
│
├── mocks/               ← Datos de prueba centralizados
└── data/                ← Constantes de UI (textos, listas, configuración)
```

**Pregunta trampa del profesor:** "¿Por qué `HeroSection`, `Categories` y `Featured` están en `components/` y no en `views/`?"

**Respuesta:** Porque no son vistas completas — son **secciones** que se componen dentro de `LandingPage` (que vive en `App.jsx`). Son reutilizables y no tienen conciencia de la URL. Si mañana quisiera mostrar `Categories` en otra pantalla, puedo importarla directamente. Una vista (`views/`) representa una pantalla entera; un componente (`components/`) es un bloque que puede existir dentro de cualquier pantalla.

**Pregunta trampa:** "¿Por qué `ShellPage` y `LandingPage` viven en `App.jsx` y no en archivos separados?"

**Respuesta:** Son layouts livianos de solo 5-8 líneas que actúan como "armadores" del Navbar + content + Footer. Extraerlos a archivos separados agregaría complejidad de importaciones sin ningún beneficio real — son demasiado simples para justificar un archivo propio.
