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

3. **Manejo de errores de login** → Si las credenciales no coinciden, `authReducer` procesa el action `'FAILURE'` y setea `state.error`. El `useEffect` en `Login.jsx` observa `[email, password]` — si el usuario empieza a tipear de nuevo, llama a `clearError()` automáticamente para limpiar el mensaje de error. Esto es UX consciente.

4. **Perfil y pedidos** → `Perfil.jsx` tiene un `useEffect` que verifica `isLoggedIn`. Si es false, redirige al login. Si está logueado, filtra `MOCK_PEDIDOS` por `userId === user.id`. Mostramos el historial completo de pedidos del usuario con sus estados coloreados.

5. **Cierre de sesión** → El botón 'Salir' del navbar llama a `logout()` del `AuthContext`, que despacha el action `'LOGOUT'` y resetea el estado a `initialState` (sin usuario, sin token). Inmediatamente redirige al home. Si el usuario tenía un carrito, este persiste en `localStorage` independientemente del auth."

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

**Analogía:** El estado local es tu billetera — solo la usás vos. El Context es el saldo de la cuenta bancaria — cualquier componente dentro del Provider puede consultarlo directamente sin que nadie se lo tenga que pasar.

En nuestro proyecto:
- `AuthContext` → estado global: cualquier componente sabe si hay alguien logueado
- `CartContext` → estado global: el badge del carrito en el Navbar y el Checkout leen el mismo estado
- `useState` en `Login.jsx` → estado local: solo ese formulario necesita saber qué escribiste

### ¿Por qué `useReducer` en AuthContext?

El auth tiene múltiples estados posibles: `idle` → `loading` → `success` o `error`. Con `useState` tendríamos tres variables separadas (`isLoading`, `error`, `user`) que habría que actualizar en sincronía. `useReducer` con `authReducer` garantiza que las transiciones sean **atómicas**:

```js
case 'LOADING': return { ...state, status: 'loading', error: null }
case 'SUCCESS': return { ...state, user: action.payload, isLoggedIn: true, status: 'idle' }
case 'FAILURE': return { ...state, status: 'error', error: action.payload }
case 'LOGOUT':  return { ...initialState }
```
Nunca puede haber un estado inconsistente como `{ isLoading: false, error: null, user: null }` cuando debería haber un error visible. Cada `case` describe una transición completa y válida.

### Seguridad de sesión frontend — qué hacemos y qué no hacemos

**Lo que hacemos:**
- El password nunca se guarda en el estado: `const { password: _, ...safeUser } = user` → se destruye antes del dispatch
- El estado de auth vive solo en memoria (React state) — si el usuario recarga, pierde la sesión (intencional para un mock)
- `logout()` resetea el estado completo a `initialState` — ningún dato del usuario queda en memoria

**Lo que haríamos en producción:**
- El servidor enviaría un JWT (JSON Web Token) firmado
- Lo guardaríamos en `httpOnly cookie` (no en `localStorage` — riesgo de XSS)
- Cada request al backend llevaría ese token en el header `Authorization: Bearer <token>`
- El frontend solo guardaría datos no sensibles del usuario (nombre, email, rol)

### Parámetros dinámicos — cómo viaja el ID de un producto

En React Router clásico usarías `/producto/:id` y `useParams()`. Nosotros implementamos el mismo concepto con nuestro router propio:

```jsx
// Al navegar:
navigate({ view: 'producto', params: { id: 1001 } })

// En NavigationContext, el reducer guarda:
state.params = { id: 1001 }

// En ProductoDetalle:
const { params } = useNavigation()
const producto = getProductoById(params.id)
```

El flujo es conceptualmente idéntico a `useParams()` — extraemos el identificador del estado de navegación y lo usamos para buscar el recurso.

---

## 3. Auditoría de Código — Hooks y Eventos Reales

### AuthContext.jsx

| Elemento | Para qué sirve |
|---|---|
| `useReducer(authReducer, initialState)` | Maneja los estados del auth: idle, loading, success, error |
| `login(email, password, navigate)` — async | Simula llamada API (600ms), busca en MOCK_USERS, despacha según resultado |
| `register({ nombre, email, password }, navigate)` | Verifica email duplicado, despacha SUCCESS, navega al home |
| `const { password: _, ...safeUser } = user` | Destruye el password antes de guardarlo en el estado — nunca vive en memoria |
| `dispatch({ type: 'SET_RETURN_TO', payload: view })` | Guarda la vista a la que volver tras el login |
| `logout()` | Resetea el estado completo a initialState — limpia auth, error y returnTo |
| `clearError()` | Limpia solo el error sin modificar el resto del estado |

### Login.jsx

| Hook / Función | Para qué sirve |
|---|---|
| `useState('')` — `email` | Estado controlado del campo email |
| `useState('')` — `password` | Estado controlado del campo contraseña |
| `useState(false)` — `showPwd` | Toggle para mostrar/ocultar la contraseña |
| `useAuth()` | Extrae `login`, `status`, `error`, `clearError` del AuthContext |
| `useEffect(() => clearError(), [email, password])` | Limpia el error en cuanto el usuario empieza a corregir sus credenciales |
| `handleSubmit(e)` | `e.preventDefault()` evita el reload; llama a `login()` |

### Perfil.jsx

| Hook / Función | Para qué sirve |
|---|---|
| `useAuth()` | Extrae `user`, `isLoggedIn`, `logout` |
| `useEffect(() => { if (!isLoggedIn) navigate('login') }, [isLoggedIn])` | Protección de ruta: si el usuario cierra sesión desde cualquier componente, redirige automáticamente |
| `MOCK_PEDIDOS.filter(p => p.userId === user.id)` | Filtra los pedidos del usuario logueado |
| `ESTADO_STYLE[pedido.estado]` | Lookup object para estilos condicionales del badge de estado |
| `key={pedido.id}` | ID único del pedido — React lo usa para el diffing de la lista |

---

## 4. Defensa de la Arquitectura

### Separación Login.jsx / Perfil.jsx — dos pantallas de "cuenta"

**Pregunta posible del profesor:** "¿Por qué `Login.jsx` y `Perfil.jsx` son archivos separados si ambos manejan 'la cuenta del usuario'?"

**Respuesta:** Porque tienen responsabilidades completamente distintas:
- `Login.jsx` es un **formulario de entrada sin estado previo** — el usuario no está autenticado, no hay nada que mostrar excepto el form. Requiere `null` como estado inicial del user.
- `Perfil.jsx` es una **vista autenticada** — requiere `user` no-null y filtra datos del backend (mock).

Mezclarlos crearía un renderizado condicional enorme y dificultaría el mantenimiento. La separación también permite lazy loading independiente en `App.jsx`.

**Pregunta trampa:** "¿Cómo protegen rutas privadas sin React Router?"

**Respuesta:** Con un `useEffect` en el componente de la vista protegida:
```jsx
useEffect(() => {
  if (!isLoggedIn) navigate('login')
}, [isLoggedIn])
```
Y retornamos `null` si el usuario no está autenticado para no renderizar nada mientras redirige.

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
Es el patrón **redirect con returnTo** — el usuario no pierde su intención original tras autenticarse.

### ¿Por qué los pedidos están en `mocks/data.js` y no en un Context?

Los pedidos son datos de **solo lectura** para el cliente — el usuario los consulta, no los modifica desde su perfil. Crear un Context para eso sería sobrediseño. Los importamos directamente en `Perfil.jsx` y filtramos en el render. Si hubiera un endpoint real, reemplazaríamos el import por un `fetch` dentro de un `useEffect`.
