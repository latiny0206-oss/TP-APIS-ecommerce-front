# Integrante 3 — Flujo de Cuenta y Autenticación
**Pantallas clave:** Login (`/login`) · Mis Pedidos (`/cuenta/ordenes`) · Detalle de pedido (`/cuenta/ordenes/:id`)
**Tiempo de exposición:** 3 minutos 45 segundos

---

## 1. Pantallas y rutas asignadas

| Pantalla          | Ruta                            |
|-------------------|---------------------------------|
| Login             | `/login`                        |
| Lista de pedidos  | `/cuenta/ordenes`               |
| Detalle de pedido | `/cuenta/ordenes/ORD-10234`     |

---

## 2. Demo en vivo — guía paso a paso

1. **Ruta protegida** → Intentar ir a `/cuenta/ordenes` sin estar logueado. `AccountGuard` en `App.jsx` detecta `!isLoggedIn` → guarda la ruta en `setReturnTo('/cuenta/ordenes')` → redirige a `/login`. Mostrar en la barra de URL que efectivamente termina en `/login`.

2. **Login** → En `Login.jsx`, ingresar credenciales incorrectas. El `authReducer` procesa `'FAILURE'` y `state.error` aparece en pantalla. Empezar a tipear: el `useEffect` que observa `[email, password]` llama a `clearError()` automáticamente — el mensaje de error desaparece.

3. **Login exitoso (cliente)** → Credenciales: `usuario@test.com` / `123456`. `login()` es async, simula 600ms de delay. El `authReducer` procesa `'SUCCESS'` con `safeUser` (sin `password`). Como `rol !== 'admin'`, navega al `returnTo` guardado: `/cuenta/ordenes`.

4. **Mis Pedidos (`/cuenta/ordenes`)** → `Perfil.jsx`. Mostrar la lista de pedidos filtrados por `userId === user.id`. Cada pedido tiene estado, fecha, ítems, total y un link "Ver detalle →" que navega a `/cuenta/ordenes/ORD-10234`.

5. **Detalle de pedido** → `CuentaOrdenDetalle.jsx`. Lee el ID de la URL con `useParams()`: el parámetro es `ORD-10234` (sin `#`). El componente reconstruye el ID completo `#${id}` para buscar en `MOCK_PEDIDOS`. Verifica además que `pedido.userId === user?.id` — un usuario no puede ver pedidos de otro.

6. **Cierre de sesión** → El botón 'Cerrar sesión' en `Perfil.jsx` llama `logout()` (despacha `'LOGOUT'`, resetea el state a `initialState`) y `navigate('/')`. El Navbar vuelve a mostrar los botones de login/registro.

7. **Cierre del bloque:**
> "Le dejo la posta a [integrante 4] que cierra con el panel de administración."

---

## 3. Archivos y componentes clave

| Archivo | Rol |
|---|---|
| `src/App.jsx` | Define `AccountGuard` y `AdminGuard` como layout routes de protección |
| `src/context/AuthContext.jsx` | `useReducer` con estados idle/loading/success/error + `returnTo` |
| `src/views/Login.jsx` | Formulario controlado con manejo de error reactivo |
| `src/views/Perfil.jsx` | Lista de pedidos del usuario logueado con links al detalle |
| `src/views/CuentaOrdenDetalle.jsx` | Detalle de un pedido identificado por `useParams().id` |

---

## 4. Tema técnico: Auth global con `useReducer`, navegación con route params, protección de rutas

### `AuthContext.jsx` — máquina de estados con `useReducer`

El auth tiene cuatro estados posibles: `idle`, `loading`, `success`, `error`. Con `useReducer`, las transiciones son atómicas:

```js
function authReducer(state, action) {
  switch (action.type) {
    case 'LOADING':  return { ...state, status: 'loading', error: null }
    case 'SUCCESS':  return { ...state, user: action.payload, isLoggedIn: true, status: 'idle', error: null }
    case 'FAILURE':  return { ...state, status: 'error', error: action.payload }
    case 'LOGOUT':   return { ...initialState }  // reseteo completo
    case 'SET_RETURN_TO': return { ...state, returnTo: action.payload }
    default: return state
  }
}
```

Con `useState` habría que coordinar `setUser`, `setIsLoggedIn`, `setStatus`, `setError` en cada acción — con riesgo de renders intermedios con estado inconsistente.

### Flujo de login con `returnTo`

```jsx
// 1. AccountGuard — guarda la ruta intentada y redirige al login
function AccountGuard() {
  const { isLoggedIn, setReturnTo } = useAuth()
  const location = useLocation()
  if (!isLoggedIn) {
    setReturnTo(location.pathname)      // guarda '/cuenta/ordenes'
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}

// 2. AuthContext — después del login exitoso
navigate(safeUser.rol === 'admin'
  ? '/admin/dashboard'
  : (state.returnTo || '/'))   // vuelve a '/cuenta/ordenes'
```

### Protección de rutas con layouts — `AccountGuard` y `AdminGuard`

