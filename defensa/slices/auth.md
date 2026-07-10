# Slice `auth` — sesión de usuario

Archivo: `Front/src/store/authSlice.js` · Registrado como `auth` en `store/index.js`

## Qué gestiona

La sesión del usuario en la UI: quién está logueado, si el login/registro está en curso o falló, y a dónde volver después de loguearse. **El token JWT NO vive acá** (ver puntos finos — es LA pregunta trampa de este slice).

## Estado inicial

```js
initialState: {
  user:         null,    // { id, username, nombre, email, rol } o null
  isLoggedIn:   false,   // boolean derivado — lo usan los guards y la Navbar
  status:       'idle',  // 'idle' | 'loading' | 'error' | 'registered'
  error:        null,    // string con el mensaje de error del backend, o null
  returnTo:     '/',     // ruta a la que volver después del login
  initializing: true,    // true hasta que AuthInit decide si hay sesión guardada
}
```

| Campo | Quién lo modifica |
|---|---|
| `user` / `isLoggedIn` | `loginThunk.fulfilled`, `registerThunk.fulfilled`, `sessionRestored`, `logout` (que se despacha desde `logoutThunk` o directo por auto-logout 401) |
| `status` | pending → `'loading'`; login OK → `'idle'`; register OK → `'registered'`; rejected → `'error'`; `clearError` → `'idle'` |
| `error` | rejected de ambos thunks (con `action.error.message`); lo limpian `clearError`, pending, fulfilled y `logout` |
| `returnTo` | `setReturnTo` (Carrito y AccountGuard); `logout` lo resetea a `'/'` |
| `initializing` | Empieza `true`; lo bajan `sessionRestored`, `initDone`, `logout` y `loginThunk.fulfilled` |

Los valores de `status` son **nuestros**, no los canónicos de los docs (`succeeded/failed` no existen acá): el éxito del login se modela con `user` poblado + status de vuelta en `'idle'`, y `'registered'` es un estado especial para la pantalla de bienvenida del registro.

## Reducers síncronos

| Reducer | Qué hace | Quién lo despacha |
|---|---|---|
| `sessionRestored` | Carga `user` desde localStorage, `isLoggedIn = true`, apaga `initializing` | `App.jsx:57` (`AuthInit`, al montar la app, si hay token + user guardados) |
| `initDone` | Solo apaga `initializing` (no había sesión guardada) | `App.jsx:59` (`AuthInit`) |
| `logout` | Resetea todo el slice al estado deslogueado | Se despacha desde dos vías: (a) los botones de logout — `Navbar.jsx:71`, `Perfil.jsx:34`, `AdminLayout.jsx:98` — pasan por `logoutThunk` (ver más abajo), que como último paso hace `dispatch(logout())`; (b) `App.jsx:65` (`AuthInit`), que despacha `logout()` directo al recibir el evento `auth:logout` del interceptor por 401 |
| `clearError` | Limpia `error` y vuelve `status` a `'idle'` | `Login.jsx:22` y `Registro.jsx:42` — al tipear de nuevo, el error viejo desaparece |
| `setReturnTo` | Guarda la ruta pendiente | `Carrito.jsx:24` (quiso ir al checkout sin login) y `App.jsx:247` (`AccountGuard`) |

## Thunks

