# Integrante 2 — Flujo de Conversión (Carrito y Checkout)
**Pantallas clave:** Carrito (`/carrito`) · Checkout (`/checkout`) · Confirmación (`/confirmacion`)
**Tiempo de exposición:** 3 minutos 45 segundos

---

## 1. Pantallas y rutas asignadas

| Pantalla       | Ruta            |
|----------------|-----------------|
| Carrito        | `/carrito`      |
| Checkout       | `/checkout`     |
| Confirmación   | `/confirmacion` |

---

## 2. Demo en vivo — guía paso a paso

1. **Agregar al carrito** → Desde `ProductoDetalle.jsx`, el botón 'Agregar al carrito' llama a `addToCart()` del `CartContext`. El `cartReducer` procesa la acción `'ADD'` y genera un `lineId` único: `'p1001-M'`. Si el mismo producto con el mismo talle ya existe en el carrito, suma la cantidad — sin duplicar líneas.

2. **Ver el Carrito** → `Carrito.jsx`. Mostrar las líneas con `items.map((line) => ...)` — cada `<div>` tiene `key={line.lineId}`. Click en la imagen o el nombre del producto navega a `/producto/${line.productId}` (route param). Cambiar cantidades con los botones `+` y `−` que llaman a `updateQty({ lineId, qty })`. Si la cantidad llega a 0, el reducer elimina la línea automáticamente.

3. **Cupón de descuento** → Escribir `INVIERNO24` y presionar 'Aplicar'. El reducer valida contra `ALL_COUPONS` y actualiza `state.coupon`. Los totales se recalculan en tiempo real con `computeTotals()`.

4. **Continuar comprando** → El botón llama `navigate('/catalogo')` — simple, sin sessionStorage. El usuario puede volver al catálogo y los filtros que tenía en la URL siguen disponibles con el botón "Atrás" del navegador.

5. **Checkout — Paso 1 (Envío)** → Formulario controlado en `Checkout.jsx`. Los campos tienen validación estricta: dirección alfanumérica, ciudad y provincia solo letras, código postal solo dígitos, teléfono mínimo 8 dígitos.

6. **Checkout — Paso 2 (Pago)** → Si elegís tarjeta, `validateCard()` valida número (16 dígitos), titular (solo letras, nombre y apellido), vencimiento MM/AA y CVV.

7. **Confirmación** → `confirmar()` es async, simula 900ms de procesamiento, genera un número de orden y llama a `clearCart()`. Luego **navega a `/confirmacion` pasando el número de orden en `location.state`**:
```jsx
navigate('/confirmacion', { state: { orderNumber: '#ORD-12345' } })
```
`Confirmacion.jsx` lee el número con `useLocation().state.orderNumber`. Si alguien accede directamente a `/confirmacion` sin estado, el `useEffect` redirige al home.

---

## 3. Archivos y componentes clave

| Archivo | Rol |
|---|---|
| `src/views/Carrito.jsx` | Lista de ítems, cuponera, resumen y navegación al checkout |
| `src/views/Checkout.jsx` | 3 pasos: envío, pago, revisión + acción `confirmar()` |
| `src/views/Confirmacion.jsx` | Pantalla de éxito, lee el número de orden de `location.state` |
| `src/context/CartContext.jsx` | `useReducer` con acciones ADD, REMOVE, UPDATE_QTY, APPLY_COUPON, CLEAR |

---

## 4. Tema técnico: Estado del carrito, totales, formularios controlados y checkout

### `CartContext.jsx` — `useReducer` y estado inmutable

El carrito usa `useReducer` con cinco acciones. El estado tiene esta forma:

```js
{
  items:       [],      // array de líneas { lineId, productId, nombre, precio, qty, imagen, talle }
  coupon:      null,    // { code, type, value, label } | null
  couponError: null,
}
```

**Llave de línea única:**
```js
const lineId = `p${productId}-${talle}`
```
Si el mismo producto con el mismo talle ya existe, el reducer suma cantidades en lugar de duplicar la línea.

**Acción ADD — inmutable:**
```js
case 'ADD': {
  const existing = state.items.find((i) => i.lineId === action.payload.lineId)
  if (existing) {
    return {
      ...state,
      items: state.items.map((i) =>
        i.lineId === action.payload.lineId
          ? { ...i, qty: i.qty + (action.payload.qty || 1) }
          : i
      ),
    }
  }
  return { ...state, items: [...state.items, action.payload] }
}
```
Nunca se muta el array directamente. Siempre se retorna un nuevo objeto de estado.

**Persistencia en localStorage:**
```js
// El reducer persiste en cada acción:
localStorage.setItem('cart', JSON.stringify(state.items))
```

### Cálculo de totales — `computeTotals()`

```js
function computeTotals(items, coupon) {
  const subtotal = items.reduce((sum, line) => sum + line.precio * line.qty, 0)
  let discount = 0
  if (coupon) {
    discount = coupon.type === 'percent'
      ? Math.round(subtotal * coupon.value)
      : coupon.value
  }
  return {
    subtotal,
    discount,
    total:     subtotal - discount,
    itemCount: items.reduce((sum, line) => sum + line.qty, 0),
  }
}
```

