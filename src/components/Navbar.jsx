import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Mountain, ShoppingCart, Menu, X, ArrowUpRight, LogOut, UserCircle,
} from 'lucide-react'
import { toggleMobileMenu, closeMobileMenu } from '../store/landingSlice.js'
import { navigate }   from '../store/navigationSlice.js'
import { logout }     from '../store/authSlice.js'
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
  const dispatch   = useDispatch()
  const mobileOpen = useSelector((s) => s.landing.mobileMenuOpen)
  const cartCount  = useSelector((s) => s.cart.items.reduce((n, i) => n + i.qty, 0))
  const { isLoggedIn, user } = useSelector((s) => s.auth)
  const currentView = useSelector((s) => s.navigation.currentView)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Navbar sólido en vistas que no son home
  const isHome = currentView === 'home'
  const navBg = !isHome
    ? 'bg-rock border-b border-ivory/10'
    : scrolled
      ? 'bg-rock/90 backdrop-blur-md border-b border-ivory/10'
      : 'bg-transparent border-b border-ivory/5'

  const go = (view) => {
    dispatch(navigate(view))
    dispatch(closeMobileMenu())
  }

  const handleLogout = () => {
    dispatch(logout())
    dispatch(navigate('home'))
    dispatch(closeMobileMenu())
  }

  return (
    <>
      <PromoMarquee />
      <header className={`sticky top-0 z-40 transition-all duration-300 ${navBg}`}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo */}
            <button onClick={() => go('home')} className="flex items-center gap-2.5 group">
              <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-alpenglow text-ivory">
                <Mountain size={16} strokeWidth={2.2} />
              </span>
              <span className="font-display font-black tracking-tightest text-xl lg:text-[22px] uppercase text-ivory">
                Cumbre
              </span>
            </button>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-9">
              {NAV_ITEMS.map((item) => (
                <button key={item.label}
                  onClick={() => go(item.view)}
                  className={`text-[13px] tracking-widest-2 uppercase font-medium link-underline transition-colors ${
                    currentView === item.view ? 'text-ivory' : 'text-ivory/75 hover:text-ivory'
                  }`}>
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Acciones */}
            <div className="flex items-center gap-1 lg:gap-2">

              {/* Auth — desktop */}
              {isLoggedIn ? (
                <div className="hidden sm:flex items-center gap-2">
                  <button onClick={() => go('perfil')}
                    className="flex items-center gap-1.5 font-mono text-[11px] tracking-widest-2 uppercase text-ivory/70 hover:text-ivory transition-colors">
                    <UserCircle size={14} />
                    {user?.nombre?.split(' ')[0]}
                  </button>
                  <button onClick={handleLogout}
                    className="h-9 flex items-center gap-1.5 px-3 border border-ivory/20 text-ivory/70 hover:text-ivory hover:border-ivory/50 font-mono text-[10px] tracking-widest-2 uppercase transition-colors">
                    <LogOut size={12} /> Salir
                  </button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <button onClick={() => go('login')}
                    className="h-9 flex items-center px-3 border border-ivory/20 text-ivory/70 hover:text-ivory hover:border-ivory/50 font-mono text-[10px] tracking-widest-2 uppercase transition-colors">
                    Iniciar sesión
                  </button>
                  <button onClick={() => go('registro')}
                    className="h-9 flex items-center px-3 bg-alpenglow text-ivory font-mono text-[10px] tracking-widest-2 uppercase hover:bg-alpenglow-700 transition-colors">
                    Registrarse
                  </button>
                </div>
              )}

              {/* Carrito */}
              <IconButton aria-label="Carrito" onClick={() => go('carrito')}>
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 rounded-full bg-alpenglow text-ivory text-[10px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </IconButton>

              {/* Hamburger */}
              <button
                onClick={() => dispatch(toggleMobileMenu())}
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
            {NAV_ITEMS.map((item) => (
              <button key={item.label} onClick={() => go(item.view)}
                className="flex items-center justify-between py-3 border-b border-ivory/5 text-ivory hover:text-alpenglow transition-colors">
                <span className="font-narrow font-bold uppercase tracking-widest-2 text-sm">{item.label}</span>
                <ArrowUpRight size={16} />
              </button>
            ))}

            {/* Auth mobile */}
            <div className="flex gap-2 mt-4">
              {isLoggedIn ? (
                <>
                  <button onClick={() => go('perfil')}
                    className="flex-1 flex items-center gap-2 px-3 py-3 border border-ivory/20 text-ivory/70 hover:text-ivory font-mono text-[10px] tracking-widest-2 uppercase transition-colors">
                    <UserCircle size={14} /> {user?.nombre?.split(' ')[0]}
                  </button>
                  <button onClick={handleLogout}
                    className="flex-1 py-3 border border-ivory/20 text-ivory font-mono text-[10px] tracking-widest-2 uppercase hover:bg-ivory/5 flex items-center justify-center gap-2 transition-colors">
                    <LogOut size={13} /> Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => go('login')}
                    className="flex-1 py-3 bg-alpenglow text-ivory font-narrow font-bold tracking-widest-2 uppercase text-xs hover:bg-alpenglow-700 transition-colors">
                    Iniciar sesión
                  </button>
                  <button onClick={() => go('registro')}
                    className="flex-1 py-3 border border-ivory/20 text-ivory font-narrow font-bold tracking-widest-2 uppercase text-xs hover:bg-ivory/5 transition-colors">
                    Registrarse
                  </button>
                </>
              )}
            </div>

            <button onClick={() => go('carrito')}
              className="mt-2 w-full py-3 border border-ivory/20 text-ivory font-narrow font-bold tracking-widest-2 uppercase text-xs hover:bg-ivory/5 flex items-center justify-center gap-2 transition-colors">
              <ShoppingCart size={14} /> Carrito ({cartCount})
            </button>
          </div>
        </div>
      </header>
    </>
  )
}
