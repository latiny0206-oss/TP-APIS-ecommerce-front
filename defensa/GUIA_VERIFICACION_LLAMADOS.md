# Guía de verificación de llamados a la API — por flujo

Para usar por **cualquiera del equipo**, aunque no haya programado esa parte. La idea: recorrer cada flujo con las herramientas del navegador abiertas y tildar el checklist. Si algo no coincide, anotar qué viste y en qué flujo.

## Preparación (una sola vez)

1. Levantar el backend (`./mvnw spring-boot:run` en `Back/ecommerce`) y el front (`npm run dev` en `Front`).
2. Abrir Chrome → F12 (DevTools) → pestaña **Network** → filtrar por **Fetch/XHR** (así solo ves llamados a la API, no imágenes ni JS).
3. Instalar la extensión **Redux DevTools** si no la tenés → en F12 aparece la pestaña "Redux". Ahí se ve cada action despachada, en orden, con el estado antes y después.
4. Tildá "Preserve log" en Network si vas a navegar entre páginas sin perder el historial.

## StrictMode: el "doble llamado" que NO es un bug

React StrictMode (activado en `main.jsx`, **solo en desarrollo**) monta cada componente dos veces a propósito para detectar efectos mal escritos — por eso en dev podés ver algo repetido que en producción sale una sola vez.

**Cómo diferenciar**: un falso positivo de StrictMode aparece *solo en dev*, *duplicado exacto e inmediato* (mismo endpoint, milisegundos de diferencia, al montar la página). Un duplicado real también aparece con `npm run build && npm run preview` (que no tiene StrictMode), o se repite en cada render/interacción, no solo al montar. En este proyecto además pusimos guards (en `ProductsContext` y caches de promesa en servicios), así que **incluso en dev no deberías ver dobles** — si ves uno, anotalo: es un bug real o un guard que se rompió.

**Actions duplicadas en Redux DevTools**: acciones síncronas idempotentes como `auth/initDone` pueden aparecer dos veces al montar la app en dev (StrictMode dispara `useEffect` de `AuthInit` dos veces). La segunda invocación no cambia el estado (RDT muestra "state = previous state"). Es esperado y desaparece en producción.

## Llamados "extra" del CartBackendSync (leelos antes de contar requests)

`App.jsx:95-161` monta un componente invisible `CartBackendSync` que sincroniza el carrito con el backend **en los bordes de la sesión**, no en cada interacción. Puede meter requests que no vienen de la vista que estás mirando:

- **Al ocultar la pestaña (visibilitychange → hidden) o cerrarla (pagehide)** — si el carrito cambió desde el último volcado, hace `flushCart` = **GET `/carritos`** + (POST `/carritos` si no había uno) + **PUT `/carritos/{id}/items`** (reemplazo atómico). Si el carrito local está vacío y no hay uno reutilizable en backend, solo hace el GET.
- **Al iniciar sesión** (evento `auth:login` — login fresco o registro, **no** refresh) — `loadBackendCart()` hace **GET `/carritos`** para recuperar el carrito ACTIVO/VACIO y despachar `hydrateItems`.
- **Excepción**: si el usuario que loguea tiene `rol === 'ADMIN'`, `CartBackendSync` corta antes de tocar el backend. El admin **no dispara** el GET al login ni el PUT al cerrar la pestaña — no tiene carrito propio. El evento `auth:login` viaja con `{ id, rol }` para que el handler pueda filtrar sin leer el store.

Consecuencia práctica: si al probar un flujo abrís DevTools después de haber empezado, o alternás pestañas, verás llamados que no son "del flujo" que estás observando. Antes de reportar un llamado inesperado, verificá que no venga del `CartBackendSync`.

## Qué mirar en Redux DevTools (regla general)

Por cada acción del usuario que dispara un thunk tienen que aparecer **exactamente dos actions**: `<slice>/<thunk>/pending` y después `<slice>/<thunk>/fulfilled` (o `/rejected` si falló). Si ves `pending` dos veces seguidas para un solo click, hay un dispatch duplicado. Las actions síncronas (`cart/addToCart`, `auth/logout`) aparecen una sola vez por click y **sin** pending/fulfilled — no son asíncronas.

