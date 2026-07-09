# Slice `toast` — notificación "agregado al carrito"

Archivo: `Front/src/store/toastSlice.js` (24 líneas) · Registrado como `toast` en `store/index.js`

## Qué gestiona

La visibilidad de la notificación flotante que aparece cuando se agrega un producto al carrito. Es el slice más chico del proyecto — su valor en la defensa no es el volumen sino **el concepto**: demuestra un extraReducer escuchando una action de otro slice.

## Estado inicial

```js
initialState: { visible: false, productName: null }
```

| Campo | Tipo | Quién lo modifica |
|---|---|---|
| `visible` | boolean | `true` por el extraReducer de `addToCart`; `false` por `hideToast` |
| `productName` | `string \| null` | El extraReducer lo saca de `action.payload.nombre` del `addToCart` |

## Reducers síncronos

| Reducer | Qué hace | Quién lo despacha |
|---|---|---|
| `hideToast` | `visible=false`, `productName=null` | `Toast.jsx:12` (timer de 3 s) y `Toast.jsx:33` (botón ✕) |

## Thunks

**No tiene** — no hay nada asíncrono acá. Si preguntan por el ciclo pending/fulfilled/rejected, referir al cupón de [carrito.md](./carrito.md).

## extraReducers — la parte importante

```js
// toastSlice.js — escucha una action que pertenece al cartSlice
import { addToCart } from './cartSlice.js'

extraReducers(builder) {
  builder.addCase(addToCart, (state, action) => {
    state.visible     = true
    state.productName = action.payload.nombre
  })
}
```

Esto es exactamente para lo que existen los extraReducers más allá de los thunks: **un dispatch, varios slices reaccionando**. Cuando `ProductoDetalle` despacha `addToCart`, esa única action pasa por el reducer raíz y la procesan dos slices a la vez: `cart` agrega el item y `toast` se hace visible. `ProductoDetalle` **nunca despacha nada del toast** — ni sabe que existe.

La dirección de la dependencia importa: `toastSlice` importa la action de `cartSlice` (el toast conoce al carrito), nunca al revés. El carrito no sabe que hay un toast.

## Dónde se usa

- **useSelector**: solo `Toast.jsx:7` — lee `{ visible, productName }` para renderizarse (montado globalmente en `App.jsx:206`, arriba del router, por eso aparece en cualquier página).
- **dispatch**: solo `Toast.jsx` despacha `hideToast` (timer + botón cerrar). A `addToCart` lo despacha `ProductoDetalle.jsx:132`, pero esa action es del slice `cart`.

## Flujo completo narrado

1. `ProductoDetalle.jsx:132`: click en "Agregar al carrito" → `dispatch(addToCart({ nombre: 'Botas Summit Pro', ... }))`.
2. La action `cart/addToCart` llega al store: el reducer de `cart` agrega la línea, y el extraReducer de `toast` setea `visible=true, productName='Botas Summit Pro'`.
3. `Toast.jsx` (siempre montado en `App`) re-renderiza: `visible` pasó a true, muestra la tarjeta con el nombre y la barrita de progreso animada.
4. Su `useEffect` (deps `[visible]`) programa `setTimeout(() => dispatch(hideToast()), 3000)`.
5. A los 3 s (o al click en ✕) → `hideToast` → `visible=false` → el componente devuelve `null`.

```
ProductoDetalle ──dispatch(addToCart)──▶ store
                       ├─▶ cart.items    += línea
                       └─▶ toast.visible = true  ──▶ <Toast/> aparece
                                                        └─ 3s / ✕ ──▶ hideToast ──▶ desaparece
```

## Puntos finos y posibles preguntas trampa

- **El timer no se reinicia si agregás un segundo producto mientras el toast está visible.** El efecto depende de `[visible]`; si `visible` ya era `true`, agregar otro producto cambia `productName` pero no `visible`, el efecto no se re-ejecuta y el timeout original sigue corriendo: el toast puede mostrar el segundo nombre pero cerrarse antes de sus 3 s completos. Comportamiento menor conocido, decidimos no complejizarlo. (Y si se agrega dos veces *el mismo* producto seguido, el estado del toast no cambia en nada y ni re-renderiza.)
- **¿Por qué un slice para esto y no un useState en Navbar/ProductoDetalle?** Porque el evento nace en una vista (`ProductoDetalle`) y la UI vive en otra parte del árbol (`Toast` global en `App`). Con estado local habría que levantar el estado o pasar callbacks; con el extraReducer, el acople es cero: el que agrega al carrito no sabe que existe el toast.
- Fuera de eso, **no tiene más complejidad** — no hay async, no hay persistencia, no hay selectores derivados. No inventarle profundidad que no tiene: su punto fuerte es explicar bien el patrón cross-slice.

## Resumen de 30 segundos

> "El slice `toast` maneja la notificación de 'agregado al carrito': dos campos, `visible` y `productName`, y un solo reducer propio, `hideToast`. Lo interesante es cómo se enciende: no lo despacha ningún componente — tiene un extraReducer que escucha `addToCart`, una action del slice `cart`. Un solo dispatch desde la página de producto y dos slices reaccionan: el carrito agrega el item y el toast se muestra con el nombre del producto. El componente `Toast`, montado globalmente en `App`, lo lee con `useSelector` y lo apaga a los 3 segundos con un timer o con el botón de cerrar. Es el ejemplo del proyecto de que extraReducers no son solo para thunks."
