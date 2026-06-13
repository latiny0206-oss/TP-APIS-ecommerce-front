import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import {
  Mountain, ShoppingCart, Menu, X, ArrowUpRight, LogOut, UserCircle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { NAV_ITEMS, MARQUEE_ITEMS } from '../data/index.js'

function PromoMarquee() {
  return (
    <div className="relative overflow-hidden bg-pine text-ivory border-b border-rock/10">
      <div className="flex whitespace-nowrap scrolling-marquee py-2.5">
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span key={i} className="flex items-center gap-3 px-6 font-mono text-[11px] tracking-widest-2 uppercase">
            <span className="inline-block w-1 h-1 rounded-full bg-alpenglow" />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

function IconButton({ children, className = '', ...props }) {
  return (
    <button {...props}
      className={`relative h-10 w-10 grid place-items-center rounded-sm text-ivory/85 hover:text-ivory hover:bg-ivory/5 transition-colors ${className}`}>
      {children}
    </button>
  )
}

export default function Navbar() {
  const navigate                         = useNavigate()
  const { pathname }                     = useLocation()
  const [searchParams]                   = useSearchParams()
  const { isLoggedIn, user, logout }     = useAuth()
  const { totals }                       = useCart()
  const cartCount = totals.itemCount

  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled,   setScrolled]   = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isHome = pathname === '/'
  const navBg  = !isHome
    ? 'bg-rock border-b border-ivory/10'
    : scrolled
      ? 'bg-rock/90 backdrop-blur-md border-b border-ivory/10'
      : 'bg-transparent border-b border-ivory/5'

  const isAllProductsActive = pathname === '/catalogo' && !searchParams.get('categoria')
  const isItemActive = (item) =>
    pathname === '/catalogo' && searchParams.get('categoria') === item.categoria

  const closeMobile = () => setMobileOpen(false)

  const goAllProducts = () => {
    navigate('/catalogo')
    closeMobile()
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    closeMobile()
  }

  return (
    <>
      <PromoMarquee />
      <header className={`sticky top-0 z-40 transition-all duration-300 ${navBg}`}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo */}
            <Link to="/" onClick={closeMobile} className="flex items-center gap-2.5 group">
              <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-alpenglow text-ivory">
                <Mountain size={16} strokeWidth={2.2} />
              </span>
              <span className="font-display font-black tracking-tightest text-xl lg:text-[22px] uppercase text-ivory">
                Cumbre
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-9">
              <button onClick={goAllProducts}
                className={`text-[13px] tracking-widest-2 uppercase font-medium link-underline transition-colors ${
                  isAllProductsActive ? 'text-ivory' : 'text-ivory/75 hover:text-ivory'
                }`}>
                Productos
              </button>
              {NAV_ITEMS.map((item) => (
                <Link key={item.label}
                  to={item.to}
                  onClick={closeMobile}
                  className={`text-[13px] tracking-widest-2 uppercase font-medium link-underline transition-colors ${
                    isItemActive(item) ? 'text-ivory' : 'text-ivory/75 hover:text-ivory'
                  }`}>
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Acciones */}
            <div className="flex items-center gap-1 lg:gap-2">

              {/* Auth — desktop */}
              {isLoggedIn ? (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/cuenta/ordenes" onClick={closeMobile}
                    className="flex items-center gap-1.5 font-mono text-[11px] tracking-widest-2 uppercase text-ivory/70 hover:text-ivory transition-colors">
                    <UserCircle size={14} />
                    {user?.nombre?.split(' ')[0]}
                  </Link>
                  <button onClick={handleLogout}
                    className="h-9 flex items-center gap-1.5 px-3 border border-ivory/20 text-ivory/70 hover:text-ivory hover:border-ivory/50 font-mono text-[10px] tracking-widest-2 uppercase transition-colors">
                    <LogOut size={12} /> Salir
                  </button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/login" onClick={closeMobile}
                    className="h-9 flex items-center px-3 border border-ivory/20 text-ivory/70 hover:text-ivory hover:border-ivory/50 font-mono text-[10px] tracking-widest-2 uppercase transition-colors">
                    Iniciar sesión
                  </Link>
                  <Link to="/registro" onClick={closeMobile}
                    className="h-9 flex items-center px-3 bg-alpenglow text-ivory font-mono text-[10px] tracking-widest-2 uppercase hover:bg-alpenglow-700 transition-colors">
                    Registrarse
                  </Link>
                </div>
              )}

              {/* Carrito */}
              <IconButton aria-label="Carrito" onClick={() => { navigate('/carrito'); closeMobile() }}>
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 rounded-full bg-alpenglow text-ivory text-[10px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </IconButton>

              {/* Hamburger */}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="lg:hidden ml-1 h-10 w-10 grid place-items-center rounded-sm border border-ivory/15 hover:bg-ivory/5 text-ivory transition-colors"
                aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`lg:hidden overflow-hidden border-t border-ivory/10 transition-[max-height] duration-500 ease-out ${mobileOpen ? 'max-h-[600px]' : 'max-h-0'}`}>
          <div className="bg-rock-800 px-6 py-6 flex flex-col gap-1">
            <button onClick={goAllProducts}
              className="flex items-center justify-between py-3 border-b border-ivory/5 text-ivory hover:text-alpenglow transition-colors">
              <span className="font-narrow font-bold uppercase tracking-widest-2 text-sm">Productos</span>
              <ArrowUpRight size={16} />
            </button>
            {NAV_ITEMS.map((item) => (
              <Link key={item.label} to={item.to} onClick={closeMobile}
                className="flex items-center justify-between py-3 border-b border-ivory/5 text-ivory hover:text-alpenglow transition-colors">
                <span className="font-narrow font-bold uppercase tracking-widest-2 text-sm">{item.label}</span>
                <ArrowUpRight size={16} />
              </Link>
            ))}

            {/* Auth mobile */}
            <div className="flex gap-2 mt-4">
              {isLoggedIn ? (
                <>
                  <Link to="/cuenta/ordenes" onClick={closeMobile}
                    className="flex-1 flex items-center gap-2 px-3 py-3 border border-ivory/20 text-ivory/70 hover:text-ivory font-mono text-[10px] tracking-widest-2 uppercase transition-colors">
                    <UserCircle size={14} /> {user?.nombre?.split(' ')[0]}
                  </Link>
                  <button onClick={handleLogout}
                    className="flex-1 py-3 border border-ivory/20 text-ivory font-mono text-[10px] tracking-widest-2 uppercase hover:bg-ivory/5 flex items-center justify-center gap-2 transition-colors">
                    <LogOut size={13} /> Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={closeMobile}
                    className="flex-1 py-3 bg-alpenglow text-ivory font-narrow font-bold tracking-widest-2 uppercase text-xs hover:bg-alpenglow-700 transition-colors flex items-center justify-center">
                    Iniciar sesión
                  </Link>
                  <Link to="/registro" onClick={closeMobile}
                    className="flex-1 py-3 border border-ivory/20 text-ivory font-narrow font-bold tracking-widest-2 uppercase text-xs hover:bg-ivory/5 transition-colors flex items-center justify-center">
                    Registrarse
                  </Link>
                </>
              )}
            </div>

            <Link to="/carrito" onClick={closeMobile}
              className="mt-2 w-full py-3 border border-ivory/20 text-ivory font-narrow font-bold tracking-widest-2 uppercase text-xs hover:bg-ivory/5 flex items-center justify-center gap-2 transition-colors">
              <ShoppingCart size={14} /> Carrito ({cartCount})
            </Link>
          </div>
        </div>
      </header>
    </>
  )
}
