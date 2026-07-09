# Índice de slices — para repartir la defensa

El store (`Front/src/store/index.js`) combina exactamente **3 slices**:

```js
export const store = configureStore({
  reducer: {
    cart:  cartReducer,   // carrito + cupón
    toast: toastReducer,  // notificación "agregado al carrito"
    auth:  authReducer,   // sesión de usuario
  },
})
```

| Slice | Archivo de estudio | Qué gestiona | Dificultad para defender |
|---|---|---|---|
| `cart` | [carrito.md](./carrito.md) | Items del carrito (100% local hasta el checkout), cupón de descuento con su thunk `applyCoupon`, totales con selector memoizado, persistencia en localStorage | **Alta** — es el slice más rico: único con thunk + reducers síncronos + selector + persistencia. Acá se explica en detalle el patrón thunk/extraReducers/status que los demás referencian |
| `auth` | [auth.md](./auth.md) | Sesión: usuario logueado, thunks `loginThunk` y `registerThunk`, restauración de sesión, guards de rutas, flujo `returnTo` | **Media-alta** — dos thunks, el token vive FUERA de Redux (pregunta trampa clásica), estados no canónicos (`'registered'`, `'error'`) |
| `toast` | [toast.md](./toast.md) | Visibilidad de la notificación al agregar al carrito | **Baja** — pero tiene la perla conceptual del proyecto: un extraReducer que escucha una action de OTRO slice |

## Ojo: lo que NO es un slice (y van a preguntar)

- **Productos/variantes/fotos no están en Redux**: viven en `ProductsContext` (`Front/src/context/ProductsContext.jsx`, Context + `useReducer`). Quien defienda `cart` tiene que saber esto porque el carrito valida stock leyendo del Context. Justificación: catálogo = estado de solo-lectura compartido; Redux quedó para el estado que muta con la interacción (carrito, sesión, toast).
- **No existe slice de "cajas"** — eso era de otro proyecto.
- Los descuentos activos de la home tampoco pasan por Redux: cache de promesa a nivel módulo en `discountService.js`.

## Sugerencia de reparto

- La persona más sólida → `cart` (más superficie de preguntas, incluye el patrón compartido).
- Segunda → `auth` (trampas del token y de los estados).
- Tercera → `toast` + el argumento de "por qué productos no está en Redux" (poco volumen, así puede cubrir también las generales del store).
