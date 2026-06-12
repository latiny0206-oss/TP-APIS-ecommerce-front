# Integrante 2 — Flujo de Conversión (Carrito y Checkout)
**Pantallas clave:** Carrito · Checkout (3 pasos) · Pantalla de Confirmación  
**Tiempo de exposición:** 3 minutos 45 segundos

---

## 1. Guión de Exposición (Speech)

> **Retomás la posta del integrante 1:**

"Gracias [integrante 1]. Ahora que el usuario encontró su producto y lo agregó al carrito, yo me encargo de lo más importante del negocio: la **conversión de la compra**.

**Demo en vivo — guía paso a paso:**

1. **Agregar al carrito** → Desde `ProductoDetalle.jsx`, el botón 'Agregar al carrito' llama a `addToCart()` del `CartContext`. El `cartReducer` procesa el action `'ADD'` y genera un `lineId` único: `'p1001-M'`. Si el mismo producto con el mismo talle ya existe, suma la cantidad — sin duplicar líneas.

2. **Ver el Carrito** → `Carrito.jsx`. Mostramos las líneas del carrito iteradas con `items.map()` — cada una tiene `key={line.lineId}` (clave única). Cambiamos la cantidad con los botones `+` y `−` que llaman a `updateQty({ lineId, qty })`. Si la cantidad llega a 0, el reducer elimina la línea automáticamente.

3. **Cupón de descuento** → Escribimos `INVIERNO24` y presionamos 'Aplicar'. El reducer valida contra `ALL_COUPONS` y si existe actualiza `state.coupon`. Los totales se recalculan en tiempo real con `computeTotals()` — es una función pura, sin efectos secundarios.

4. **Checkout — Paso 1 (Envío)** → Formulario controlado en `Checkout.jsx`. Cada campo tiene su propio `onChange` que actualiza el objeto `ship` con el spread operator. `validateShip()` verifica los campos antes de avanzar al paso 2.

5. **Checkout — Paso 2 (Pago)** → Tres métodos de pago. Si elegís tarjeta, `validateCard()` valida número (16 dígitos), titular, vencimiento MM/AA y CVV. El número se formatea automáticamente con `fmtCard()` para agregar los espacios.

6. **Checkout — Paso 3 + Confirmación** → `confirmar()` es async, simula 900ms de procesamiento, genera un número de orden aleatorio y llama a `clearCart()`. Aparece la `SuccessScreen` con el número de pedido."

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

**Qué pasa sin key (o con index):** React usa el `key` para identificar qué elemento cambió durante el diffing del Virtual DOM. Si usás el índice del array como key y reordenás o eliminás un elemento, React "confunde" elementos entre sí → puede actualizar el componente equivocado → bugs visuales difíciles de reproducir.

**En nuestro carrito:** Usamos `key={line.lineId}` donde `lineId = 'p1001-M'` — identifica unívocamente producto + talle. Si el mismo producto con diferente talle existe, tienen keys distintos y React los trata como elementos independientes.

### ¿Cómo funcionan los inputs controlados?

Un input controlado en React es aquel donde el valor está **atado al estado**:
```jsx
// Controlado ✅ — React es la fuente de verdad
<input value={ship.nombre} onChange={(e) => setShip({...ship, nombre: e.target.value})} />

// No controlado ❌ — el DOM es la fuente de verdad
<input defaultValue="algo" />
```
Ventaja: podés validar, transformar o rechazar cualquier entrada antes de que el usuario la vea (ej: `fmtCard` que auto-espacía el número de tarjeta).

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
| `onClick={() => updateQty({ lineId, qty: line.qty - 1 })}` | Resta cantidad; si llega a 0, el reducer elimina la línea |

### Checkout.jsx

| Hook / Función | Línea aprox. | Para qué sirve |
|---|---|---|
| `useState(1)` — `step` | L156 | Controla en qué paso del stepper estamos (1, 2 o 3) |
| `useState({nombre:'', ...})` — `ship` | L159 | Estado del formulario de envío como objeto |
| `useState({})` — `shipErrors` | L163 | Errores de validación del formulario de envío |
| `useState('card')` — `payMethod` | L165 | Método de pago seleccionado |
| `useState({numero:'', ...})` — `card` | L166 | Datos de la tarjeta |
| `useState(false)` — `processing` | L168 | Muestra spinner mientras simula el procesamiento |
| `sF(field, filter)` | L170 | Higher-order function: crea un onChange para cada campo de `ship` con transformación opcional |
| `validateShip(s)` | L65 | Valida campos de envío, retorna objeto de errores vacío si todo está ok |
| `validateCard(c)` | L76 | Valida número (regex 16 dígitos), titular, formato MM/AA y CVV |
| `goStep2()` | L175 | Valida paso 1 → si ok, avanza al paso 2 y hace scroll top |
| `goStep3()` | L183 | Valida paso 2 → si ok, avanza al paso 3 |
| `confirmar()` — async | L193 | Simula procesamiento, genera número de orden, llama `clearCart()` |
| `fmtCard(v)` | L62 | Transforma la entrada del número de tarjeta: solo dígitos, máx 16, agrupados de a 4 |
| `fmtExp(v)` | L63 | Formatea automáticamente el vencimiento como MM/AA |

---

## 4. Defensa de la Arquitectura

### Separación de responsabilidades en el checkout

**Pregunta posible del profesor:** "¿Por qué no tienen un componente `CheckoutForm.jsx` separado?"

**Respuesta:** El checkout tiene **estado altamente acoplado** entre los tres pasos — `step`, `ship`, `card`, `payMethod`, `shipErrors`, `cardErrors`, `processing` y `orderNumber` son interdependientes. Si los separás en componentes hijos sin un sistema de estado global dedicado, tenés que "prop drill" todo hacia arriba, lo que resulta más complejo que tenerlo en un solo componente orquestador.

Lo que sí modularizamos son las sub-vistas stateless:
- `Stepper` — solo recibe `step` como prop, renderiza el indicador visual
- `OrderSummary` — recibe `items`, `totals` y `coupon`, renderiza el aside derecho
- `Section` — wrapper visual de cada paso (eyebrow + título + children)
- `TInput` y `Label` — átomos de formulario reutilizables dentro del checkout
- `SuccessScreen` — pantalla de confirmación completamente separada

**Pregunta trampa:** "¿Qué pasa si el usuario recarga la página en el paso 2 del checkout?"

**Respuesta:** Pierde el estado del formulario — es intencional. El carrito se rehidrata desde `localStorage` (sí persiste), pero los datos del formulario de envío son efímeros. En un e-commerce real implementaríamos persistencia de sesión en el servidor o al menos en `sessionStorage`.

### Patrón Reducer en el carrito — por qué no `useState` simple

Con `useState` el carrito podría ser un array. Pero tenemos lógica compleja:
- Merge de líneas duplicadas
- Validación del cupón
- Eliminación automática cuando qty = 0

`useReducer` centraliza toda esa lógica en `cartReducer` — un lugar único y testeable, con acciones con nombres claros (`'ADD'`, `'UPDATE_QTY'`, `'APPLY_COUPON'`). Cualquier desarrollador puede leer el reducer y entender qué puede pasar con el carrito sin tener que rastrear `setState` dispersos por el componente.
