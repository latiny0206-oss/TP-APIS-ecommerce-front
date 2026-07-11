# Slice `auth` — sesión de usuario

Archivo: `Front/src/store/authSlice.js` · Registrado como `auth` en `store/index.js:10`

## Qué gestiona

La sesión del usuario en la UI: quién está logueado, si el login/registro está en curso o falló, y a dónde volver después de loguearse. **El token JWT NO vive acá** (ver puntos finos — es LA pregunta trampa de este slice).

Lo que **no** gestiona (pero suele confundirse):
- **El token JWT**: vive en `localStorage.cumbre_token`, lo inyecta el interceptor de request de axios (`api.js:14-18`).
- **Forgot/Reset password**: `ForgotPassword.jsx` y `ResetPassword.jsx` usan `useState` local — pegan directo a `authService.forgotPassword` / `authService.resetPassword` sin tocar Redux, porque no hay estado global que compartir (nadie más necesita saber si el email de recupero se envió).

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
| `user` / `isLoggedIn` | `loginThunk.fulfilled`, `registerThunk.fulfilled`, `sessionRestored`, `logout` (despachado por `logoutThunk` o por auto-logout 401) |
| `status` | pending → `'loading'`; login OK → `'idle'`; register OK → `'registered'`; rejected → `'error'`; `clearError` → `'idle'`; `sessionRestored` y `logout` → `'idle'` |
| `error` | rejected de ambos thunks (con `action.error.message`); lo limpian `clearError`, pending de cada thunk, ambos fulfilled, `sessionRestored` y `logout` |
| `returnTo` | `setReturnTo` (Carrito y AccountGuard); `logout` lo resetea a `'/'` |
| `initializing` | Empieza `true`; lo bajan `sessionRestored`, `initDone`, `logout`, `loginThunk.fulfilled` y `registerThunk.fulfilled` |

Los valores de `status` son **nuestros**, no los canónicos de los docs (`succeeded`/`failed` no existen acá): el éxito del login se modela con `user` poblado + status de vuelta en `'idle'`, y `'registered'` es un estado especial para la pantalla de bienvenida del registro.

### Diagrama de transiciones de `status`

```
                    clearError / sessionRestored / logout
                  ┌──────────────────────────────────────┐
                  │                                      │
                  ▼                                      │
                'idle' ─┬─ loginThunk.pending ────▶ 'loading' ─┬─ fulfilled ──▶ 'idle'
                        │                                     │
                        └─ registerThunk.pending ─▶ 'loading' ─┼─ fulfilled ──▶ 'registered'
                                                              │
                                                              └─ rejected ───▶ 'error' ─┐
                                                                                       │
                                                                          clearError ◀─┘
```

## Reducers síncronos

| Reducer | Qué hace | Quién lo despacha |
|---|---|---|
| `sessionRestored` | Carga `user` desde localStorage, `isLoggedIn = true`, `status = 'idle'`, limpia `error` y apaga `initializing` | `App.jsx:57` (`AuthInit`, al montar la app, si hay token + user guardados) |
| `initDone` | Solo apaga `initializing` (no había sesión guardada) | `App.jsx:59` (`AuthInit`) |
| `logout` | Resetea todo el slice al estado deslogueado (user=null, isLoggedIn=false, status='idle', error=null, returnTo='/', initializing=false) | Dos vías: (a) los botones de logout — `Navbar.jsx:71`, `Perfil.jsx:34`, `AdminLayout.jsx:98` — pasan por `logoutThunk`, que como último paso hace `dispatch(logout())`; (b) `App.jsx:65` (`AuthInit`), que despacha `logout()` directo al recibir el evento `auth:logout` del interceptor por 401 |
| `clearError` | Limpia `error` y vuelve `status` a `'idle'` | `Login.jsx:22` y `Registro.jsx:42` — al tipear de nuevo, el error viejo desaparece |
| `setReturnTo` | Guarda la ruta pendiente | `Carrito.jsx:24` (quiso ir al checkout sin login) y `App.jsx:252` (`AccountGuard`, cuando patea a `/login`) |