---

## Flujo 1 — Home / primera carga de la app

**Acción**: abrir `http://localhost:5173/` con el carrito de Network vacío (Ctrl+R).

**Network esperado** (una vez cada uno, sin importar cuántos componentes usen los datos):
| Llamado | Método | Cuántas veces | Quién lo dispara |
|---|---|---|---|
| `/api/productos` | GET | 1 | `ProductsProvider` al montar |
| `/api/variantes` | GET | 1 | ídem (van juntos en un `Promise.all`) |
| `/api/fotos` | GET | 1 | ídem |
| `/api/descuentos/activos` | GET | 1 | `HeroSection` (promo del banner) — cacheado por promesa a nivel módulo |

**Redux DevTools**: si había sesión guardada, `auth/sessionRestored`; si no, `auth/initDone`. **En dev aparecen DOS VECES** (StrictMode duplica el `useEffect` de `AuthInit` — la segunda pasada no cambia el estado, RDT muestra diff vacío). Con `npm run build && npm run preview` sale una sola vez. Nada del carrito acá: se rehidrata de localStorage al importar el módulo, sin actions.

- [ ] `/productos`, `/variantes`, `/fotos` aparecen 1 vez cada uno
- [ ] `/descuentos/activos` aparece 1 vez
- [ ] Ningún llamado se repite al quedarse quieto en la página

## Flujo 2 — Catálogo y detalle de producto

**Acción**: navegar a `/catalogo`, filtrar, abrir un producto.

**Network esperado**: **CERO llamados nuevos**. Todo el catálogo (productos, variantes, fotos) ya se cargó en el Flujo 1 y vive en `ProductsContext`; filtrar, ordenar y abrir el detalle leen de memoria.

**Redux DevTools**: nada — el catálogo no pasa por Redux (decisión de diseño: es estado de solo-lectura).

- [ ] Filtrar/ordenar en catálogo: 0 requests
- [ ] Abrir detalle de producto: 0 requests
- [ ] Volver al catálogo y abrir otro producto: 0 requests

## Flujo 3 — Login

**Acción**: en `/login`, completar credenciales y enviar.

**Network esperado**: `POST /api/auth/login` — **1 vez por click** en "Ingresar". Con credenciales malas: el mismo POST devuelve 401 (rojo en Network) — eso no es un bug, es el flujo de error.

**Redux DevTools**: `auth/login/pending` → `auth/login/fulfilled` (una vez cada una). Con credenciales malas: `pending` → `rejected` y `state.auth.error` queda con el mensaje. Al tipear de nuevo: una `auth/clearError`.

- [ ] 1 solo POST por click (probar click rápido doble: el botón se deshabilita con `status === 'loading'`)
- [ ] Ciclo pending → fulfilled/rejected una sola vez
- [ ] Login incorrecto muestra el mensaje del backend, no un error genérico

## Flujo 4 — Registro

**Acción**: completar el form de `/registro` y enviar.

**Network esperado**: `POST /api/auth/register` — 1 vez. (La validación del form es local: si el form tiene errores, **cero** requests.)

**Redux DevTools**: `auth/register/pending` → `fulfilled` (status queda `'registered'`, por eso aparece la pantalla de bienvenida) → a los 2 s navega sola al home.

- [ ] Form inválido: 0 requests
- [ ] Form válido: 1 POST, ciclo pending → fulfilled una vez

## Flujo 5 — Agregar / quitar / modificar carrito

**Acción**: "Agregar al carrito" en un producto; en `/carrito` usar +, −, "Quitar", "Vaciar".

**Network esperado**: **CERO**. El carrito es 100% local (Redux + localStorage) hasta el checkout. Si ves un request acá, es un bug.

**Redux DevTools**: una action síncrona por click — `cart/addToCart`, `cart/updateQty`, `cart/removeFromCart`, `cart/clearCart`. Al agregar, el estado de `toast` también cambia en la MISMA action (extraReducer cross-slice — no hay una action separada del toast).

- [ ] Agregar/quitar/± cantidad: 0 requests
- [ ] Una action por click en DevTools
- [ ] `addToCart` cambia `cart.items` Y `toast.visible` en la misma action

