# Migración a Redux Toolkit

## 1. Estructura implementada

```
src/store/
├── index.js        — configureStore({ cart, toast, auth })
├── cartSlice.js    — items del carrito + cupón
├── toastSlice.js   — notificación "producto agregado"
└── authSlice.js    — sesión de usuario
```

### cartSlice
**Estado:** `{ items[], coupon, couponError }`
**Acciones síncronas:** `addToCart`, `removeFromCart`, `updateQty`, `setCoupon`, `setCouponError`, `removeCoupon`, `clearCart`
**Thunk asíncrono:** `applyCoupon(code)` — consulta la API de descuentos y despacha `setCoupon` o `setCouponError`
**Utilidad exportada:** `computeTotals(items)` — calcula `{ subtotal, total, discount, itemCount }`

### toastSlice
**Estado:** `{ visible, productName }`
**Acciones:** `hideToast`
**Lógica reactiva:** usa `extraReducers` para escuchar `addToCart` del cartSlice y activar el toast automáticamente, sin que cartSlice sepa nada de toasts.

### authSlice
**Estado:** `{ user, isLoggedIn, status, error, returnTo, initializing }`
**Acciones síncronas:** `sessionRestored`, `initDone`, `logout`, `clearError`, `setReturnTo`
**Thunks asíncronos:** `loginThunk({ username, password })`, `registerThunk({ username, email, password, nombre, apellido })`
**Navegación post-login/register:** se maneja en cada componente que despacha el thunk, usando `loginThunk.fulfilled.match(result)` para detectar éxito.

### Inicialización en App.jsx (tres componentes sin UI)
- `AuthInit` — restaura sesión desde localStorage al montar y escucha el evento `auth:logout` (disparado por el interceptor de axios ante 401) para hacer logout automático.
- `CartPersist` — persiste `items` y `coupon` en localStorage (ver sección 3).
- `CartUserCheck` — escucha `auth:login` para limpiar el carrito si cambia el usuario logueado.

---

## 2. Archivos eliminados, creados y modificados

### Eliminados
| Archivo | Motivo |
|---------|--------|
| `src/context/CartContext.jsx` | Migrado a `cartSlice` + `toastSlice` |
| `src/context/AuthContext.jsx` | Migrado a `authSlice` |

### Creados
| Archivo | Contenido |
|---------|-----------|
| `src/store/index.js` | `configureStore` con los tres reducers |
| `src/store/cartSlice.js` | Lógica del carrito |
| `src/store/toastSlice.js` | Lógica del toast |
| `src/store/authSlice.js` | Lógica de autenticación |
| `REDUX_MIGRATION.md` | Este documento |

### Modificados
| Archivo | Cambio |
|---------|--------|
| `src/main.jsx` | Reemplaza `AuthProvider` + `CartProvider` por `<Provider store={store}>` |
| `src/App.jsx` | Agrega `AuthInit`, `CartPersist`, `CartUserCheck`; reemplaza `useAuth` con `useSelector` en guards |
| `src/components/Navbar.jsx` | `useAuth` → `useSelector`; `logout` → `authService.logout() + dispatch(logout())` |
| `src/components/Footer.jsx` | `useAuth` → `useSelector` |
| `src/components/ui/Toast.jsx` | `useCart` → `useSelector`; `hideToast()` → `dispatch(hideToast())` |
| `src/views/Carrito.jsx` | `useCart` → `useSelector + useDispatch`; acciones envueltas en `dispatch()` |
| `src/views/Checkout.jsx` | `useCart` + `useAuth` → `useSelector + useDispatch` |
| `src/views/ProductoDetalle.jsx` | `useCart` → `useSelector + useDispatch` |
| `src/views/Login.jsx` | `useAuth.login()` → `dispatch(loginThunk(...))` con navegación post-fulfill |
| `src/views/Registro.jsx` | `useAuth.register()` → `dispatch(registerThunk(...))` |
| `src/views/Perfil.jsx` | `useAuth` → `useSelector`; logout con `authService + dispatch` |
| `src/views/admin/AdminLayout.jsx` | `useAuth` → `useSelector`; logout con `authService + dispatch` |
| `src/examples/CheckoutFlow.jsx` | `useAuth` → `useSelector` |