Los totales son **valores derivados** — no se almacenan en el estado, se recalculan en cada render a partir de `items` y `coupon`.

### Formularios controlados en `Checkout.jsx`

Cada campo del formulario de envío es un input controlado con validación:

```jsx
// Estado del formulario de envío
const [ship, setShip] = useState({ nombre: '', direccion: '', ciudad: '', ... })

// Handler con filtro de caracteres en tiempo real
const sF = (field, filter) => (e) => {
  const v = filter ? filter(e.target.value) : e.target.value
  setShip({ ...ship, [field]: v })
}

// Ejemplo: ciudad solo acepta letras
<TInput
  value={ship.ciudad}
  onChange={sF('ciudad', (v) => v.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-]/g, ''))}
/>
```

**Validación explícita antes de avanzar (`validateShip`):**
```js
function validateShip(s) {
  const e = {}
  if (!s.nombre.trim()) e.nombre = 'Requerido'
  if (!/\d/.test(s.direccion)) e.direccion = 'Debe incluir número de calle'
  if (/\d/.test(s.ciudad)) e.ciudad = 'Solo letras permitidas'
  // ...
  return e  // objeto vacío = sin errores
}
```

### `location.state` — paso de datos entre rutas

Después de confirmar la compra, `Checkout.jsx` navega a `/confirmacion` pasando el número de pedido en el state de navegación:

```jsx
// En Checkout.jsx — después de confirmar:
navigate('/confirmacion', { state: { orderNumber: '#ORD-12345' } })

// En Confirmacion.jsx — lee el state:
const { state } = useLocation()
const orderNumber = state?.orderNumber

// Si alguien accede directamente sin state, redirige al home:
useEffect(() => {
  if (!orderNumber) navigate('/', { replace: true })
}, [orderNumber, navigate])
```

`location.state` es el mecanismo correcto para pasar datos efímeros entre rutas — datos que no deberían estar en la URL (como un número de confirmación que solo se muestra una vez) ni en el estado global.

### Listas con `key` — por qué importa

```jsx
{items.map((line) => (
  <div key={line.lineId}>   {/* ← key = 'p1001-M', no el índice */}
    ...
  </div>
))}
```

`lineId = 'p${productId}-${talle}'` identifica unívocamente una combinación producto + talle. Si el usuario elimina la primera línea, React usa la key para identificar que es ese elemento el que desapareció — no "el primero" — y no confunde el estado de otros ítems.

---

## 5. Preguntas probables del examen

**P: ¿Por qué `useReducer` en `CartContext` y no múltiples `useState`?**
R: El carrito tiene múltiples acciones relacionadas (agregar, quitar, actualizar cantidad, aplicar cupón, vaciar). Con `useReducer`, cada acción está centralizada en `cartReducer` y las transiciones de estado son predecibles y testeables. Con `useState` tendríamos variables dispersas (`isLoading`, `items`, `coupon`) que habría que actualizar en sincronía, arriesgando estados inconsistentes.

**P: ¿Qué pasa si el usuario agrega el mismo producto y talle dos veces?**
R: El reducer detecta que ya existe una línea con ese `lineId` y suma las cantidades en lugar de crear una segunda línea:
```js
if (existing) {
  return { ...state, items: state.items.map((i) =>
    i.lineId === action.payload.lineId ? { ...i, qty: i.qty + 1 } : i
  )}
}
```

**P: ¿Cómo se calcula el descuento del cupón?**
R: `computeTotals()` verifica el tipo del cupón: `'percent'` calcula el porcentaje sobre el subtotal (`subtotal * coupon.value`), `'fixed'` resta un monto fijo. La función retorna `{ subtotal, discount, total, itemCount }` y nunca guarda estos valores en el estado — se recalculan en cada render.

**P: ¿Qué es un formulario controlado?**
R: Un input cuyo `value` siempre está ligado a una variable de estado React. Cada cambio en el input dispara `onChange` → `setState` → React re-renderiza con el nuevo valor. El DOM no "sabe" el valor — React lo controla. Esto permite validar, filtrar caracteres y formatear (como el número de tarjeta con espacios cada 4 dígitos) antes de actualizar el estado.

**P: ¿Por qué `/confirmacion` es una ruta separada y no un estado dentro de Checkout?**
R: Tener `/confirmacion` como ruta propia permite que el URL sea semántico y bookmarkeable en teoría (aunque el guard redirige si no hay state). Más importante: separa la pantalla de éxito del flujo de checkout — si el usuario recarga `/checkout`, ve el formulario vacío, no la pantalla de éxito. Con la ruta separada, el estado de `Checkout.jsx` se limpia al navegar.

**P: ¿Por qué no se guarda `orderNumber` en un Context global?**
R: `orderNumber` es efímero — solo existe entre el momento de confirmar y el momento de ver la pantalla de confirmación. No tiene sentido en el estado global. `location.state` es el mecanismo correcto: vive solo mientras dure la navegación a esa ruta y se descarta automáticamente.
