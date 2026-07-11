import { useEffect, useRef, useCallback, lazy, Suspense } from 'react'
import { Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ArrowRight } from 'lucide-react'
import { authService } from './api/authService.js'
import { sessionRestored, initDone, logout, setReturnTo } from './store/authSlice.js'
import { clearCart, hydrateItems } from './store/cartSlice.js'
import { flushCart, loadBackendCart } from './store/cartBackend.js'
import { useProducts } from './context/ProductsContext.jsx'

// Layout — always needed, load eagerly
import Navbar  from './components/Navbar.jsx'
import Footer  from './components/Footer.jsx'
import Toast   from './components/ui/Toast.jsx'

// Landing sections — always needed on home, load eagerly
import HeroSection from './components/HeroSection.jsx'
import Categories  from './components/Categories.jsx'
import Featured    from './components/Featured.jsx'

// Public views — lazy loaded per route
const Login              = lazy(() => import('./views/Login.jsx'))
const Registro           = lazy(() => import('./views/Registro.jsx'))
const ForgotPassword     = lazy(() => import('./views/ForgotPassword.jsx'))
const ResetPassword      = lazy(() => import('./views/ResetPassword.jsx'))
const Catalogo           = lazy(() => import('./views/Catalogo.jsx'))
const ProductoDetalle    = lazy(() => import('./views/ProductoDetalle.jsx'))
const Carrito            = lazy(() => import('./views/Carrito.jsx'))
const Checkout           = lazy(() => import('./views/Checkout.jsx'))
const Confirmacion       = lazy(() => import('./views/Confirmacion.jsx'))
const Contacto           = lazy(() => import('./views/Contacto.jsx'))
const FAQ                = lazy(() => import('./views/FAQ.jsx'))
const Perfil             = lazy(() => import('./views/Perfil.jsx'))
const GuiaTallas         = lazy(() => import('./views/GuiaTallas.jsx'))
const CuentaOrdenDetalle = lazy(() => import('./views/CuentaOrdenDetalle.jsx'))

// Admin views — lazy loaded, most users never visit these
const AdminLayout    = lazy(() => import('./views/admin/AdminLayout.jsx'))
const AdminDashboard = lazy(() => import('./views/admin/AdminDashboard.jsx'))
const AdminProducts  = lazy(() => import('./views/admin/AdminProducts.jsx'))
const AdminPhotos    = lazy(() => import('./views/admin/AdminPhotos.jsx'))
const AdminVariants  = lazy(() => import('./views/admin/AdminVariants.jsx'))
const AdminOrders    = lazy(() => import('./views/admin/AdminOrders.jsx'))
const AdminDiscounts = lazy(() => import('./views/admin/AdminDiscounts.jsx'))
const AdminUsers     = lazy(() => import('./views/admin/AdminUsers.jsx'))
const AdminCatalog   = lazy(() => import('./views/admin/AdminCatalog.jsx'))
const AdminContacto  = lazy(() => import('./views/admin/AdminContacto.jsx'))

// ─── Restaura sesión y escucha logout automático por 401 ──────────────────
function AuthInit() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    const stored = authService.getStoredUser()
    if (stored && authService.isAuthenticated()) {
      dispatch(sessionRestored(stored))
    } else {
      dispatch(initDone())
    }
  }, [dispatch])

  useEffect(() => {
    const handler = () => {
      dispatch(logout())
      navigate('/login')
    }
    window.addEventListener('auth:logout', handler)
    return () => window.removeEventListener('auth:logout', handler)
  }, [dispatch, navigate])

  return null
}

// ─── Persiste items y cupón en localStorage (solo esas dos porciones) ─────
// Al depender solo de items y coupon, un cambio de toast NO dispara este efecto.
function CartPersist() {
  const items  = useSelector((state) => state.cart.items)
  const coupon = useSelector((state) => state.cart.coupon)

  useEffect(() => {
    try {
      localStorage.setItem('cumbre_cart', JSON.stringify({ items, coupon }))
    } catch {}
  }, [items, coupon])

  return null
}