## Flujo 6 — Aplicar cupón (checkout, paso 2)

**Acción**: escribir el código y click en "Aplicar" (o Enter).

**Network esperado**: `GET /api/descuentos/buscar?codigo=XXX` — 1 vez por click. Con código inválido: mismo GET, respuesta 404 — el mensaje aparece bajo el input.

**Redux DevTools**: `cart/applyCoupon/pending` (couponStatus `'loading'`) → `fulfilled` (cupón en `state.cart.coupon`) o `rejected` (`couponError` con el mensaje). Quitar el cupón (✕) despacha `cart/removeCoupon` — sin request.

- [ ] 1 GET por click en Aplicar (el botón se deshabilita mientras `couponStatus === 'loading'`)
- [ ] Ciclo pending → fulfilled/rejected una sola vez
- [ ] Quitar cupón: 0 requests
- [ ] Navegar carrito ↔ checkout con cupón puesto: 0 requests (el cupón vive en el store)

## Flujo 7 — Confirmar compra (checkout, paso 3)

**Acción**: click en "Confirmar compra". Es el único flujo con varios llamados encadenados — esta es la secuencia esperada, en orden (ver `Checkout.jsx:348-404`, función `confirmar`):

| # | Llamado | Método | Cuántas veces |
|---|---|---|---|
| 1 | `/api/carritos` | GET | 1 (busca carrito ACTIVO/VACIO del usuario, `obtenerOCrearCarrito`) |
| 2 | `/api/carritos` | POST | 0 o 1 (solo si no tenía carrito reutilizable) |
| 3 | `/api/carritos/{id}/vaciar` | POST | 1 (evita mezcla con items de sesión anterior) |
| 4 | `/api/carritos/{id}/items` | POST | **1 por línea del carrito** (en paralelo con `Promise.allSettled` — verlas juntas es normal) |
| 5a | `/api/carritos/{id}/descuento` | PUT | 1 solo si hay cupón |
| 5b | `/api/carritos/{id}` | PUT | 1 solo si NO hay cupón (desasocia descuentos viejos con `{ descuentoId: null }`) |
| 6 | `/api/carritos/{id}/checkout` | POST | 1 |

**Redux DevTools**: al éxito, una única `cart/clearCart` **al final** (después del POST `/checkout`, no antes), y navega a `/confirmacion`.

**Nota sobre llamados "extra"**: si al entrar al checkout viste `GET /carritos` + `POST /carritos` + `PUT /carritos/{id}/items` **antes** de tocar "Confirmar compra", son del `CartBackendSync` (visibilitychange/pagehide — probablemente pasaste por DevTools o cambiaste de pestaña). No son parte de `confirmar()`. Ver la sección "Llamados extra del CartBackendSync" al inicio de la guía.

**Verificación del fix de envío**: armar un carrito de ~$85.000, aplicar un cupón que lo baje de $80.000 → el resumen debe decir "Gratis" y el `montoFinal` de la respuesta del checkout (mirarla en Network → Response) debe venir **sin** los $10.000 de envío. Y el detalle del pedido en "Mis pedidos" tiene que coincidir con lo que mostró el checkout.

- [ ] La secuencia aparece una sola vez y en orden (doble click en Confirmar no duplica: `submitting` lo bloquea)
- [ ] Tantos POST de items como líneas tenía el carrito
- [ ] $85.000 + cupón → envío gratis en UI y en la respuesta del backend
- [ ] Pedido < $80.000 sin cupón → envío $10.000 en ambos lados
- [ ] Después del éxito: carrito vacío (badge en 0)

## Flujo 8 — Historial de pedidos y detalle

**Acción**: ir a "Mis pedidos" (`/cuenta/ordenes`); abrir un pedido.

**Network esperado — visitar la lista**: `GET /api/ordenes/usuario/{id}` — 1 vez **la primera entrada**; volver a entrar en la misma sesión: **0 requests** (cache a nivel módulo en `useOrders.js`, se invalida al login/logout). Detalle: `GET /api/ordenes/{id}` — 1 vez la primera, después cache (el hook `useOrden` también busca primero en el cache de listas antes de pedir el detalle).