```jsx
// En App.jsx:
<Route element={<ShellLayout />}>
  {/* Rutas protegidas — AccountGuard renderiza Outlet solo si isLoggedIn */}
  <Route element={<AccountGuard />}>
    <Route path="/cuenta/ordenes"     element={<Perfil />} />
    <Route path="/cuenta/ordenes/:id" element={<CuentaOrdenDetalle />} />
  </Route>
</Route>

<Route path="/admin" element={<AdminGuard />}>
  {/* AdminGuard verifica isLoggedIn && user.rol === 'admin' */}
</Route>
```

No se usa React Router Guards (no existen en v6+). La protección se implementa con componentes que condicionalmente renderizan `<Outlet />` o `<Navigate>`.

### `useParams()` para el detalle de pedido

La ruta es `/cuenta/ordenes/:id`. En la URL el ID no lleva `#` (no es válido en URLs sin codificar). `CuentaOrdenDetalle.jsx` lo reconstruye:

```jsx
// La URL es /cuenta/ordenes/ORD-10234
const { id } = useParams()   // id = 'ORD-10234'
const pedido = MOCK_PEDIDOS.find((p) => p.id === `#${id}`)  // '#ORD-10234'
```

Además verifica ownership:
```jsx
if (!pedido || pedido.userId !== user?.id) {
  return <NotFoundState />
}
```

### Filtrado de pedidos por usuario

En `Perfil.jsx`:
```jsx
const pedidos = MOCK_PEDIDOS.filter((p) => p.userId === user.id)
```

Cada usuario solo ve sus propios pedidos. El `user.id` viene del `AuthContext` — nunca se pasa como prop ni se lee de localStorage directamente en la vista.

### Limpieza de error de login con `useEffect`

```jsx
// En Login.jsx — el error desaparece al empezar a tipear
useEffect(() => {
  if (error) clearError()
}, [email, password]) // eslint-disable-line
```

Cuando el usuario modifica cualquiera de los dos campos, el efecto corre y limpia el mensaje de error. Es UX defensiva: no querés que un mensaje de error persista mientras el usuario ya está corrigiendo sus datos.

### Password nunca se almacena en el Context

```jsx
const { password: _, ...safeUser } = user
dispatch({ type: 'SUCCESS', payload: safeUser })
```

La desestructuración con renaming `password: _` extrae y descarta el campo `password`. Solo `safeUser` (sin la contraseña) entra al estado global.

---

## 5. Preguntas probables del examen

**P: ¿Por qué `useReducer` en `AuthContext` y no `useState`?**
R: El auth tiene múltiples estados relacionados que deben cambiar en sincronía. Con `useReducer`, la acción `'SUCCESS'` actualiza `user`, `isLoggedIn`, `status` y `error` en una sola operación atómica. Con `useState` habría que llamar a cuatro setters, con riesgo de renders intermedios con estado inconsistente (ej: `isLoggedIn = true` pero `user = null` por un render de 16ms).

**P: ¿Cómo funciona la protección de rutas sin React Router Guards?**
R: Se usan componentes que renderizan `<Outlet />` o `<Navigate>`. `AccountGuard` comprueba `isLoggedIn` del Context. Si es false, guarda la ruta intentada en `setReturnTo(location.pathname)` y redirige a `/login`. Si es true, renderiza `<Outlet />` — lo que permite que las rutas hijas (`/cuenta/ordenes`, `/cuenta/ordenes/:id`) se monten normalmente.

**P: ¿Por qué `navigate('/', { replace: true })` en el logout y no `navigate('/')`?**
R: `replace: true` reemplaza la entrada actual del historial. Si se usara `navigate('/')` sin replace, el usuario podría presionar "Atrás" desde el home y volver a una página protegida que ya debería ser inaccesible (aunque `AccountGuard` lo detectaría igual, el `replace` evita esa entrada del historial).

**P: ¿Qué pasa si un usuario intenta acceder a `/cuenta/ordenes/ORD-10298` siendo el pedido de otro usuario?**
R: `CuentaOrdenDetalle.jsx` verifica `pedido.userId !== user?.id`. Si el pedido existe pero pertenece a otro usuario, renderiza el estado de "Pedido no encontrado" — igual que si el ID no existiera. No se expone información de otros usuarios.

**P: ¿Por qué se filtra `MOCK_PEDIDOS` por `userId` en la vista y no en el Context?**
R: `MOCK_PEDIDOS` es una fuente de datos compartida (simula una API). El filtrado por usuario es responsabilidad de la vista que necesita los datos. Si se filtrara en el Context, habría que crear un selector específico y exponer otro valor en el Provider. La vista tiene todo lo necesario: sabe quién es `user` (del Auth) y tiene acceso a `MOCK_PEDIDOS` directamente.

**P: ¿Qué es el `returnTo` y en qué casos se usa?**
R: Es una ruta guardada en `AuthContext` que indica a dónde debe navegar el usuario después de loguearse. Se usa cuando una ruta protegida redirige al login: antes de redirigir, `AccountGuard` guarda `location.pathname` en `setReturnTo`. Después del login exitoso, `AuthContext.login()` navega a `state.returnTo` (o `/` si no hay ninguno guardado). Sin este mecanismo, el usuario siempre terminaría en `/` después de loguearse, perdiendo su destino original.