// ─── Sincroniza el carrito con el backend en los bordes de la sesión ───────
// No toca el backend en cada cambio del carrito: solo vuelca el snapshot cuando
// el usuario "se va" (cambia de pestaña o la cierra), y solo si algo cambió
// desde el último volcado. Al iniciar sesión, recupera el carrito del backend.
// (El volcado en el logout manual lo hace logoutThunk, con el token aún válido.)
function CartBackendSync() {
  const dispatch   = useDispatch()
  const items      = useSelector((state) => state.cart.items)
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn)
  const rol        = useSelector((state) => state.auth.user?.rol)
  const { byId }   = useProducts()

  const itemsRef      = useRef(items)
  const loggedInRef   = useRef(isLoggedIn)
  const rolRef        = useRef(rol)
  const byIdRef       = useRef(byId)
  const lastSyncedRef = useRef(null)   // snapshot serializado de lo último volcado
  itemsRef.current    = items
  loggedInRef.current = isLoggedIn
  rolRef.current      = rol
  byIdRef.current     = byId

  const serialize = (its) =>
    JSON.stringify(its.filter((i) => i.varianteId).map((i) => [i.varianteId, i.qty]))

  const flushIfDirty = useCallback(() => {
    if (!loggedInRef.current) return
    if (rolRef.current === 'ADMIN') return   // el admin no tiene carrito propio
    const snapshot = serialize(itemsRef.current)
    if (snapshot === lastSyncedRef.current) return   // nada cambió desde el último volcado
    lastSyncedRef.current = snapshot
    // Si el volcado falla, se permite reintentar en el próximo "leave".
    flushCart(itemsRef.current).catch(() => { lastSyncedRef.current = null })
  }, [])

  // Vuelca al backend cuando el usuario se va: cambia de pestaña, la minimiza o la cierra.
  useEffect(() => {
    const onVisibility = () => { if (document.visibilityState === 'hidden') flushIfDirty() }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', flushIfDirty)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', flushIfDirty)
    }
  }, [flushIfDirty])

  // Recupera el carrito del backend al iniciar sesión (login/registro frescos).
  // No corre en un refresh (sessionRestored), así no duplica lo que ya hay local.
  useEffect(() => {
    const onLogin = (e) => {
      if (e.detail?.rol === 'ADMIN') return   // el admin no tiene carrito propio
      loadBackendCart()
        .then((backendItems) => {
          if (!backendItems || backendItems.length === 0) return
          const mapped = backendItems.map((it) => ({
            lineId:     `v${it.varianteId}`,
            productId:  it.productoId ?? null,
            varianteId: it.varianteId,
            nombre:     it.productoNombre ?? '',
            precio:     Number(it.precioUnitario ?? 0),
            imagen:     byIdRef.current[it.productoId]?.imagen ?? null,
            talle:      it.varianteTalla ?? null,
            qty:        it.cantidad ?? 1,
          }))
          dispatch(hydrateItems(mapped))
          // El carrito fusionado (local + backend) debe persistirse en el próximo
          // "leave": lo marcamos como sucio para que se vuelva a volcar.
          lastSyncedRef.current = null
        })
        .catch(() => {})
    }
    window.addEventListener('auth:login', onLogin)
    return () => window.removeEventListener('auth:login', onLogin)
  }, [dispatch])

  return null
}

// ─── Limpia el carrito si el usuario que inicia sesión es distinto ─────────
function CartUserCheck() {
  const dispatch = useDispatch()

  useEffect(() => {
    const handler = (e) => {
      const newId    = String(e.detail.id)
      const storedId = localStorage.getItem('cumbre_cart_uid')
      if (storedId && storedId !== newId) {
        dispatch(clearCart())
      }
      localStorage.setItem('cumbre_cart_uid', newId)
    }
    window.addEventListener('auth:login', handler)
    return () => window.removeEventListener('auth:login', handler)
  }, [dispatch])

  return null
}

// ─── Scroll al inicio en cada navegación ──────────────────────────────────
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

