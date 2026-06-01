/* Top promo marquee + sticky Navbar with virtual router links */

const PromoMarquee = () => (
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
);

const Navbar = () => {
  const dispatch = useDispatch();
  const mobileOpen = useSelector((s) => s.ui.mobileMenuOpen);
  const itemCount  = useSelector((s) => s.cart.items.reduce((n, i) => n + i.qty, 0));
  const auth       = useSelector((s) => s.auth);
  const currentView = useSelector((s) => s.navigation.currentView);
  const [scrolled, setScrolled] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => { setProfileOpen(false); }, [currentView]);

  // Use solid bg on non-home pages
  const isHome = currentView === 'home';
  const navBg = !isHome
    ? 'bg-rock border-b border-ivory/10'
    : scrolled ? 'bg-rock/85 backdrop-blur-md border-b border-ivory/10' : 'bg-transparent border-b border-ivory/5';

  const go = (view, params = {}) => dispatch(navigate({ view, params }));

  return (
    <>
      <PromoMarquee />
      <header className={`sticky top-0 z-40 transition-all duration-300 ${navBg}`}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo */}
            <button onClick={() => go('home')} className="flex items-center gap-2.5 group">
              <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-alpenglow text-ivory">
                <IconMountain size={16} stroke={2.2} />
              </span>
              <span className="font-display font-black tracking-tightest text-xl lg:text-[22px] uppercase">Cumbre</span>
            </button>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-9">
              {NAV_ITEMS.map((item) => (
                <button key={item.label} onClick={() => go(item.view, item.params)}
                   className="text-[13px] tracking-widest-2 uppercase font-medium text-ivory/85 hover:text-ivory link-underline transition-colors">
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 lg:gap-2">
              <IconButton onClick={() => go('catalog')}><IconSearch size={18} /></IconButton>

              {/* User / profile */}
              <div className="relative">
                <IconButton
                  className="hidden sm:inline-flex"
                  onClick={() => auth.isLoggedIn ? setProfileOpen((o) => !o) : go('login')}>
                  {auth.isLoggedIn ? (
                    <span className="h-7 w-7 rounded-full bg-pine text-ivory grid place-items-center font-narrow font-bold text-[11px]">
                      {auth.user.initials}
                    </span>
                  ) : <IconUser size={18} />}
                </IconButton>

                {profileOpen && auth.isLoggedIn && (
                  <div className="absolute right-0 mt-2 w-64 bg-rock-800 border border-ivory/15 shadow-2xl fadein">
                    <div className="p-4 border-b border-ivory/10">
                      <div className="font-narrow font-bold uppercase tracking-widest-2 text-sm">{auth.user.name}</div>
                      <div className="font-mono text-[11px] text-ivory/55 mt-1">{auth.user.email}</div>
                    </div>
                    <div className="py-2">
                      {[
                        { label: 'Mi perfil',  Icon: IconUser },
                        { label: 'Mis órdenes', Icon: IconClipboard, view: 'orders' },
                        { label: 'Mi carrito',  Icon: IconCart, view: 'cart' },
                      ].map((it) => (
                        <button key={it.label}
                          onClick={() => it.view && go(it.view)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-ivory/5 text-ivory/85">
                          <it.Icon size={15}/> {it.label}
                        </button>
                      ))}
                    </div>
                    <button onClick={() => { dispatch(logout()); go('home'); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm border-t border-ivory/10 hover:bg-ivory/5 text-alpenglow">
                      <IconLogOut size={15}/> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>

              <IconButton onClick={() => go('cart')}>
                <IconCart size={18} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 rounded-full bg-alpenglow text-ivory text-[10px] font-bold flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </IconButton>
              <button
                onClick={() => dispatch(toggleMobileMenu())}
                className="lg:hidden ml-1 h-10 w-10 grid place-items-center rounded-sm border border-ivory/15 hover:bg-ivory/5"
                aria-label="Menu">
                {mobileOpen ? <IconX size={18} /> : <IconMenu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`lg:hidden overflow-hidden border-t border-ivory/10 transition-[max-height] duration-500 ease-out
          ${mobileOpen ? 'max-h-[500px]' : 'max-h-0'}`}>
          <div className="bg-rock-800 px-6 py-6 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <button key={item.label}
                onClick={() => { go(item.view, item.params); dispatch(closeMobileMenu()); }}
                className="flex items-center justify-between py-3 border-b border-ivory/5 text-ivory hover:text-alpenglow">
                <span className="font-narrow font-bold uppercase tracking-widest-2 text-sm">{item.label}</span>
                <IconArrowUpRight size={16} />
              </button>
            ))}
            <div className="flex gap-2 mt-4">
              {auth.isLoggedIn ? (
                <button
                  onClick={() => { go('orders'); dispatch(closeMobileMenu()); }}
                  className="flex-1 py-3 bg-alpenglow text-ivory font-narrow font-bold tracking-widest-2 uppercase text-xs">
                  Mis órdenes
                </button>
              ) : (
                <button
                  onClick={() => { go('login'); dispatch(closeMobileMenu()); }}
                  className="flex-1 py-3 bg-alpenglow text-ivory font-narrow font-bold tracking-widest-2 uppercase text-xs">
                  Ingresar
                </button>
              )}
              <button
                onClick={() => { go('cart'); dispatch(closeMobileMenu()); }}
                className="flex-1 py-3 border border-ivory/20 font-narrow font-bold tracking-widest-2 uppercase text-xs">
                Carrito ({itemCount})
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

const IconButton = ({ children, className = '', ...props }) => (
  <button {...props}
    className={`relative h-10 w-10 grid place-items-center rounded-sm text-ivory/85 hover:text-ivory hover:bg-ivory/5 transition-colors ${className}`}>
    {children}
  </button>
);

window.Navbar = Navbar;
