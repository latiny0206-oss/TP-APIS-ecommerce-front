# Integrante 2 — Flujo de Conversión (Carrito y Checkout)
**Pantallas clave:** Carrito · Checkout (3 pasos) · Pantalla de Confirmación  
**Tiempo de exposición:** 3 minutos 45 segundos

---

## 1. Guión de Exposición (Speech)

> **Retomás la posta del integrante 1:**

"Gracias [integrante 1]. Ahora que el usuario encontró su producto y lo agregó al carrito, yo me encargo de lo más importante del negocio: la **conversión de la compra**.

**Demo en vivo — guía paso a paso:**

1. **Agregar al carrito** → Desde `ProductoDetalle.jsx`, el botón 'Agregar al carrito' llama a `addToCart()` del `CartContext`. El `cartReducer` procesa el action `'ADD'` y genera un `lineId` único: `'p1001-M'`. Si el mismo producto con el mismo talle ya existe, suma la cantidad — sin duplicar líneas.

2. **Ver el Carrito** → `Carrito.jsx`. Mostramos las líneas del carrito con `items.map()` — cada una con `key={line.lineId}`. Cambiamos la cantidad con los botones `+` y `−` que llaman a `updateQty({ lineId, qty })`. Si la cantidad llega a 0, el reducer elimina la línea automáticamente.

3. **Continuar comprando** → El botón 'Continuar comprando' lee el estado de filtros guardado en `sessionStorage` (`catalogoReturnFilters`) y redirige al catálogo restaurando exactamente los mismos filtros que el usuario tenía antes de ir al carrito.

4. **Cupón de descuento** → Escribimos `INVIERNO24` y presionamos 'Aplicar'. El reducer valida contra `ALL_COUPONS` y actualiza `state.coupon`. Los totales se recalculan en tiempo real con `computeTotals()`.

5. **Checkout — Paso 1 (Envío)** → Formulario controlado en `Checkout.jsx`. Los campos tienen validación estricta: dirección alfanumérica (letras + número de calle obligatorio), ciudad y provincia solo letras (los números se rechazan al tipear), código postal solo dígitos, teléfono solo dígitos con mínimo 8 caracteres.

6. **Checkout — Paso 2 (Pago)** → Si elegís tarjeta, `validateCard()` valida número (16 dígitos), titular (solo letras, mínimo nombre y apellido), vencimiento MM/AA y CVV. El titular no acepta números ni caracteres especiales.

7. **Checkout — Paso 3 + Confirmación** → `confirmar()` es async, simula 900ms de procesamiento, genera un número de orden aleatorio y llama a `clearCart()`. Aparece la `SuccessScreen` con el número de pedido."

> **Cierre de tu bloque:**
"Le dejo la posta a [integrante 3] que muestra el login y el historial de pedidos."

---

## 2. Conceptos Teóricos "Salvavidas"

### ¿Qué es el estado en React?

**Analogía:** El estado es la memoria a corto plazo de un componente. Como una pizarra: la podés borrar y reescribir, y cada vez que cambia, React redibuja el componente con la nueva info.

Sin `useState`, si modificás una variable local, React no se entera y no actualiza la pantalla. Con `useState`, React "escucha" el cambio y re-renderiza.

### ¿Por qué las actualizaciones de estado son asíncronas?

React no actualiza el DOM de inmediato cuando llamás a `setState`. Primero **agrupa** (batching) todos los cambios del mismo evento y los aplica juntos en una sola pasada. Esto es más eficiente. Por eso, si hacés `setCantidad(cantidad + 1)` y luego leés `cantidad`, todavía tiene el valor viejo dentro del mismo handler. La solución: usar la forma funcional `setCantidad(prev => prev + 1)`.

### ¿Por qué las listas necesitan `key` único?

**Qué pasa sin key (o con index):** React usa el `key` para identificar qué elemento cambió durante el diffing del Virtual DOM. Si usás el índice del array como key y eliminás un elemento, React "confunde" elementos entre sí → puede actualizar el componente equivocado → bugs visuales difíciles de reproducir.

**En nuestro carrito:** Usamos `key={line.lineId}` donde `lineId = 'p1001-M'` — identifica unívocamente producto + talle. Si el mismo producto con diferente talle existe, tienen keys distintos y React los trata como elementos independientes.

### ¿Cómo funcionan los inputs controlados?

Un input controlado en React es aquel donde el valor está **atado al estado**:
```jsx
// Controlado ✅ — React es la fuente de verdad
<input value={ship.nombre} onChange={(e) => setShip({...ship, nombre: e.target.value})} />

// No controlado ❌ — el DOM es la fuente de verdad
<input defaultValue="algo" />
```
Ventaja: podés validar, transformar o rechazar cualquier entrada **antes** de que el usuario la vea. En Cumbre usamos esto para:
- Rechazar letras en el campo "Código postal" (`v.replace(/\D/g, '')`)
- Rechazar números en "Ciudad" y "Provincia" (`v.replace(/[^a-zA-Z...]/g, '')`)
- Rechazar caracteres especiales en "Titular de tarjeta"
- Auto-espaciar el número de tarjeta con `fmtCard()`

### Validación en dos capas

