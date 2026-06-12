# Integrante 3 — Flujo de Cuenta y Autenticación
**Pantallas clave:** Login · Registro · Perfil (historial de pedidos)  
**Tiempo de exposición:** 3 minutos 45 segundos

---

## 1. Guión de Exposición (Speech)

> **Retomás del integrante 2:**

"Perfecto, la compra fue exitosa. Ahora yo me encargo de lo que pasa **antes** de ese checkout: la autenticación. Y también del historial de pedidos que el usuario puede consultar después.

**Demo en vivo — guía paso a paso:**

1. **Ruta protegida** → Si intentamos ir al checkout sin estar logueados, `handleCheckout()` en `Carrito.jsx` llama a `setReturnTo('checkout')` y redirige al login. Este es nuestro sistema de **protección de rutas** — sin React Router Guards, hecho con lógica de Context.

2. **Login** → En `Login.jsx` mostramos el formulario controlado con `useState` para email y contraseña. Al hacer submit se llama `login(email, password, navigate)` que vive en `AuthContext.jsx`. Es una función `async` que simula 600ms de delay (como si fuera una llamada a API real) y luego busca el usuario en `MOCK_USERS`. Si el rol es `'admin'`, navega al `admin-dashboard`. Si es cliente, navega al `returnTo` guardado — en este caso, vuelve al checkout automáticamente.

3. **Manejo de errores de login** → Si las credenciales no coinciden, `authReducer` procesa el action `'FAILURE'` y setea `state.error`. El `useEffect` en `Login.jsx` observa los campos `[email, password]` — si el usuario empieza a tipear de nuevo, llama a `clearError()` automáticamente para limpiar el mensaje de error. Esto es UX consciente.

4. **Perfil y pedidos** → `Perfil.jsx` tiene un `useEffect` que verifica `isLoggedIn`. Si es false, redirige al login. Si está logueado, filtra `MOCK_PEDIDOS` por `userId === user.id`. Mostramos el historial de 5 pedidos de Ana García: 2 entregados anteriores + los 3 nuevos que agregamos (Pendiente, Confirmado, Entregado)."

> **Cierre de tu bloque:**
"Le dejo la posta a [integrante 4] que cierra con el panel de administración."

---

## 2. Conceptos Teóricos "Salvavidas"

### Estado global vs estado local — Context API vs Props

| | Estado Local (`useState`) | Estado Global (`useContext`) |
|---|---|---|
| **Cuándo usarlo** | Un solo componente lo necesita | Múltiples componentes lo necesitan |
| **Ejemplo en el proyecto** | `email` y `password` en el form de Login | `user`, `isLoggedIn` en toda la app |
| **Cómo viaja** | Props de padre a hijo | Context directamente al consumidor |

**Analogía:** El estado local es tu billetera — solo la usás vos. El Context es el saldo de la cuenta bancaria — cualquiera con acceso (cualquier componente dentro del Provider) puede consultarlo.

En nuestro proyecto:
- `AuthContext` → estado global: cualquier componente sabe si hay alguien logueado
- `CartContext` → estado global: el badge del carrito en el Navbar y el Checkout leen el mismo estado
- `useState` en `Login.jsx` → estado local: solo ese formulario necesita saber qué escribiste

### Parámetros dinámicos — cómo viaja el ID de un producto

En React Router clásico usarías `/orders/:id` y `useParams()`. Nosotros implementamos el mismo concepto con nuestro router propio:

```jsx
// Al navegar:
navigate({ view: 'producto', params: { id: 1001 } })

// En NavigationContext, el reducer guarda:
state.params = { id: 1001 }

// En ProductoDetalle:
const { params } = useNavigation()
const producto = getProductoById(params.id)
```

El flujo es idéntico conceptualmente a `useParams()` — extraemos el identificador del estado de navegación y usamos ese ID para buscar el recurso correspondiente.

### Seguridad de sesión frontend — qué hacemos y qué no

**Lo que hacemos:**
- El password nunca se guarda en el estado: `const { password: _, ...safeUser } = user` → se destruye antes de hacer dispatch
- El estado de auth vive solo en memoria (React state) — si el usuario recarga, pierde la sesión (comportamiento intencional para un mock)

**Lo que haríamos en producción:**
- El servidor enviaría un JWT (JSON Web Token)
- Lo guardaríamos en `httpOnly cookie` (no en localStorage — riesgo XSS)
- Cada request al backend llevaría ese token en el header `Authorization: Bearer <token>`
- El frontend solo guardaría datos no sensibles del usuario (nombre, email, rol)

### `useReducer` en AuthContext — por qué no `useState` simple

El auth tiene múltiples estados posibles: `idle` → `loading` → `success` o `error`. Con `useState` tendríamos tres variables separadas (`isLoading`, `error`, `user`) y tendríamos que actualizarlas en sincronía. `useReducer` con `authReducer` garantiza que los transitions sean atómicos:

```js
case 'LOADING': return { ...state, status: 'loading', error: null }
case 'SUCCESS': return { ...state, user: action.payload, isLoggedIn: true, status: 'idle' }
case 'FAILURE': return { ...state, status: 'error', error: action.payload }
```
Nunca puede haber un estado inconsistente como `{ isLoading: false, error: null, user: null }` cuando debería haber un error.