**Network esperado — cancelar un pedido**: `POST /api/ordenes/{id}/cancelar` **seguido de** `GET /api/ordenes/usuario/{id}` (refetch de la lista para reflejar el nuevo estado). El código (`useOrders.js:113-125` — función `cancelar`) invalida el cache y llama a `load(true)`, que fuerza el refetch. Es intencional: garantiza que la UI muestra exactamente lo que quedó en el backend (estado, `fechaCancelacion`, etc.) sin depender de un patch local.

- [ ] Primera visita: 1 GET; segunda visita sin recargar: 0
- [ ] Cancelar un pedido: 1 POST `/api/ordenes/{id}/cancelar` seguido de 1 GET `/api/ordenes/usuario/{id}` (refetch por diseño)

## Flujo 9 — Logout

**Acción**: cerrar sesión desde el menú de la Navbar (o Perfil, o el panel admin).

**Network esperado**:
- Con **carrito vacío**: **CERO llamados** — no hay endpoint de logout en el backend (JWT stateless).
- Con **carrito con items**: `PUT /api/carritos/{id}/items` — **1 llamado**. Es el volcado del carrito al backend (`flushCart` dentro de `logoutThunk`, con el token todavía válido) para poder recuperarlo al re-loguearse. Si el `PUT` falla, el logout ocurre igual (es best-effort).

**Redux DevTools**: al despachar `logoutThunk` aparecen tres actions en orden — `auth/logoutFull/pending` → `auth/logout` (reducer síncrono del `logout()` interno; en esa MISMA action, mirar el diff: `auth` se resetea **y `cart` se vacía** por el extraReducer cross-slice del cartSlice) → `auth/logoutFull/fulfilled`. El auto-logout por 401 no pasa por el thunk: en ese caso ves solo `auth/logout`.

- [ ] Carrito vacío → 0 requests al desloguear
- [ ] Carrito con items → 1 PUT `/api/carritos/{id}/items` (el volcado). Cerrar sesión de nuevo sin cambios: sigue siendo 1 PUT si aparecieron items nuevos, 0 si no
- [ ] `auth/logout` vacía `cart.items` y `cart.coupon` en la misma action
- [ ] El badge del carrito queda en 0 y `/carrito` aparece vacío SIN recargar la página
- [ ] Loguearse con otro usuario: no aparece nada del carrito anterior
- [ ] Loguearse con el **mismo** usuario: los items vuelven a aparecer (recuperación desde backend vía `CartBackendSync` en el evento `auth:login`)

## Flujo 10 — Panel admin: patrón común (leelo antes de los flujos 11 a 19)

Cada vista admin fetchea **su** dato al montar y guarda el resultado en una **cache a nivel módulo** propia de esa vista (o del service en el caso de productos/variantes/fotos/categorías/marcas). Todas esas caches escuchan `auth:logout` y `auth:login` y se **vacían** en cada cambio de sesión — por eso el primer render tras loguearse siempre dispara 1 GET, y volver a esa vista dentro de la misma sesión no vuelve a pegarle al backend.

Patrón de mutaciones (con la única excepción de "Confirmar/Cancelar" en Órdenes):
- El POST/PUT/DELETE devuelve el objeto → la vista **actualiza el estado local optimísticamente y sincroniza la cache del módulo** con esa misma copia. **No hay refetch de la lista completa**.
- En `productService` cada mutación también invalida las promesas cacheadas (`invalidateProductos`, `invalidateVariantes`, `invalidateFotos`, `invalidateCatalogos`), así el próximo montaje pide de nuevo. Las mutaciones de categorías/marcas invalidan también productos porque el DTO los trae denormalizados (`categoriaNombre`, `marcaNombre`).

Login como admin — **qué esperar en Network apenas entra al panel**:
- `POST /api/auth/login` (una vez).
- **No** `GET /api/carritos` — `CartBackendSync` corta al leer `e.detail.rol === 'ADMIN'` (ver "Llamados extra del CartBackendSync" arriba).
- Al aterrizar en `/admin/dashboard`: 1 `GET /api/admin/dashboard`.