Implementamos validación en dos niveles:
1. **Al tipear (filtros en onChange):** el campo físicamente no acepta caracteres inválidos. El usuario nunca puede escribir una letra en "Código postal".
2. **Al enviar (validateShip / validateCard):** verificamos reglas de negocio que no se pueden filtrar al tipear, como "la dirección debe tener al menos un número de calle" o "el titular debe tener mínimo dos palabras".

---

## 3. Auditoría de Código — Hooks y Eventos Reales

### CartContext.jsx — El corazón del carrito

| Elemento | Para qué sirve |
|---|---|
| `useReducer(cartReducer, initialState)` | Maneja el estado mutable del carrito con acciones tipadas |
| `loadSaved()` | Lee `localStorage` al iniciar la app para rehidratar el carrito persistido |
| `useEffect([state])` con `useRef` | Sincroniza el estado del carrito a `localStorage` en cada cambio; el `useRef` evita escribir en el mount inicial |
| `computeTotals(items, coupon)` | Función pura: calcula subtotal, descuento y total sin tocar el estado |
| `action 'ADD'` — lineId `p${id}-${talle}` | Clave única que evita duplicar líneas del mismo producto+talle |
| `action 'UPDATE_QTY'` | Si qty ≤ 0, elimina la línea automáticamente |
| `action 'APPLY_COUPON'` | Valida contra `ALL_COUPONS` — si no existe, setea `couponError` |

### Carrito.jsx

| Hook / Función | Para qué sirve |
|---|---|
| `useCart()` | Extrae `items`, `coupon`, `couponError`, `totals`, `updateQty`, `removeFromCart`, `applyCoupon`, `clearCart` |
| `useAuth()` | Extrae `isLoggedIn` y `setReturnTo` |
| `useState(coupon?.code \|\| '')` | Estado local del input del cupón |
| `handleCheckout()` | Si no está logueado → guarda `returnTo='checkout'` y redirige al login; si está logueado → va al checkout directo |
| `key={line.lineId}` | Key único por línea del carrito (producto + talle) |
| `"Continuar comprando" onClick` | Lee `sessionStorage.catalogoReturnFilters`, lo mueve a `catalogoState` y navega a `/catalogo` con filtros restaurados |

### Checkout.jsx

| Hook / Función | Para qué sirve |
|---|---|
| `useState(1)` — `step` | Controla en qué paso del stepper estamos (1, 2 o 3) |
| `useState({nombre:'', ...})` — `ship` | Estado del formulario de envío como objeto |
| `useState({})` — `shipErrors` | Errores de validación del formulario de envío |
| `useState('card')` — `payMethod` | Método de pago seleccionado |
| `useState({numero:'', ...})` — `card` | Datos de la tarjeta |
| `sF(field, filter)` | Higher-order function: crea un onChange con transformación opcional del valor |
| `validateShip(s)` | Valida: dirección alfanumérica, ciudad/provincia solo letras, CP solo dígitos, teléfono ≥8 dígitos |
| `validateCard(c)` | Valida: número (16 dígitos), titular (solo letras, ≥2 palabras), formato MM/AA, CVV |
| `goStep2()` | Valida paso 1 → si ok, avanza al paso 2 y scroll top |
| `confirmar()` — async | Simula procesamiento, genera número de orden, llama `clearCart()` |

---

## 4. Defensa de la Arquitectura

### ¿Por qué no hay un `CheckoutForm.jsx` separado?

El checkout tiene **estado altamente acoplado** entre los tres pasos — `step`, `ship`, `card`, `payMethod`, `shipErrors`, `cardErrors`, `processing` y `orderNumber` son interdependientes. Separarlos en componentes hijos sin un Context dedicado requeriría prop-drilling de toda esa lógica hacia arriba, lo que resulta más complejo que tenerlo en un único componente orquestador.

Lo que sí modularizamos son las sub-vistas stateless:
- `Stepper` — solo recibe `step` como prop
- `OrderSummary` — recibe `items`, `totals` y `coupon`
- `Section`, `TInput`, `Label` — átomos de formulario
- `SuccessScreen` — pantalla de confirmación completamente separada

### Patrón Reducer en el carrito — por qué no `useState` simple

Con `useState` el carrito podría ser un array. Pero tenemos lógica compleja:
- Merge de líneas duplicadas (mismo producto + mismo talle)
- Validación del cupón contra un diccionario
- Eliminación automática cuando qty = 0

`useReducer` centraliza toda esa lógica en `cartReducer` — un único lugar testeable, con acciones nombradas (`'ADD'`, `'UPDATE_QTY'`, `'APPLY_COUPON'`). Cualquier developer puede leer el reducer y entender qué puede pasar con el carrito sin rastrear `setState` dispersos.

### ¿Por qué la persistencia del carrito usa `localStorage` pero los filtros del catálogo usan `sessionStorage`?

El carrito debe sobrevivir al cierre del tab y al reinicio del navegador — el usuario espera que si agregó productos ayer, los vea hoy. Eso es `localStorage`.

Los filtros del catálogo son estado de navegación efímero — solo importan mientras el usuario navega entre catálogo, detalle y carrito en la misma sesión. Si el usuario abre el sitio en un nuevo tab, es razonable que los filtros comiencen limpios. Eso es `sessionStorage`.