---

## 3. Auditoría de Código — Hooks y Eventos Reales

### AuthContext.jsx

| Elemento | Para qué sirve |
|---|---|
| `useReducer(authReducer, initialState)` | Maneja los estados del auth: idle, loading, success, error |
| `login(email, password, navigate)` — async | Simula llamada API (600ms), busca en MOCK_USERS, hace dispatch según resultado |
| `register({ nombre, email, password }, navigate)` | Verifica email duplicado, hace dispatch SUCCESS, navega al home |
| `dispatch({ type: 'SUCCESS', payload: safeUser })` | `safeUser` = usuario sin el campo password (destruido con destructuring) |
| `dispatch({ type: 'SET_RETURN_TO', payload: view })` | Guarda la vista a la que volver tras el login |
| `logout()` | Resetea el estado completo al `initialState` |
| `clearError()` | Limpia el error sin modificar el resto del estado |

### Login.jsx

| Hook / Función | Línea aprox. | Para qué sirve |
|---|---|---|
| `useState('')` — `email` | L12 | Estado controlado del campo email |
| `useState('')` — `password` | L13 | Estado controlado del campo contraseña |
| `useState(false)` — `showPwd` | L14 | Toggle para mostrar/ocultar la contraseña |
| `useAuth()` | L9 | Extrae `login`, `status`, `error`, `clearError` del AuthContext |
| `useNavigation()` | L8 | Extrae `navigate` para redirigir tras login exitoso |
| `useEffect(() => clearError(), [email, password])` | L15 | Limpia el mensaje de error en cuanto el usuario empieza a corregir sus credenciales |
| `handleSubmit(e)` | L19 | `e.preventDefault()` evita el reload de página; llama a `login()` |
| `onChange={(e) => setEmail(e.target.value)}` | L61 | Input controlado — React es la fuente de verdad |

### Perfil.jsx

| Hook / Función | Para qué sirve |
|---|---|
| `useAuth()` | Extrae `user`, `isLoggedIn`, `logout` |
| `useNavigation()` | Para `navigate` en el redirect y en los botones |
| `useEffect(() => { if (!isLoggedIn) navigate('login') }, [isLoggedIn])` | Protección de ruta: si el usuario cierra sesión desde otro lado, redirige automáticamente |
| `MOCK_PEDIDOS.filter(p => p.userId === user.id)` | Filtra los pedidos del usuario logueado (sin fetch real — datos en memoria) |
| `ESTADO_STYLE[pedido.estado]` | Lookup object para aplicar estilos condicionales al badge de estado |
| `key={pedido.id}` | ID único del pedido — React lo usa para el diffing de la lista |
| `key={i}` en items del pedido | Los ítems de un pedido nunca se reordenan, usar index es aceptable aquí |
| `handleLogout()` | Llama `logout()` del context y navega al home |

---

## 4. Defensa de la Arquitectura

### Separación entre autenticación y visualización de cuenta

**Pregunta posible del profesor:** "¿Por qué `Login.jsx` y `Perfil.jsx` son archivos separados si ambos manejan 'la cuenta del usuario'?"

**Respuesta:** Porque tienen responsabilidades completamente distintas:
- `Login.jsx` es un **formulario de entrada sin estado previo** — el usuario no está autenticado, no hay nada que mostrar excepto el form
- `Perfil.jsx` es una **vista autenticada** — requiere `user` y filtra datos del backend (mock)

Mezclarlos en un solo componente crearía un renderizado condicional enorme y dificultaría el mantenimiento. La separación también permite lazy loading independiente — `Login.jsx` se carga solo cuando se necesita.

**Pregunta trampa:** "¿Cómo protejen rutas privadas sin React Router?"

**Respuesta:** Con un `useEffect` en el componente de la vista protegida:
```jsx
useEffect(() => {
  if (!isLoggedIn) navigate('login')
}, [isLoggedIn])
```
Y retornamos `null` si el usuario no está autenticado para no renderizar nada mientras redirige:
```jsx
if (!isLoggedIn || !user) return null
```

En `Carrito.jsx` la protección es diferente y más elegante: no bloqueamos la vista del carrito (cualquiera puede ver su carrito), sino que interceptamos el intento de ir al checkout:
```jsx
const handleCheckout = () => {
  if (!isLoggedIn) {
    setReturnTo('checkout') // ← guarda a dónde volver
    navigate('login')
    return
  }
  navigate('checkout')
}
```
Esto es un patrón de **redirect con returnTo** — el usuario no pierde su intención original tras iniciar sesión.

### Por qué los pedidos están en `mocks/data.js` y no en un contexto

Los pedidos son datos de **solo lectura** para el cliente — el usuario solo los consulta, no los modifica desde su perfil. Crear un contexto para eso sería overkill. Los importamos directamente en `Perfil.jsx` y filtramos en el render. Si mañana hubiera un endpoint real, reemplazaríamos el import por un `fetch` dentro de un `useEffect`.
