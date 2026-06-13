import { useEffect, lazy, Suspense } from 'react'
import { ArrowRight } from 'lucide-react'
import { useNavigation } from './context/NavigationContext.jsx'

// Layout — always needed, load eagerly
import Navbar  from './components/Navbar.jsx'
import Footer  from './components/Footer.jsx'
import Toast   from './components/ui/Toast.jsx'

// Landing sections — always needed on home, load eagerly
import HeroSection from './components/HeroSection.jsx'
import Categories  from './components/Categories.jsx'
import Featured    from './components/Featured.jsx'

// Public views — lazy loaded per route
const Login           = lazy(() => import('./views/Login.jsx'))
const Registro        = lazy(() => import('./views/Registro.jsx'))
const Catalogo        = lazy(() => import('./views/Catalogo.jsx'))
const ProductoDetalle = lazy(() => import('./views/ProductoDetalle.jsx'))
const Carrito         = lazy(() => import('./views/Carrito.jsx'))
const Checkout        = lazy(() => import('./views/Checkout.jsx'))
const Contacto        = lazy(() => import('./views/Contacto.jsx'))
const FAQ             = lazy(() => import('./views/FAQ.jsx'))
const Perfil          = lazy(() => import('./views/Perfil.jsx'))
const GuiaTallas      = lazy(() => import('./views/GuiaTallas.jsx'))

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

// ─── Sección descubrimiento — debajo de Featured ──────────────────────────
function DiscoverSection() {
  const { navigate } = useNavigation()
  const goAll = () => {
    sessionStorage.removeItem('catalogoState')
    sessionStorage.removeItem('catalogoReturnFilters')
    navigate('catalogo')
  }
  return (
    <section className="py-20 lg:py-24 bg-rock text-ivory">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 text-center">
        <span className="font-mono text-[11px] tracking-widest-2 uppercase text-ivory/45 block mb-5">
          Tienda completa
        </span>
        <h2 className="font-display font-black tracking-tightest uppercase text-4xl lg:text-6xl leading-[0.9] mb-8">
          Descubrí todo<br/>nuestros productos
        </h2>
        <button onClick={goAll}
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

const ADMIN_VIEWS = ['admin-dashboard', 'admin-products', 'admin-photos', 'admin-variants', 'admin-catalog', 'admin-discounts', 'admin-orders', 'admin-users']

function PageLoader() {
  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center">
      <div className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/40">Cargando…</div>
    </div>
  )
}

// ─── Router ────────────────────────────────────────────────────────────────
export default function App() {
  const { view, params } = useNavigation()

  // Scroll to top on every view change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view])

  const isAdmin = ADMIN_VIEWS.includes(view)

  // Admin panel — sin Navbar ni Footer públicos
  if (isAdmin) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Toast />
        <AdminLayout>
          {view === 'admin-dashboard' && <AdminDashboard />}
          {view === 'admin-products'  && <AdminProducts />}
          {view === 'admin-photos'    && <AdminPhotos />}
          {view === 'admin-variants'  && <AdminVariants />}
          {view === 'admin-orders'    && <AdminOrders />}
          {view === 'admin-catalog'   && <AdminCatalog />}
          {view === 'admin-discounts' && <AdminDiscounts />}
          {view === 'admin-users'     && <AdminUsers />}
        </AdminLayout>
      </Suspense>
    )
  }

  // Vistas sin Navbar/Footer
  if (view === 'login')    return <Suspense fallback={<PageLoader />}><Toast /><Login /></Suspense>
  if (view === 'registro') return <Suspense fallback={<PageLoader />}><Toast /><Registro /></Suspense>

  // Vistas con Navbar + Footer
  return (
    <div className="bg-rock min-h-screen">
      <Toast />
      {view === 'home' && <LandingPage />}

      <Suspense fallback={<PageLoader />}>
        {view === 'catalogo' && (
          <ShellPage>
            <Catalogo key={params.categoria ?? '__all__'} />
          </ShellPage>
        )}
        {view === 'producto'     && <ShellPage><ProductoDetalle /></ShellPage>}
        {view === 'carrito'      && <ShellPage><Carrito /></ShellPage>}
        {view === 'checkout'     && <Checkout />}
        {view === 'contacto'     && <ShellPage><Contacto /></ShellPage>}
        {view === 'faq'          && <ShellPage><FAQ /></ShellPage>}
        {view === 'perfil'       && <ShellPage><Perfil /></ShellPage>}
        {view === 'guia-tallas'  && <ShellPage><GuiaTallas /></ShellPage>}

        {/* Fallback a home si la vista no está registrada */}
        {!['home','catalogo','producto','carrito','checkout','contacto','faq','perfil','guia-tallas'].includes(view) && (
          <LandingPage />
        )}
      </Suspense>
    </div>
  )
}