El patrón pending/fulfilled/rejected y por qué no hay try/catch está explicado en detalle en [carrito.md](./carrito.md#thunk-applycoupon--y-el-patrón-que-comparten-todos-los-thunks-del-proyecto) — acá solo lo específico.

### `loginThunk` (authSlice.js:7-20)

- **Endpoint**: `POST /api/auth/login` con `{ username, password }` (vía `authService.login`).
- **Respuesta**: `{ token, id, username, nombre, email, rol }`. Ojo al reparto: `authService.login` guarda `token` y `user` en **localStorage** (`tokenStorage.set` / `userStorage.set`, `authService.js:7-14`) y el thunk devuelve **solo los datos del usuario** — el token jamás entra al store.
- **Efecto colateral**: emite `CustomEvent('auth:login', { detail: { id } })`, que `CartUserCheck` usa para limpiar el carrito si cambió el usuario, y que `CartBackendSync` usa para recuperar el carrito guardado en el backend.
- **extraReducers**: pending → `status='loading'`, `error=null` · fulfilled → `user` poblado, `isLoggedIn=true`, `status='idle'`, `initializing=false` · rejected → `status='error'`, `error=action.error.message` (ej. "Usuario o contraseña incorrectos", que viene del `GlobalExceptionHandler` del backend como 401).

### `registerThunk` (authSlice.js:22-36)

- **Endpoint**: `POST /api/auth/register` con `{ username, email, password, nombre, apellido }`.
- Igual que login (también guarda token → **auto-login al registrarse**) pero su fulfilled setea `status = 'registered'`: `Registro.jsx` muestra la pantalla de éxito y un `setTimeout` de 2s navega al home (`Registro.jsx:29-33`).

### `logoutThunk` (authSlice.js:43-53)

- **No pega a un endpoint**: es un thunk de orquestación local que agrupa tres pasos en orden fijo:
  1. Si hay sesión activa y hay items en el carrito, hace `flushCart(items)` (**vuelca el carrito al backend con el token todavía válido**, `PUT /api/carritos/{id}/items`) — es best-effort: si el `PUT` falla, el logout ocurre igual. Ese volcado es lo que permite recuperar el carrito al re-loguearse en otro dispositivo (ver [carrito.md](./carrito.md#se-recuperan-los-productos-al-volver-a-iniciar-sesión)).
  2. `authService.logout()` — borra `cumbre_token`, `cumbre_user` y `cumbre_cart` de localStorage.
  3. `dispatch(logout())` — el reducer síncrono resetea el `authSlice`, y el `cartSlice` reacciona por extraReducer cross-slice vaciando `state.cart`.
- **Quién lo usa**: los tres botones de logout — `Navbar.jsx:71`, `Perfil.jsx:34`, `AdminLayout.jsx:98`. **No** lo usa el auto-logout por 401: en ese camino el token ya no vale para volcar, así que `AuthInit` (`App.jsx:65`) despacha `logout()` directo.
- **Sin extraReducers propios**: como no expone `pending`/`fulfilled` en el slice, el botón no muestra spinner — el logout se percibe instantáneo. El `flushCart` corre en el fondo antes de navegar al home.

## Dónde se usa

**useSelector:**
| Componente | Qué lee | Para qué |
|---|---|---|
| `App.jsx:240` (`AccountGuard`) | `isLoggedIn`, `initializing` | Proteger `/cuenta/*`; muestra loader mientras `initializing` |
| `App.jsx:257` (`AdminGuard`) | + `user` | Exigir `user.rol === 'ADMIN'` para `/admin/*` |
| `Navbar.jsx:41` | `isLoggedIn`, `user` | Menú usuario vs botón "Ingresar" |
| `Footer.jsx:7` | `isLoggedIn` | Links condicionales |
| `Login.jsx:11` | `status`, `error`, `isLoggedIn`, `returnTo` | Spinner, mensaje de error, redirect si ya está logueado, destino post-login |
| `Registro.jsx:26` | `status`, `error` | Pantalla `'registered'`, errores |
| `Perfil.jsx:26`, `AdminLayout.jsx:44` | `user` | Datos del usuario en pantalla |
| `Carrito.jsx:15` | `isLoggedIn` | Decidir si el checkout pasa antes por login |
| `Checkout.jsx:162` | `user` | Contexto de la compra |

**dispatch:** ver tabla de reducers; los thunks se despachan en `Login.jsx:27` (submit del form) y `Registro.jsx:65` (submit, después de la validación local del form).

## Flujo completo narrado: login con redirect al checkout

1. Usuario con carrito armado toca "Finalizar compra" en `/carrito` sin estar logueado. `Carrito.jsx:21-28` (`handleCheckout`): como `isLoggedIn` es false, despacha `setReturnTo('/checkout')` y navega a `/login`.
2. En `Login.jsx:27`, el submit despacha `loginThunk({ username, password })` → RTK emite `auth/login/pending` → `status='loading'` → el botón muestra "Ingresando…".
3. `authService.login` hace el POST; con 200, guarda token+user en localStorage y el thunk emite `auth:login` (por si cambió el usuario, `CartUserCheck` decide si limpiar el carrito).
4. `auth/login/fulfilled` → `user` poblado, `isLoggedIn=true`, `status` vuelve a `'idle'`.
5. `Login.jsx:28-31` chequea el resultado con `loginThunk.fulfilled.match(result)` y navega: ADMIN → `/admin/dashboard`; usuario común → `returnTo` (acá `/checkout`).
6. Con contraseña incorrecta: el backend responde 401, el interceptor lo **exceptúa** del logout automático (es un endpoint de auth, `api.js:30-31`), el thunk rechaza → `status='error'`, `error='Usuario o contraseña incorrectos'` → Login lo muestra. Al volver a tipear, `clearError` lo limpia.

```
Carrito ─setReturnTo('/checkout')─▶ /login ─loginThunk─▶ pending('loading')
   → POST /auth/login ─▶ token+user a localStorage, evento auth:login
   → fulfilled: user, isLoggedIn=true, 'idle' ─▶ navigate(returnTo)
   → rejected:  'error' + mensaje ─▶ <Login/> lo muestra
```

## Puntos finos y posibles preguntas trampa

- **"¿Dónde guardan el token?"** — En localStorage (`cumbre_token`), NO en Redux. El slice guarda la representación del usuario para la UI; el token lo inyecta el interceptor de request de axios en cada llamada (`api.js:14-18`). Ventaja: sobrevive al F5 sin serializar nada del store y ningún componente necesita leerlo.
- **"¿Cómo renuevan el token?"** — No se renueva: el JWT dura 24 h (`jwt.expiration=86400000` en el backend). Cuando vence, la primera llamada devuelve 401 → el interceptor de response borra localStorage y emite `auth:logout` → `AuthInit` (App.jsx:63-70) despacha `logout()` y navega a `/login`. Es un logout reactivo, no un refresh token.
- **¿Para qué existe `initializing`?** — Evita el parpadeo de los guards: al cargar la app, `AuthInit` todavía no restauró la sesión; sin ese flag, `AccountGuard` te patearía a `/login` aunque tengas sesión válida guardada. Mientras `initializing` es true muestran `PageLoader`.
- **Restauración de sesión sin thunk**: `sessionRestored` es un reducer síncrono porque los datos ya están en localStorage — no hay nada que fetchear. Si preguntan "¿validan el token al restaurar?": no contra el backend; si estaba vencido, el primer 401 dispara el logout automático.
- **Dos formas de consumir un thunk en el proyecto**: `Login.jsx` usa `loginThunk.fulfilled.match(result)` (type guard sobre la action resultante) y `Checkout.jsx` usa `.unwrap()` (promesa que rechaza). Conviene saber explicar ambas.
- **`status='registered'`** es una decisión nuestra: distingue "login normal" de "recién registrado" para mostrar la bienvenida. No es nomenclatura de RTK.
- **El logout tiene tres partes, orquestadas por `logoutThunk`** (`authSlice.js:43-53`): (1) `flushCart(items)` vuelca el carrito al backend con el token todavía válido — es lo que permite recuperarlo al re-loguearse en otro dispositivo; (2) `authService.logout()` limpia localStorage (token, user, carrito); (3) `dispatch(logout())` limpia el store, y el `cartSlice` reacciona por extraReducer vaciando su porción. Los tres botones de logout despachan `logoutThunk`, no `logout` directo. Si preguntan por qué no alcanza con (2) y (3): sin (1) el carrito que quedó en el navegador jamás llega al backend y en el próximo login desde otro dispositivo aparecería vacío. El auto-logout por 401 sí despacha `logout()` directo porque el token ya no vale para volcar.

## Resumen de 30 segundos

> "El slice `auth` guarda el usuario logueado, un `status` (`'idle'`, `'loading'`, `'error'` y `'registered'` tras un registro exitoso), el error y `returnTo` para volver a donde el usuario quería ir. Tiene dos thunks, `loginThunk` y `registerThunk`, que pegan a `/auth/login` y `/auth/register`; el token que devuelve el backend va a localStorage — no al store — y axios lo inyecta en cada request con un interceptor. Al montar la app, `AuthInit` restaura la sesión desde localStorage con el reducer síncrono `sessionRestored`, y un flag `initializing` evita que los guards redirijan antes de tiempo. Si un token vence, el interceptor detecta el 401 y dispara el logout automático."