### Sin cambios (decisión deliberada)
| Archivo | Motivo |
|---------|--------|
| `src/context/ProductsContext.jsx` | Ya está correctamente optimizado con `useMemo`. No tiene problemas de re-render ni de performance. Migrar no aporta beneficio y agrega superficie de cambio. |

---

## 3. Corrección del re-render señalado por la profesora

### El problema original

En `CartContext.jsx` el estado era un único objeto plano:
```js
// State en CartContext:
{
  items:       [...],
  coupon:      null,
  couponError: null,
  toast:       { visible: false, productName: null },  // ← PROBLEMA
}
```

El `useEffect` de persistencia dependía del `state` completo:
```js
useEffect(() => {
  if (state === prevRef.current) return
  prevRef.current = state
  localStorage.setItem('cumbre_cart', JSON.stringify({ items: state.items, coupon: state.coupon }))
}, [state])  // ← depende de CUALQUIER cambio en state
```

**Consecuencia:** al despachar `ADD`, el reducer seteaba `toast: { visible: true, ... }` además de agregar el item. Luego, cuando `Toast` despachaba `HIDE_TOAST` tres segundos después, el `state` volvía a cambiar (aunque solo cambiara el campo `toast`). Eso disparaba nuevamente el efecto → una escritura innecesaria a `localStorage` que no escribía nada diferente.

### La solución en Redux

El toast vive ahora en su propio slice completamente independiente (`toastSlice`). El `cartSlice` no tiene ningún campo `toast` en su estado.

La persistencia se hace en el componente `CartPersist` en `App.jsx`:
```jsx
function CartPersist() {
  const items  = useSelector((state) => state.cart.items)
  const coupon = useSelector((state) => state.cart.coupon)

  useEffect(() => {
    localStorage.setItem('cumbre_cart', JSON.stringify({ items, coupon }))
  }, [items, coupon])  // ← solo estas dos porciones

  return null
}
```

**Por qué se resuelve:** `useSelector` suscribe el componente solo a `state.cart.items` y `state.cart.coupon`. Cuando `dispatch(hideToast())` se ejecuta, Redux actualiza `state.toast` — pero `CartPersist` no está suscrito a esa parte del estado. React no re-renderiza `CartPersist`, y el `useEffect` no se vuelve a ejecutar. El localStorage se escribe únicamente cuando cambian los items o el cupón.

---

## 4. Decisiones de diseño

### ¿Por qué separar toast en su propio slice?
Era la raíz del bug: el toast mezclado con el carrito causaba que cualquier acción de UI (mostrar/ocultar notificación) disparara la persistencia. La separación en slices distintos es la solución estructural correcta, no solo un parche de dependencias.

### ¿Por qué no migrar ProductsContext?
- Ya usa `useMemo` en el value y `useCallback` en las funciones expuestas → no tiene re-renders innecesarios.
- Su lógica de carga es async con tres llamadas en paralelo (`productos + variantes + fotos`) y normalización compleja; migrarla a un thunk no reduce complejidad.
- No fue mencionada como fuente de problemas.

### Navegación post-login
En el Context original, `login()` llamaba `navigate()` internamente (acoplamiento de efecto secundario dentro del contexto). En Redux, los thunks no deben llamar navigate porque no tienen acceso al router. La solución es que el componente detecte el resultado del thunk con `loginThunk.fulfilled.match(result)` y navegue desde allí. Esto separa mejor responsabilidades: el thunk maneja datos, el componente maneja navegación.

### Logout
Es una acción síncrona. Los componentes que llaman al logout hacen tres cosas en orden: `authService.logout()` (limpia el token del localStorage), `dispatch(logout())` (limpia el estado Redux), `navigate('/')` (redirige). No es necesario un thunk para esto.