Redux DevTools durante todo el panel admin: **solo actions de `auth`** (login, initDone, sessionRestored, logout). Ninguna vista admin despacha al store — usan hooks y state local. Si ves `cart/...` mientras administrás, algo está mal (o cambiaste de pestaña con carrito ajeno).

## Flujo 11 — Admin Dashboard

**Acción**: entrar a `/admin/dashboard` (post login).

**Network esperado**:
| Llamado | Método | Cuántas veces | Quién lo dispara |
|---|---|---|---|
| `/api/admin/dashboard` | GET | 1 | `AdminDashboard` al montar (`AdminDashboard.jsx:62`), vía `adminService.getDashboard()` |

**Redux DevTools**: nada — la vista no despacha.

**Reingresos**: navegar a otra vista admin y volver → **0 requests** (cache de módulo `cachedDashboard`). Solo se vuelve a pegar al presionar el botón "Reintentar" (que llama a `loadDashboard(true)`) o al hacer logout/login.

- [ ] Primer ingreso: 1 GET `/api/admin/dashboard`
- [ ] Volver desde otra vista admin en la misma sesión: 0 requests
- [ ] Botón "Reintentar" tras error: 1 GET

## Flujo 12 — Admin Catálogo (categorías + marcas)

**Acción**: entrar a `/admin/catalog`.

**Network esperado al montar** (primera vez en la sesión):
| Llamado | Método | Cuántas veces | Quién lo dispara |
|---|---|---|---|
| `/api/categorias` | GET | 1 | `productService.getCategorias()` (cache de promesa) |
| `/api/marcas`     | GET | 1 | `productService.getMarcas()` |

Si venías de AdminProducts/AdminVariants/AdminPhotos en la misma sesión, esos GETs ya salieron y **no se repiten** — los caches de `productService` son compartidos.

**Acciones (categorías; marcas idéntico)**:
| Acción | Método | URL | Refetch de la lista |
|---|---|---|---|
| Nueva categoría | POST | `/api/categorias` | No — update local + invalida `categorias` y `productos` en cache |
| Editar categoría | PUT | `/api/categorias/{id}` | No — ídem |
| Eliminar categoría | DELETE | `/api/categorias/{id}` | No — ídem |

**Redux DevTools**: nada.

- [ ] Montaje: 1 GET `/categorias` + 1 GET `/marcas` (o 0 si ya se pidieron en otra vista del catálogo)
- [ ] Crear categoría: 1 POST, sin GET posterior
- [ ] Editar categoría: 1 PUT, sin GET posterior
- [ ] Eliminar categoría: 1 DELETE, sin GET posterior
- [ ] Ídem para marcas
- [ ] Al ir después a AdminProducts, se rehace `GET /productos/admin` (la mutación de categorías/marcas invalidó también productos)

## Flujo 13 — Admin Productos

**Acción**: entrar a `/admin/products`.

**Network esperado al montar** (primera vez en la sesión):
| Llamado | Método | Cuántas veces | Notas |
|---|---|---|---|
| `/api/productos/admin` | GET | 1 | Trae ACTIVO + PAUSADO + ELIMINADO. Si el back devuelve 403, fallback a `/api/productos`. |
| `/api/variantes` | GET | 1 | Cache de `productService` |
| `/api/fotos` | GET | 1 | Metadata liviana; el binario no viaja acá |

Al abrir el drawer "Nuevo producto" o "Editar" **por primera vez** puede dispararse `GET /api/marcas` y `GET /api/categorias` si esa sesión no los pidió antes (sale del cache si ya estaban).

**Acciones**:
| Acción | Método | URL | Refetch |
|---|---|---|---|
| Crear producto | POST | `/api/productos` | No — update local + invalida `productos`, `productosAdmin` |
| Editar producto | PUT | `/api/productos/{id}` | No — ídem |
| Eliminar producto | DELETE | `/api/productos/{id}` | No — ídem |

**Redux DevTools**: nada.