Nota sobre `logout`: baja `initializing` a `false` también. Suena redundante (para cuando alguien se desloguea la app ya inicializó), pero es defensivo — deja el slice en un estado 100% coherente sin depender del orden histórico de acciones.

## Thunks

El patrón pending/fulfilled/rejected y por qué no hay try/catch está explicado en detalle en [carrito.md](./carrito.md#thunk-applycoupon--y-el-patrón-que-comparten-todos-los-thunks-del-proyecto) — acá solo lo específico.

### `loginThunk` (authSlice.js:7-20)

- **Endpoint**: `POST /api/auth/login` con `{ username, password }` (vía `authService.login`).
- **Respuesta**: `{ token, id, username, nombre, email, rol }`. Ojo al reparto: `authService.login` guarda `token` (en `cumbre_token`) y un objeto `user` (en `cumbre_user`) en **localStorage** (`tokenStorage.set` / `userStorage.set`, `authService.js:7-14`) y el thunk devuelve **solo los datos del usuario, sin el token** — el token jamás entra al store.
- **Efecto colateral**: emite `CustomEvent('auth:login', { detail: { id, rol } })`. Dos oyentes:
  - `CartUserCheck` (App.jsx) usa el `id` para decidir si limpiar el carrito (cambio de usuario en el mismo browser).
  - `CartBackendSync` (App.jsx) llama a `loadBackendCart` para traer el carrito guardado del backend, pero **solo si `rol !== 'ADMIN'`** (el admin no tiene carrito propio).
- **extraReducers**:
  - `pending` → `status='loading'`, `error=null`.
  - `fulfilled` → `user` poblado, `isLoggedIn=true`, `status='idle'`, `error=null`, `initializing=false`.
  - `rejected` → `status='error'`, `error=action.error.message` (ej. "Usuario o contraseña incorrectos", que viene del `GlobalExceptionHandler` del backend como 401). El interceptor de axios exceptúa `/auth/login` y `/auth/register` del auto-logout — un 401 ahí son credenciales incorrectas, no sesión expirada (`api.js:29-31`).

### `registerThunk` (authSlice.js:22-36)

- **Endpoint**: `POST /api/auth/register` con `{ username, email, password, nombre, apellido }`.
- **Auto-login al registrarse**: el backend responde con el mismo shape que `/auth/login` (token+user), `authService.register` los guarda igual en localStorage, así que el usuario queda logueado sin pasar por `/login`.
- **Efecto colateral**: emite el mismo `auth:login` que el login normal (los oyentes no distinguen entre login y registro).
- **extraReducers**:
  - `pending` → `status='loading'`, `error=null`.
  - `fulfilled` → `user` poblado, `isLoggedIn=true`, `status='registered'` (no `'idle'` — este valor es el que dispara la pantalla de bienvenida), `error=null`, `initializing=false`.
  - `rejected` → `status='error'`, `error=action.error.message`.
- **Sobre `status='registered'`**: `Registro.jsx:74-91` monta una pantalla especial de éxito (icono, texto "Cuenta creada"), y `Registro.jsx:29-33` arma un `setTimeout` de 2 s que navega a `/`. Es una decisión nuestra, no un valor canónico de RTK.
- **Curiosidad**: el payload del thunk también incluye `registered: true` (`authSlice.js:33`), que queda seteado en `state.user.registered`. Ningún componente lo lee — el flag útil es `status='registered'`. Ese campo extra sobra pero no molesta.

### `logoutThunk` (authSlice.js:43-53)

- **No pega a un endpoint**: es un thunk de orquestación local que agrupa tres pasos en orden fijo:
  1. Si hay sesión activa y hay items en el carrito, hace `flushCart(items)` (**vuelca el carrito al backend con el token todavía válido**, `PUT /api/carritos/{id}/items`) — es best-effort dentro de un `try/catch` propio: si el `PUT` falla, el logout ocurre igual. Ese volcado es lo que permite recuperar el carrito al re-loguearse en otro dispositivo (ver [carrito.md](./carrito.md#se-recuperan-los-productos-al-volver-a-iniciar-sesión)).
  2. `authService.logout()` — borra `cumbre_token`, `cumbre_user`, `cumbre_cart` y `cumbre_cart_uid` de localStorage (`authService.js:41-46`).
  3. `dispatch(logout())` — el reducer síncrono resetea el `authSlice`; el `cartSlice` reacciona por extraReducer cross-slice vaciando `state.cart`.
- **Quién lo usa**: los tres botones de logout — `Navbar.jsx:71`, `Perfil.jsx:34`, `AdminLayout.jsx:98`. **No** lo usa el auto-logout por 401: en ese camino el token ya no vale para volcar, así que `AuthInit` (`App.jsx:65`) despacha `logout()` directo.
- **Sin extraReducers propios**: como no expone `pending`/`fulfilled` en el slice, el botón no muestra spinner — el logout se percibe instantáneo. El `flushCart` corre en el fondo antes de navegar al home.

## Interceptor de axios y auto-logout por 401

Vive en `api.js:22-39` y es la otra mitad del ciclo de vida de la sesión (el slice sabe cómo entrar; el interceptor sabe cuándo forzar salir).

- **Request** (`api.js:14-18`): lee `cumbre_token` de localStorage y agrega `Authorization: Bearer <token>` a cada request si hay token. Ningún componente ni thunk tiene que preocuparse por el header.
- **Response** (`api.js:22-39`):
  1. Normaliza `error.message` con el mensaje del backend (`error.response.data.message`) — por eso los thunks no necesitan `try/catch`, `action.error.message` ya viene con el texto útil.
  2. Si el status es `401` y **no** es `/auth/login` ni `/auth/register`, limpia `cumbre_token` + `cumbre_user` de localStorage y emite `window.dispatchEvent(new Event('auth:logout'))`.
- **Quién escucha `auth:logout`**: `AuthInit` en `App.jsx:63-70`. El handler despacha `logout()` (síncrono, sin flush del carrito porque el token ya no sirve) y navega a `/login`.
- **Por qué exceptúa los endpoints de auth**: un 401 en `/auth/login` significa "credenciales incorrectas", no "sesión expirada". Si el interceptor no filtrara, cada intento de login fallido dispararía un ciclo de logout innecesario.

## localStorage: qué guardamos y quién lo lee

Cuatro claves relacionadas con auth y carrito. Ninguna vive en Redux — Redux tiene la representación derivada.

| Clave | Contenido | Escritura | Lectura |
|---|---|---|---|
| `cumbre_token` | JWT plano (string) | `authService.login/register`, `tokenStorage.set` | Interceptor de axios (`api.js:15`), `authService.isAuthenticated` (`App.jsx:56`) |
| `cumbre_user` | `{ id, username, nombre, email, rol }` serializado | `authService.login/register`, `userStorage.set` | `App.jsx:55` (`AuthInit`, para hidratar `sessionRestored`) |
| `cumbre_cart` | `{ items, coupon }` serializado | `CartPersist` (`App.jsx:83`) en cada cambio | `cartSlice.js` (al inicializar el store) |
| `cumbre_cart_uid` | Id del usuario dueño del carrito local (para detectar cambios) | `CartUserCheck` (App.jsx) | `CartUserCheck` |

`authService.logout()` borra las cuatro; el interceptor por 401 borra solo `cumbre_token` y `cumbre_user` (el carrito lo maneja el reducer `logout` del `cartSlice` reaccionando al `logout` del `authSlice`).

## Dónde se usa

**useSelector:**
| Componente | Qué lee | Para qué |
|---|---|---|
| `App.jsx:246` (`AccountGuard`) | `isLoggedIn`, `initializing` | Proteger `/cuenta/*`; muestra `PageLoader` mientras `initializing` es true |
| `App.jsx:263` (`AdminGuard`) | + `user` | Exigir `user.rol.toUpperCase() === 'ADMIN'` para `/admin/*` (defensivo por si el backend devuelve 'admin' en minúscula) |
| `Navbar.jsx:40` | `isLoggedIn`, `user` | Menú usuario vs botón "Ingresar" |
| `Footer.jsx:7` | `isLoggedIn` | Links condicionales |
| `Login.jsx:11` | `status`, `error`, `isLoggedIn`, `returnTo` | Spinner, mensaje de error, redirect si ya está logueado, destino post-login |
| `Registro.jsx:26` | `status`, `error` | Pantalla `'registered'`, errores |
| `Perfil.jsx:25`, `AdminLayout.jsx:43` | `user` | Datos del usuario en pantalla |
| `Carrito.jsx:15` | `isLoggedIn` | Decidir si el checkout pasa antes por login |
| `Checkout.jsx:162` | `user` | Contexto de la compra |
| `App.jsx:99` (`CartBackendSync`) | `isLoggedIn`, `user.rol` | Decidir si vuelca el carrito al backend y si suscribe al `auth:login` |

**dispatch:** ver tabla de reducers; los thunks se despachan en `Login.jsx:27` (submit del form) y `Registro.jsx:65` (submit, después de la validación local del form). `logoutThunk` desde los tres botones de logout.

## Flujos completos narrados

### 1. Login con redirect al checkout

1. Usuario con carrito armado toca "Finalizar compra" en `/carrito` sin estar logueado. `Carrito.jsx:21-28` (`handleCheckout`): como `isLoggedIn` es false, despacha `setReturnTo('/checkout')` y navega a `/login`.
2. En `Login.jsx:27`, el submit despacha `loginThunk({ username, password })` → RTK emite `auth/login/pending` → `status='loading'` → el botón muestra "Verificando…".
3. `authService.login` hace el POST; con 200, guarda `token` y `user` en localStorage y el thunk emite `auth:login` (por si cambió el usuario, `CartUserCheck` decide si limpiar el carrito; `CartBackendSync` recupera el carrito guardado si no es ADMIN).
4. `auth/login/fulfilled` → `user` poblado, `isLoggedIn=true`, `status` vuelve a `'idle'`, `initializing=false`.
5. `Login.jsx:28-31` chequea el resultado con `loginThunk.fulfilled.match(result)` y navega: ADMIN → `/admin/dashboard`; usuario común → `returnTo` (acá `/checkout`).
6. Con contraseña incorrecta: el backend responde 401, el interceptor lo **exceptúa** del logout automático (`api.js:29-31`), el thunk rechaza → `status='error'`, `error='Usuario o contraseña incorrectos'` → `Login.jsx:61-66` lo muestra. Al volver a tipear, el `useEffect` de `Login.jsx:21-23` despacha `clearError` y el error viejo desaparece.

```
Carrito ─setReturnTo('/checkout')─▶ /login ─loginThunk─▶ pending('loading')
   → POST /auth/login ─▶ token+user a localStorage, evento auth:login
   → fulfilled: user, isLoggedIn=true, 'idle' ─▶ navigate(returnTo)
   → rejected:  'error' + mensaje ─▶ <Login/> lo muestra
```

### 2. Restauración de sesión al hacer F5

1. Se monta la app. `initialState.initializing = true`. `AccountGuard` y `AdminGuard` ven `initializing=true` y renderizan `<PageLoader/>` en lugar de patearte a `/login`.
2. `AuthInit` (`App.jsx:50-73`) corre su primer `useEffect`. Lee `authService.getStoredUser()` (parsea `cumbre_user`) y `authService.isAuthenticated()` (chequea existencia de `cumbre_token`).
3. Si ambos existen → `dispatch(sessionRestored(stored))`: `user`, `isLoggedIn=true`, `status='idle'`, `initializing=false`. Los guards re-renderizan con el estado real y muestran el contenido.
4. Si no hay sesión guardada → `dispatch(initDone())`: solo apaga `initializing`. `AccountGuard` ahora sí redirige a `/login`.
5. **No se valida el token contra el backend en el arranque**. Si estaba vencido, la primera llamada autenticada (ej. al cargar el catálogo o al abrir el perfil) devolverá 401 y disparará el auto-logout.

### 3. Auto-logout por token expirado

1. Cualquier request autenticado devuelve `401`. El interceptor de response (`api.js:22-39`) revisa la URL: si NO es `/auth/login` ni `/auth/register`, borra `cumbre_token` y `cumbre_user` y emite `window.dispatchEvent(new Event('auth:logout'))`.
2. `AuthInit` (`App.jsx:63-70`) tiene el listener registrado; su handler hace `dispatch(logout())` (reset del slice) y `navigate('/login')`.
3. El `cartSlice` reacciona al `logout` con su extraReducer y vacía sus items.
4. El request original sigue rechazando con el error normalizado — el componente que lo hizo puede mostrar un mensaje si querés (en general la navegación a `/login` opaca el error).

### 4. Logout manual con volcado del carrito

1. Usuario toca "Cerrar sesión" en `Navbar`, `Perfil` o `AdminLayout` → despachan `logoutThunk`.
2. Paso 1 del thunk: si `isLoggedIn` y hay items, `flushCart(items)` hace `PUT /api/carritos/{id}/items` con el token aún válido. Best-effort dentro de un `try/catch`.
3. Paso 2: `authService.logout()` limpia las cuatro claves de localStorage.
4. Paso 3: `dispatch(logout())` resetea el `authSlice`; el `cartSlice` reacciona y vacía el carrito.
5. El componente que disparó el thunk navega a `/`.

## Puntos finos y posibles preguntas trampa

- **"¿Dónde guardan el token?"** — En localStorage (`cumbre_token`), NO en Redux. El slice guarda la representación del usuario para la UI; el token lo inyecta el interceptor de request de axios en cada llamada (`api.js:14-18`). Ventaja: sobrevive al F5 sin serializar nada del store y ningún componente necesita leerlo.
- **"¿Cómo renuevan el token?"** — No se renueva: el JWT dura 24 h (`jwt.expiration=86400000` en el backend). Cuando vence, la primera llamada devuelve 401 → el interceptor de response borra localStorage y emite `auth:logout` → `AuthInit` (App.jsx:63-70) despacha `logout()` y navega a `/login`. Es un logout reactivo, no un refresh token.
- **¿Para qué existe `initializing`?** — Evita el parpadeo de los guards: al cargar la app, `AuthInit` todavía no restauró la sesión; sin ese flag, `AccountGuard` te patearía a `/login` aunque tengas sesión válida guardada. Mientras `initializing` es true muestran `PageLoader`.
- **¿Por qué `login` y `register` fulfilled también apagan `initializing`?** — Defensivo. Si por algún motivo llegara un login antes de que `AuthInit` corriera (no debería, pero es un race teórico), el slice queda consistente igual. Cuesta una asignación, evita una clase entera de bugs.
- **Restauración de sesión sin thunk**: `sessionRestored` es un reducer síncrono porque los datos ya están en localStorage — no hay nada que fetchear. Si preguntan "¿validan el token al restaurar?": no contra el backend; si estaba vencido, el primer 401 dispara el logout automático.
- **Dos formas de consumir un thunk en el proyecto**: `Login.jsx` usa `loginThunk.fulfilled.match(result)` (type guard sobre la action resultante — no lanza, permite navegar solo en el happy path) y `Checkout.jsx` usa `.unwrap()` (promesa que rechaza — bueno para envolver en `try/catch`). Conviene saber explicar ambas y por qué elegimos cada una: en Login queremos navegar solo en éxito y dejar que el reducer maneje el error; en Checkout necesitamos capturar el error y mostrar toasts específicos.
- **`status='registered'`** es una decisión nuestra: distingue "login normal" de "recién registrado" para mostrar la bienvenida. No es nomenclatura de RTK. El componente `Registro` lee ese status para (a) montar la pantalla de éxito y (b) armar el `setTimeout` que navega a `/` en 2 s.
- **`AdminGuard` usa `user.rol?.toUpperCase()`** (`App.jsx:265`) — defensivo por si el backend cambia el casing (`'ADMIN'` vs `'admin'`). La API actual devuelve `'ADMIN'`, pero el guard es tolerante.
- **`auth/initDone` (o `sessionRestored`) puede aparecer DOS VECES en Redux DevTools en dev — es StrictMode, no un bug.** `AuthInit` (`App.jsx:52-71`) despacha desde un `useEffect`, y React StrictMode monta → desmonta → vuelve a montar cada componente en desarrollo para exponer efectos con side-effects no idempotentes. El segundo dispatch pasa por el reducer pero devuelve el mismo estado (RDT muestra "state = previous state", diff vacío). **Por qué no es un problema**: (1) el reducer de `initDone` es idempotente — solo baja `initializing` de `true` a `false`, y la segunda vez ya es `false`; (2) desaparece con `npm run build && npm run preview` (React desactiva el doble-invoke cuando `NODE_ENV=production`); (3) las actions de interacción del usuario (`addToCart`, `updateQty`, `loginThunk`, etc.) **no** se duplican ni en dev, porque no nacen de un `useEffect` sino de eventos. El único lugar donde sí podría costar caro es el fetch del catálogo, y por eso `ProductsContext` tiene un guard con `useRef`. Cómo contarlo: *"es el doble-invoke intencional de StrictMode sobre efectos de montaje; el reducer es puro e idempotente, en producción no ocurre, y donde el efecto tenía costo real lo guardamos con useRef"*.
- **El logout tiene tres partes, orquestadas por `logoutThunk`** (`authSlice.js:43-53`): (1) `flushCart(items)` vuelca el carrito al backend con el token todavía válido — es lo que permite recuperarlo al re-loguearse en otro dispositivo; (2) `authService.logout()` limpia localStorage (token, user, carrito, uid); (3) `dispatch(logout())` limpia el store, y el `cartSlice` reacciona por extraReducer vaciando su porción. Los tres botones de logout despachan `logoutThunk`, no `logout` directo. Si preguntan por qué no alcanza con (2) y (3): sin (1) el carrito que quedó en el navegador jamás llega al backend y en el próximo login desde otro dispositivo aparecería vacío. El auto-logout por 401 sí despacha `logout()` directo porque el token ya no vale para volcar.
- **Forgot/Reset password no viven en el slice**. `ForgotPassword.jsx` y `ResetPassword.jsx` usan `useState` local para `loading`, `message` y `error`. Justificación: son pantallas aisladas, nadie más necesita saber si el email de recupero se envió, y meterlas en Redux sería overengineering. Si preguntan "¿por qué no en el slice?" la respuesta es: **estado local es suficiente cuando ningún otro componente lee ese estado** — es la línea que trazamos en el proyecto para decidir Redux vs `useState`.
- **`registered: true` en el payload de `registerThunk`** (`authSlice.js:33`) queda pegado en `state.user.registered` y ningún componente lo lee — el flag útil es `status='registered'`. Sobra pero no molesta; si preguntan es honestidad decir "sobra, se puede sacar".
- **Ningún selector deriva `isAdmin`** — cada guard/componente escribe `user?.rol === 'ADMIN'` (o `.toUpperCase()`) inline. Se podría normalizar con un selector memoizado, pero para tres callsites es prematuro.

## Resumen de 30 segundos

> "El slice `auth` guarda el usuario logueado, un `status` (`'idle'`, `'loading'`, `'error'` y `'registered'` tras un registro exitoso), el error y `returnTo` para volver a donde el usuario quería ir. Tiene tres thunks: `loginThunk` y `registerThunk` pegan a `/auth/login` y `/auth/register`; el token que devuelve el backend va a localStorage — no al store — y axios lo inyecta en cada request con un interceptor. `logoutThunk` orquesta tres pasos: vuelca el carrito al backend con el token aún válido, limpia localStorage y despacha `logout()` (el `cartSlice` reacciona vaciando su porción). Al montar la app, `AuthInit` restaura la sesión desde localStorage con el reducer síncrono `sessionRestored`, y un flag `initializing` evita que los guards redirijan antes de tiempo. Si un token vence, el interceptor detecta el 401 y dispara el logout automático emitiendo un evento `auth:logout` que `AuthInit` escucha."
