# Redux Verification Report

## 1. Auditoría del código

### Dependencias
| Check | Resultado |
|-------|-----------|
| `@reduxjs/toolkit` instalado | ✅ `^2.12.0` en `dependencies` |
| `react-redux` instalado | ✅ `^9.3.0` en `dependencies` |

### Store y Provider
| Check | Resultado |
|-------|-----------|
| `configureStore` en `src/store/index.js` | ✅ Correcto |
| `<Provider store={store}>` en `src/main.jsx` | ✅ Envuelve toda la app dentro de `<BrowserRouter>` |

### Slices
| Slice | Archivo | Estado que maneja | Actions expuestas |
|-------|---------|-------------------|-------------------|
| `cart` | `store/cartSlice.js` | `items[]`, `coupon`, `couponError` | `addToCart`, `removeFromCart`, `updateQty`, `setCoupon`, `setCouponError`, `removeCoupon`, `clearCart` + thunk `applyCoupon` |
| `toast` | `store/toastSlice.js` | `visible`, `productName` | `hideToast` (se activa automáticamente vía `extraReducers` al despachar `addToCart`) |
| `auth` | `store/authSlice.js` | `user`, `isLoggedIn`, `status`, `error`, `returnTo`, `initializing` | `sessionRestored`, `initDone`, `logout`, `clearError`, `setReturnTo` + thunks `loginThunk`, `registerThunk` |

### Contextos coexistentes / duplicados
| Check | Resultado |
|-------|-----------|
| `CartContext.jsx` eliminado | ✅ Archivo no existe |
| `AuthContext.jsx` eliminado | ✅ Archivo no existe |
| `grep "CartContext\|AuthContext"` en `src/` | ✅ Cero resultados en archivos de producción |
| `ProductsContext.jsx` mantenido intencionalmente | ✅ Sin duplicación — no fue migrado (decisión documentada) |

### Migración del CartContext
| Check | Resultado |
|-------|-----------|
| Ningún archivo `CartContext.jsx/tsx` remanente | ✅ |
| Ningún componente usa `useContext` para el carrito | ✅ El único `useContext` restante es el de `ProductsContext` (no migrado) |
| Todos los consumidores usan `useSelector`/`useDispatch` | ✅ Verificado en: `Navbar`, `Toast`, `Carrito`, `Checkout`, `ProductoDetalle` |

---

## 2. Corrección del re-render (devolución de la profesora)

### El efecto antes (CartContext.jsx — eliminado)
```js
// State tenía: { items, coupon, couponError, toast }
useEffect(() => {
  if (state === prevRef.current) return
  prevRef.current = state
  localStorage.setItem('cumbre_cart', JSON.stringify({ items: state.items, coupon: state.coupon }))
}, [state])  // ← dependencia al state completo
```
**Problema:** cualquier cambio en `state.toast` (showToast / hideToast) cambiaba la referencia del objeto `state`, disparando el efecto y escribiendo innecesariamente en `localStorage`.

### El efecto después (App.jsx — componente `CartPersist`)
```js
function CartPersist() {
  const items  = useSelector((state) => state.cart.items)
  const coupon = useSelector((state) => state.cart.coupon)

  useEffect(() => {
    try {
      localStorage.setItem('cumbre_cart', JSON.stringify({ items, coupon }))
    } catch {}
  }, [items, coupon])  // ← solo estas dos porciones

  return null
}
```

**Por qué se resuelve:**
- `toast` vive en `toastSlice` — un reducer completamente independiente de `cartSlice`.
- `CartPersist` suscribe su re-render solo a `state.cart.items` y `state.cart.coupon` vía `useSelector`.
- Un `dispatch(hideToast())` actualiza `state.toast` pero `CartPersist` no está suscrito a esa slice → React no re-renderiza el componente → el `useEffect` no se vuelve a ejecutar.
- **Verificación:** el test `NO dispara persistencia cuando cambia el toast` confirma que `localStorage.setItem` no se llama ante un cambio de toast.

---

## 3. Correcciones adicionales durante la auditoría