- [ ] Montaje: 1 GET `/productos/admin` + 1 GET `/variantes` + 1 GET `/fotos`
- [ ] Abrir drawer nuevo: si es la primera vez de la sesión, 1 GET `/marcas` + 1 GET `/categorias`; si no, 0
- [ ] Crear producto: 1 POST y **cero GET** posteriores
- [ ] Editar producto: 1 PUT y cero GET posteriores
- [ ] Eliminar producto: 1 DELETE y cero GET posteriores
- [ ] Volver a la vista después de una mutación: rehace los 3 GET (cache invalidado). Volver **sin** mutar: 0 GET (cache vivo)

## Flujo 14 — Admin Variantes (dirty-tracking + batch)

**Acción**: entrar a `/admin/variants`.

**Network esperado al montar**:
| Llamado | Método | Cuántas veces | Notas |
|---|---|---|---|
| `/api/productos/admin` | GET | 1 | Fallback a `/productos` si 403 |
| `/api/variantes` | GET | 1 | — |
| `/api/fotos` | GET | 1 | — |

Los tres salen de las caches compartidas de `productService` si ya se pidieron en otra vista de la misma sesión.

**Seleccionar producto en el panel izquierdo**: **cero requests** — filtra en memoria.

**Edición inline con dirty-tracking** — este es el patrón particular de esta vista:
- Cambiar campos en la grilla (`color`, `talla`, `material`, `peso`, `precio`, `stock`, `estacion`) **no dispara nada** — se guarda en state local.
- Al presionar **"Guardar cambios"**: se compara cada variante contra su snapshot (`originalsRef`) y solo las que difieren disparan `PUT /api/variantes/{id}` **en paralelo con `Promise.all`**. Si nada cambió, cero requests y un cartel "sin cambios".

**Acciones**:
| Acción | Método | URL | Refetch |
|---|---|---|---|
| Nueva variante | POST | `/api/variantes` | No — update local + invalida `variantes` |
| Guardar cambios | N × PUT en paralelo | `/api/variantes/{id}` | No — actualiza snapshot local |
| Eliminar variante | DELETE | `/api/variantes/{id}` | No — update local |

**Redux DevTools**: nada.

- [ ] Montaje: 1 GET `/productos/admin` + 1 `/variantes` + 1 `/fotos` (o 0 si ya venían cacheadas)
- [ ] Cambiar un campo y no guardar: 0 requests
- [ ] "Guardar cambios" sin editar nada: 0 requests
- [ ] "Guardar cambios" tras editar 3 variantes: exactamente 3 PUT (en paralelo, mismos ms de inicio)
- [ ] Crear variante: 1 POST, sin GET
- [ ] Eliminar variante: 1 DELETE, sin GET

## Flujo 15 — Admin Fotos

**Acción**: entrar a `/admin/fotos` (o `/admin/fotos/{productId}` desde AdminProducts).

**Network esperado al montar**:
| Llamado | Método | Cuántas veces | Notas |
|---|---|---|---|
| `/api/productos/admin` | GET | 1 | Fallback a `/productos` |
| `/api/variantes` | GET | 1 | — |

Ojo: acá **no se carga `/fotos` completo al inicio**. Las fotos se piden **al seleccionar una variante**.

**Seleccionar una variante**:
- Si `productService.getAllFotos()` ya cargó (por venir de otra vista admin), se filtra en memoria — **0 requests**.
- Si no, `productService.getFotosByVariante(id)` hace **1 GET `/api/fotos/variante/{id}`**.

**Subir fotos** (drag & drop o input): por cada archivo → **1 POST `/api/fotos`** (multipart, con `onUploadProgress`). No refetch — se agrega la foto a la lista local; además actualiza `ProductsContext` con la nueva imagen del producto vía `setProductImage`.

**Eliminar foto**: **1 DELETE `/api/fotos/{id}`** — quita del state local.

**Redux DevTools**: nada.

- [ ] Montaje directo (no venías de AdminProducts): 1 GET `/productos/admin` + 1 `/variantes`, **cero `/fotos`**
- [ ] Seleccionar una variante por primera vez: 1 GET `/fotos/variante/{id}` (o 0 si el cache de `/fotos` ya estaba)
- [ ] Subir 3 fotos: 3 POST `/fotos` en secuencia (uno por archivo)
- [ ] Eliminar una foto: 1 DELETE `/fotos/{id}` y nada más

