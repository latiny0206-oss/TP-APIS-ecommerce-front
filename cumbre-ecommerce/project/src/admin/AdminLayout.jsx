/* AdminLayout — sidebar nav + topbar; renders children in main area */

const ADMIN_NAV = [
  { id: 'admin-dashboard', label: 'Tablero',     Icon: IconHome },
  { id: 'admin-products',  label: 'Productos',   Icon: IconPackage },
  { id: 'admin-variants',  label: 'Variantes',   Icon: IconLayers },
  { id: 'admin-taxonomies', label: 'Categorías', Icon: IconTag },
  { id: 'admin-discounts', label: 'Descuentos',  Icon: IconTicket },
  { id: 'admin-photos',    label: 'Fotos',       Icon: IconImage },
  { id: 'orders',          label: 'Órdenes',     Icon: IconClipboard },
  { id: 'admin-users',     label: 'Usuarios',    Icon: IconUsers },
];

const AdminLayout = ({ children }) => {
  const dispatch = useDispatch();
  const currentView = useSelector((s) => s.navigation.currentView);
  const user = useSelector((s) => s.auth.user);

  return (
    <div className="bg-ivory text-rock min-h-screen flex">

      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-rock text-ivory flex flex-col sticky top-0 h-screen">
        {/* Brand */}
        <div className="px-6 py-6 border-b border-ivory/10">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-alpenglow text-ivory">
              <IconMountain size={18} stroke={2.2} />
            </span>
            <div>
              <div className="font-display font-black tracking-tightest uppercase text-base leading-none">Cumbre</div>
              <div className="font-mono text-[9px] tracking-widest-2 uppercase text-ivory/45 mt-1">Admin · Technical Gear Control</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-auto py-4 px-3">
          {ADMIN_NAV.map((it) => {
            const active = currentView === it.id;
            return (
              <button key={it.id}
                onClick={() => dispatch(navigate(it.id))}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-[13px] font-narrow font-bold uppercase tracking-widest-2 transition-all
                  ${active ? 'bg-alpenglow text-ivory' : 'text-ivory/70 hover:text-ivory hover:bg-ivory/5'}`}>
                <it.Icon size={14} stroke={2}/>
                {it.label}
                {active && <span className="ml-auto"><IconChevronRight size={12}/></span>}
              </button>
            );
          })}
        </nav>

        {/* CTA */}
        <div className="p-3 border-t border-ivory/10">
          <Button variant="secondary" size="md" className="w-full"
            onClick={() => { dispatch(openProductDrawer()); dispatch(navigate('admin-products')); }}
            icon={<IconPlus size={14} stroke={2.2}/>}>
            Nuevo producto
          </Button>
          <div className="flex items-center justify-between mt-3 px-2">
            <button className="font-mono text-[10px] tracking-widest-2 uppercase text-ivory/55 hover:text-ivory flex items-center gap-1.5">
              <IconSettings size={12}/> Ajustes
            </button>
            <button onClick={() => { dispatch(setRole('cliente')); dispatch(navigate('home')); }}
              className="font-mono text-[10px] tracking-widest-2 uppercase text-ivory/55 hover:text-alpenglow flex items-center gap-1.5">
              <IconLogOut size={12}/> Salir
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 bg-ivory border-b border-rock/10 z-30">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55">
                {weekdayDate()}
              </div>
              <h1 className="font-display font-black tracking-tightest uppercase text-2xl mt-0.5">
                {ADMIN_NAV.find((n) => n.id === currentView)?.label || 'Tablero'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="h-10 w-10 grid place-items-center border border-rock/15 hover:border-rock">
                <IconSearch size={16}/>
              </button>
              <button className="h-10 w-10 grid place-items-center border border-rock/15 hover:border-rock relative">
                <IconClipboard size={16}/>
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-alpenglow text-ivory text-[9px] grid place-items-center font-bold">3</span>
              </button>
              <div className="flex items-center gap-2 pl-3 border-l border-rock/15 h-10">
                <span className="h-8 w-8 rounded-full bg-pine text-ivory grid place-items-center font-narrow font-bold text-xs">
                  {user?.initials || 'JD'}
                </span>
                <div className="hidden sm:block">
                  <div className="font-narrow font-bold text-xs uppercase tracking-tight">{user?.name || 'Admin'}</div>
                  <div className="font-mono text-[9px] tracking-widest-2 uppercase text-rock/55">Operations</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

function weekdayDate() {
  const d = new Date();
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

window.AdminLayout = AdminLayout;
window.weekdayDate = weekdayDate;