// ─── Sección descubrimiento — debajo de Featured ──────────────────────────
function DiscoverSection() {
  const navigate = useNavigate()
  return (
    <section className="py-20 lg:py-24 bg-rock text-ivory">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 text-center">
        <span className="font-mono text-[11px] tracking-widest-2 uppercase text-ivory/45 block mb-5">
          Tienda completa
        </span>
        <h2 className="font-display font-black tracking-tightest uppercase text-4xl lg:text-6xl leading-[0.9] mb-8">
          Descubrí todo<br/>nuestros productos
        </h2>
        <button onClick={() => navigate('/catalogo')}
          className="inline-flex items-center gap-2 bg-alpenglow text-ivory px-8 py-4 font-narrow font-bold uppercase tracking-widest-2 text-sm hover:bg-alpenglow/80 transition-colors">
          Ver catálogo completo
          <ArrowRight size={16} strokeWidth={2.2} />
        </button>
      </div>
    </section>
  )
}

// ─── Landing page ──────────────────────────────────────────────────────────
function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <Categories />
        <Featured />
        <DiscoverSection />
      </main>
      <Footer />
    </>
  )
}

// ─── Layout con Navbar + Footer para vistas públicas ──────────────────────
function ShellLayout() {
  return (
    <>
      <Navbar />
      <main><Outlet /></main>
      <Footer />
    </>
  )
}

// ─── Protección de rutas de cuenta — requiere auth ────────────────────────
function AccountGuard() {
  const { isLoggedIn, initializing } = useSelector((state) => state.auth)
  const dispatch                     = useDispatch()
  const location                     = useLocation()

  useEffect(() => {
    if (!initializing && !isLoggedIn) {
      dispatch(setReturnTo(location.pathname))
    }
  }, [initializing, isLoggedIn, location.pathname, dispatch])

  if (initializing) return <PageLoader />
  if (!isLoggedIn) return <Navigate to="/login" replace />
  return <Outlet />
}

// ─── Protección de rutas admin — requiere rol 'admin' ────────────────────
function AdminGuard() {
  const { isLoggedIn, user, initializing } = useSelector((state) => state.auth)
  if (initializing) return <PageLoader />
  if (!isLoggedIn || user?.rol?.toUpperCase() !== 'ADMIN') {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}

function PageLoader() {
  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center">
      <div className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/40">Cargando…</div>
    </div>
  )
}

// ─── Router ────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div className="bg-rock min-h-screen">
      <AuthInit />
      <CartPersist />
      <CartUserCheck />
      <CartBackendSync />
      <Toast />
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Home */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth — sin Navbar ni Footer */}
          <Route path="/login"           element={<Login />} />
          <Route path="/registro"        element={<Registro />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />

          {/* Checkout y confirmación — sin Navbar ni Footer */}
          <Route path="/checkout"     element={<Checkout />} />
          <Route path="/confirmacion" element={<Confirmacion />} />

          {/* Vistas públicas con Navbar + Footer */}
          <Route element={<ShellLayout />}>
            <Route path="/catalogo"     element={<Catalogo />} />
            <Route path="/producto/:id" element={<ProductoDetalle />} />
            <Route path="/carrito"      element={<Carrito />} />
            <Route path="/contacto"     element={<Contacto />} />
            <Route path="/faq"          element={<FAQ />} />
            <Route path="/guia-tallas"  element={<GuiaTallas />} />

            {/* Rutas de cuenta — requieren auth */}
            <Route element={<AccountGuard />}>
              <Route path="/cuenta/ordenes"     element={<Perfil />} />
              <Route path="/cuenta/ordenes/:id" element={<CuentaOrdenDetalle />} />
            </Route>
          </Route>

          {/* Panel admin — layout anidado bajo /admin, requiere rol admin */}
          <Route path="/admin" element={<AdminGuard />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard"         element={<AdminDashboard />} />
              <Route path="productos"         element={<AdminProducts />} />
              <Route path="productos/:id"     element={<AdminProducts />} />
              <Route path="fotos/:productId"  element={<AdminPhotos />} />
              <Route path="variantes"         element={<AdminVariants />} />
              <Route path="catalogo"          element={<AdminCatalog />} />
              <Route path="descuentos"        element={<AdminDiscounts />} />
              <Route path="ordenes"           element={<AdminOrders />} />
              <Route path="usuarios"          element={<AdminUsers />} />
              <Route path="mensajes"          element={<AdminContacto />} />
            </Route>
          </Route>

          {/* 404 — redirige al home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  )
}