## Flujo 16 — Admin Descuentos

**Acción**: entrar a `/admin/discounts`.

**Network esperado al montar**:
| Llamado | Método | Cuántas veces | Notas |
|---|---|---|---|
| `/api/descuentos` | GET | 1 | Cache local `cachedDescuentos` en la vista. Si el back devuelve 403, fallback a `GET /api/descuentos/activos`. |

**Acciones**:
| Acción | Método | URL | Refetch |
|---|---|---|---|
| Crear cupón | POST | `/api/descuentos` | No — update local + invalida `activeDiscountsPromise` en `discountService` |
| Editar cupón | PUT | `/api/descuentos/{id}` | No — ídem |
| Toggle estado (ACTIVO ↔ EXPIRADO) | PUT | `/api/descuentos/{id}` | No — misma ruta que edición, con `estado` cambiado |
| Eliminar cupón | DELETE | `/api/descuentos/{id}` | No — ídem |

Detalle importante: la mutación **invalida** el cache público (`activeDiscountsPromise`), así que la próxima vez que la Home o el `HeroSection` pidan descuentos activos volverán a fetchear — lo esperado.

**Redux DevTools**: nada del panel; si el usuario luego navega al Home, ahí sí se dispara `GET /descuentos/activos`.

- [ ] Montaje: 1 GET `/descuentos`
- [ ] Volver desde otra vista admin: 0 requests (cache local)
- [ ] Crear cupón: 1 POST, sin GET posterior
- [ ] Editar cupón: 1 PUT, sin GET posterior
- [ ] Toggle estado: 1 PUT, sin GET posterior
- [ ] Eliminar cupón: 1 DELETE, sin GET posterior
- [ ] Ir después al Home: rehace `GET /descuentos/activos` (el cupón puede haber cambiado)

## Flujo 17 — Admin Órdenes (única vista con refetch)

**Acción**: entrar a `/admin/orders`.

**Network esperado al montar** (primera vez en la sesión):
| Llamado | Método | Cuántas veces | Notas |
|---|---|---|---|
| `/api/ordenes` | GET | 1 | `useOrdenes()` **sin userId** → key `'all'` → endpoint `/ordenes` (no `/ordenes/usuario/{id}`). Cache en el hook. |

**Cambiar de tab (PENDIENTE / CONFIRMADA / ENTREGADA / CANCELADA)**: filtra en memoria — **0 requests**.

**Ver detalle de una orden** (panel lateral): 0 requests — usa la orden ya en cache (`useOrden` mira las listas cacheadas antes de fetchear).

**Confirmar / Cancelar orden** (SOLO para estado PENDIENTE) — **este es el único flujo del panel admin que refetchea la lista**:
| Acción | Método | URL | Refetch |
|---|---|---|---|
| Confirmar orden | POST | `/api/ordenes/{id}/confirmar` | **SÍ** — invalida `cachedAllOrders` y llama `load(true)` → 1 GET `/api/ordenes` |
| Cancelar orden | POST | `/api/ordenes/{id}/cancelar` | **SÍ** — ídem |

Justificación (para la defensa): a diferencia de las otras vistas admin, acá no alcanzaría con un update local — el backend puede haber cambiado stock, estado del carrito asociado, etc. El refetch garantiza consistencia. El patrón está en `useOrders.js:99-125`. Es intencional, no un bug.

**Redux DevTools**: nada.

- [ ] Montaje: 1 GET `/ordenes` (o 0 si ya venía cacheada)
- [ ] Cambiar de tab: 0 requests
- [ ] Abrir detalle de una orden: 0 requests
- [ ] Confirmar orden PENDIENTE: 1 POST `/ordenes/{id}/confirmar` + 1 GET `/ordenes` (refetch)
- [ ] Cancelar orden PENDIENTE: 1 POST `/ordenes/{id}/cancelar` + 1 GET `/ordenes` (refetch)

## Flujo 18 — Admin Usuarios

**Acción**: entrar a `/admin/users`.

