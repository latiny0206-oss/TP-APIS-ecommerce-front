import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ArrowRight } from 'lucide-react'
import { authService } from './api/authService.js'
import { sessionRestored, initDone, logout, setReturnTo } from './store/authSlice.js'
import { clearCart } from './store/cartSlice.js'

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

  if (initializing) return <PageLoader />
  if (!isLoggedIn) {
    dispatch(setReturnTo(location.pathname))
    return <Navigate to="/login" replace />
  }
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
