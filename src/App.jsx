import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { navigateSilent } from './store/navigationSlice.js'

// Layout
import Navbar  from './components/Navbar.jsx'
import Footer  from './components/Footer.jsx'
import Toast   from './components/ui/Toast.jsx'

// Landing sections
import HeroSection from './components/HeroSection.jsx'
import Categories  from './components/Categories.jsx'
import Featured    from './components/Featured.jsx'

// Public views
import Login           from './views/Login.jsx'
import Registro        from './views/Registro.jsx'
import Catalogo        from './views/Catalogo.jsx'
import ProductoDetalle from './views/ProductoDetalle.jsx'
import Carrito         from './views/Carrito.jsx'
import Checkout        from './views/Checkout.jsx'
import Contacto        from './views/Contacto.jsx'
import FAQ             from './views/FAQ.jsx'
import Perfil          from './views/Perfil.jsx'
import GuiaTallas      from './views/GuiaTallas.jsx'

// Admin views
import AdminLayout    from './views/admin/AdminLayout.jsx'
import AdminDashboard from './views/admin/AdminDashboard.jsx'
import AdminProducts  from './views/admin/AdminProducts.jsx'
import AdminPhotos    from './views/admin/AdminPhotos.jsx'

// ─── Landing page ──────────────────────────────────────────────────────────
function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <Categories />
        <Featured />
      </main>
      <Footer />
    </>
  )
}

// ─── Layout con navbar + footer para vistas de catálogo ────────────────────
function ShellPage({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}

// ─── Admin placeholder ──────────────────────────────────────────────────────
function AdminPlaceholder({ view }) {
  const label = view.replace('admin-', '').replace(/-/g, ' ')
  return (
    <div className="bg-white border border-rock/10 p-10 text-center">
      <div className="font-display font-black tracking-tightest uppercase text-2xl mb-2 capitalize">{label}</div>
      <div className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/55">Próximamente</div>
    </div>
  )
}

const ADMIN_VIEWS = ['admin-dashboard', 'admin-products', 'admin-photos', 'admin-discounts', 'admin-orders', 'admin-users']

// ─── Router ────────────────────────────────────────────────────────────────
export default function App() {
  const dispatch = useDispatch()
  const view     = useSelector((s) => s.navigation.currentView)

  // Scroll to top on every view change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view])

  // Sync browser history ↔ Redux navigation
  useEffect(() => {
    // Stamp the initial history entry so popstate always has a state object
    const initialPath = view === 'home' ? '/' : `/${view}`
    window.history.replaceState({ view, params: {} }, '', initialPath)

    const handlePopState = (e) => {
      const histView   = e.state?.view   || 'home'
      const histParams = e.state?.params || {}
      dispatch(navigateSilent({ view: histView, params: histParams }))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [dispatch]) // dispatch es estable; el listener se registra una sola vez

  const isAdmin = ADMIN_VIEWS.includes(view)

  // Admin panel — sin Navbar ni Footer públicos
  if (isAdmin) {
    return (
      <>
        <Toast />
        <AdminLayout>
          {view === 'admin-dashboard' && <AdminDashboard />}
          {view === 'admin-products'  && <AdminProducts />}
          {view === 'admin-photos'    && <AdminPhotos />}
          {['admin-discounts', 'admin-orders', 'admin-users'].includes(view) && (
            <AdminPlaceholder view={view} />
          )}
        </AdminLayout>
      </>
    )
  }

  // Vistas sin Navbar/Footer
  if (view === 'login')    return <><Toast /><Login /></>
  if (view === 'registro') return <><Toast /><Registro /></>

  // Vistas con Navbar + Footer
  return (
    <div className="bg-rock min-h-screen">
      <Toast />
      {view === 'home' && <LandingPage />}

      {view === 'indumentaria' && <ShellPage><Catalogo categoria="indumentaria" /></ShellPage>}
      {view === 'calzado'      && <ShellPage><Catalogo categoria="calzado" /></ShellPage>}
      {view === 'equipamiento' && <ShellPage><Catalogo categoria="equipamiento" /></ShellPage>}
      {/* Redirige la URL legacy /accesorios a equipamiento sin romper nada */}
      {view === 'accesorios'   && <ShellPage><Catalogo categoria="equipamiento" /></ShellPage>}
      {view === 'producto'     && <ShellPage><ProductoDetalle /></ShellPage>}
      {view === 'carrito'      && <ShellPage><Carrito /></ShellPage>}
      {view === 'checkout'     && <Checkout />}
      {view === 'contacto'     && <ShellPage><Contacto /></ShellPage>}
      {view === 'faq'          && <ShellPage><FAQ /></ShellPage>}
      {view === 'perfil'       && <ShellPage><Perfil /></ShellPage>}
      {view === 'guia-tallas'  && <ShellPage><GuiaTallas /></ShellPage>}

      {/* Fallback a home si la vista no está registrada */}
      {!['home','indumentaria','calzado','equipamiento','accesorios','producto','carrito','checkout','contacto','faq','perfil','guia-tallas'].includes(view) && (
        <LandingPage />
      )}
    </div>
  )
}