**Network esperado al montar**:
| Llamado | Método | Cuántas veces | Notas |
|---|---|---|---|
| `/api/usuarios` | GET | 1 | Cache local `cachedUsers` en la vista |

**Buscar / filtrar por rol (TODOS / ADMIN / CLIENTE)**: filtro en memoria — **0 requests**.

**Acciones**:
| Acción | Método | URL | Refetch |
|---|---|---|---|
| Nuevo usuario | POST | `/api/usuarios` | No — update local + cache |
| Editar usuario | PUT | `/api/usuarios/{id}` | No — ídem. Si el campo `password` viene vacío en edición, se elimina del payload |
| Eliminar usuario | DELETE | `/api/usuarios/{id}` | No — ídem |

**Redux DevTools**: nada.

- [ ] Montaje: 1 GET `/usuarios`
- [ ] Buscar por nombre o filtrar por rol: 0 requests
- [ ] Crear usuario: 1 POST, sin GET
- [ ] Editar usuario sin cambiar password: 1 PUT sin `password` en el body
- [ ] Eliminar usuario: 1 DELETE, sin GET

## Flujo 19 — Admin Mensajes de Contacto (solo lectura)

**Acción**: entrar a `/admin/contacto`.

**Network esperado al montar**:
| Llamado | Método | Cuántas veces | Notas |
|---|---|---|---|
| `/api/contacto` | GET | 1 | Cache local `cachedMensajes` en la vista |

**Ver un mensaje** (click en fila): 0 requests — selección local.

**Botón "Actualizar"**: 1 GET `/api/contacto` (llama a `load(true)`, bypass del cache).

Esta vista **no tiene** POST/PUT/DELETE — los mensajes solo se leen. El POST público (`enviarContacto`) lo dispara el formulario público en `/contacto`.

**Redux DevTools**: nada.

- [ ] Montaje: 1 GET `/contacto`
- [ ] Seleccionar un mensaje: 0 requests
- [ ] Botón "Actualizar": 1 GET `/contacto` (force refresh)

---

## Cheat sheet — Panel admin en una tabla

| Vista | GETs al montar | Refetch después de mutar | Cache |
|---|---|---|---|
| Dashboard | `/admin/dashboard` | — (solo botón Reintentar) | Módulo vista |
| Catálogo | `/categorias`, `/marcas` | No (update local + invalidación de módulo) | `productService` |
| Productos | `/productos/admin`, `/variantes`, `/fotos` | No | `productService` |
| Variantes | `/productos/admin`, `/variantes`, `/fotos` | No (batch PUT solo dirty) | `productService` |
| Fotos | `/productos/admin`, `/variantes` (y `/fotos/variante/{id}` al elegir) | No | `productService` |
| Descuentos | `/descuentos` | No (invalida `activeDiscountsPromise`) | Módulo vista |
| **Órdenes** | `/ordenes` | **SÍ — `GET /ordenes` tras confirmar/cancelar** | Hook `useOrdenes` |
| Usuarios | `/usuarios` | No | Módulo vista |
| Contacto | `/contacto` | — (solo lectura) | Módulo vista |

Reglas generales:
- Todos los caches se **vacían** en `auth:logout` y `auth:login`, así que el primer render de cada vista tras loguearse siempre pega 1 vez al backend.
- Ninguna vista admin despacha al Redux store — todo pasa por hooks o state local. Si Redux DevTools muestra actions durante una acción admin, es de `auth` o de otra pestaña.
- Órdenes es la **única excepción** al patrón "no refetch": es intencional para garantizar consistencia post-cambio de estado.

---

## Nota final

- **No existe un flujo de "cajas"** en este proyecto (eso era de otro grupo) — los flujos listados arriba son todos los que hacen llamados a la API.
- Si un llamado aparece **dos veces idénticas al montar una página en dev** y una sola con `npm run build && npm run preview`, es StrictMode (ver arriba) — pero reportalo igual, porque en este proyecto los guards deberían evitarlo incluso en dev.
- Herramienta extra: los logs del backend (`spring.jpa.show-sql` en el perfil dev) muestran cada query — si la pestaña Network se ve bien pero el backend loguea consultas repetidas, también vale anotarlo.