| Problema encontrado | Corrección |
|---------------------|------------|
| `Login.jsx` tenía `import { authService }` sin usar (import huérfano) | ✅ Eliminado |
| `loadSaved()` no era exportada, imposibilitando tests de rehidratación | ✅ Exportada como `export function loadSaved()` en `cartSlice.js` |

---

## 4. Tests escritos

### `src/store/cartSlice.test.js` — 22 tests unitarios

| Test | Qué valida |
|------|-----------|
| `addToCart > agrega un producto nuevo al carrito vacío con cantidad 1` | Estado inicial vacío + acción add |
| `addToCart > usa varianteId como lineId cuando está presente` | Lógica de key con varianteId |
| `addToCart > usa productId+talle como lineId cuando no hay varianteId` | Lógica de key sin varianteId |
| `addToCart > incrementa la cantidad si el mismo producto ya existe` | No duplicación; suma qty |
| `addToCart > agrega como línea separada si es un producto distinto` | Dos líneas para dos productos |
| `addToCart > respeta qty personalizado al agregar` | Payload con qty > 1 |
| `removeFromCart > elimina el item por su lineId` | Reducer de eliminación |
| `removeFromCart > no afecta otros items cuando elimina uno específico` | Inmutabilidad del resto |
| `updateQty > actualiza la cantidad de un item existente` | Reducer de cantidad |
| `updateQty > elimina el item cuando qty es 0` | Comportamiento límite qty=0 |
| `updateQty > elimina el item cuando qty es negativo` | Comportamiento límite qty<0 |
| `setCoupon / removeCoupon > aplica un cupón y limpia couponError` | setCoupon + limpieza de error |
| `setCoupon / removeCoupon > removeCoupon pone coupon en null` | removeCoupon |
| `clearCart > vacía items, coupon y couponError` | Reset completo del carrito |
| `computeTotals > devuelve totales en cero para carrito vacío` | Edge case vacío |
| `computeTotals > calcula subtotal correctamente con múltiples items` | Aritmética subtotal |
| `computeTotals > total es igual a subtotal` | Descuento=0 (aplica backend) |

### `src/store/cartPersistence.test.jsx` — 7 tests de integración

| Test | Qué valida |
|------|-----------|
| `persiste en localStorage al agregar un item` | CartPersist escribe cuando cambian items |
| `persiste en localStorage al aplicar un cupón` | CartPersist escribe cuando cambia coupon |
| `NO dispara persistencia cuando cambia el toast` | **Corrección de la profesora** — hideToast no escribe localStorage |
| `el JSON persistido contiene exactamente items y coupon` | Forma del dato persistido (sin toast ni couponError) |
| `loadSaved > devuelve estado vacío cuando no hay datos` | Caso vacío |
| `loadSaved > carga items y coupon correctamente` | Rehidratación normal |
| `loadSaved > devuelve estado vacío si el JSON está corrupto` | Resiliencia a localStorage corrupto |

### `src/store/cartComponent.test.jsx` — 6 tests de componente

| Test | Qué valida |
|------|-----------|
| `muestra mensaje de carrito vacío cuando no hay items` | Render estado vacío |
| `muestra los nombres de los productos cargados en el store` | Render de items desde store |
| `muestra el itemCount correcto (3 unidades)` | Totales computados en el render |
| `despacha removeFromCart al hacer click en "Quitar"` | Interacción → dispatch correcto |
| `el state del store se actualiza al eliminar un item` | Efectos en store post-interacción |
| `despacha updateQty al incrementar la cantidad` | Interacción + navigación DOM por qty span |

---

## 5. Output final del test runner

```
 RUN  v4.1.9 C:/Users/terra/TP-APIS-ecommerce-front

 Test Files  3 passed (3)
      Tests  30 passed (30)
   Start at  21:12:03
   Duration  3.24s (transform 268ms, setup 665ms, import 1.45s, tests 237ms, environment 5.68s)
```

**Build de producción:** `✓ built in 5.45s` — sin errores ni warnings.
