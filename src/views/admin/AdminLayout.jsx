import {
  Mountain, LayoutDashboard, Package, Layers, Sliders,
  Ticket, ClipboardList, Users, Plus, LogOut, ChevronRight,
} from 'lucide-react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { ProductsProvider } from '../../context/ProductsContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import Button from '../../components/ui/Button.jsx'

const ADMIN_NAV = [
  { path: '/admin/dashboard',  label: 'Tablero',    Icon: LayoutDashboard },
  { path: '/admin/productos',  label: 'Productos',  Icon: Package },
  { path: '/admin/variantes',  label: 'Variantes',  Icon: Sliders },
  { path: '/admin/catalogo',   label: 'Catálogo',   Icon: Layers },
  { path: '/admin/descuentos', label: 'Descuentos', Icon: Ticket },
  { path: '/admin/ordenes',    label: 'Órdenes',    Icon: ClipboardList },
  { path: '/admin/usuarios',   label: 'Usuarios',   Icon: Users },
]

const VIEW_LABELS = {
  'dashboard':  'Tablero',
  'productos':  'Productos',
  'variantes':  'Variantes',
  'catalogo':   'Catálogo',
  'descuentos': 'Descuentos',
  'ordenes':    'Órdenes',
  'usuarios':   'Usuarios',
  'fotos':      'Imágenes',
}

function weekdayDate() {
  return new Date().toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default function AdminLayout() {
  const navigate        = useNavigate()
  const { pathname }    = useLocation()
  const { logout }      = useAuth()

  // Obtiene el último segmento de la ruta para el label del header
  const currentSegment  = pathname.split('/').pop()
  const currentLabel    = VIEW_LABELS[currentSegment] ?? VIEW_LABELS[pathname.split('/')[2]] ?? 'Tablero'

  return (
    <ProductsProvider>
      <div className="bg-ivory text-rock h-screen overflow-hidden flex">

        {/* ── Sidebar ── */}
        <aside className="w-64 shrink-0 bg-rock text-ivory flex flex-col overflow-y-auto">

          {/* Brand */}
          <div className="px-6 py-6 border-b border-ivory/10 shrink-0">
            <NavLink to="/admin/dashboard" className="flex items-center gap-2.5 group">
              <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-alpenglow text-ivory">
                <Mountain size={18} strokeWidth={2.2} />
              </span>
              <div className="text-left">
                <div className="font-display font-black tracking-tightest uppercase text-base leading-none">Cumbre</div>
                <div className="font-mono text-[9px] tracking-widest-2 uppercase text-ivory/45 mt-1">
                  Admin · Panel de control
                </div>
              </div>
            </NavLink>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-4 px-3">
            {ADMIN_NAV.map(({ path, label, Icon }) => (
              <NavLink key={path} to={path}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-3 py-2.5 text-left text-[13px] font-narrow font-bold uppercase tracking-widest-2 transition-all rounded-sm mb-0.5 ${
                    isActive ? 'bg-alpenglow text-ivory' : 'text-ivory/70 hover:text-ivory hover:bg-ivory/5'
                  }`
                }>
                {({ isActive }) => (
                  <>
                    <Icon size={14} strokeWidth={2} />
                    {label}
                    {isActive && <span className="ml-auto"><ChevronRight size={12} /></span>}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer CTA */}
          <div className="p-3 border-t border-ivory/10 shrink-0">
            <Button variant="secondary" size="md" className="w-full"
              icon={<Plus size={14} strokeWidth={2.2} />}
              onClick={() => navigate('/admin/productos')}>
              Nuevo producto
            </Button>
            <div className="flex items-center justify-end mt-3 px-2">
              <button onClick={() => { logout(); navigate('/') }}
                className="font-mono text-[10px] tracking-widest-2 uppercase text-ivory/55 hover:text-alpenglow flex items-center gap-1.5">
                <LogOut size={12} /> Salir
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="flex-1 min-w-0 overflow-y-auto flex flex-col">
          <header className="sticky top-0 bg-ivory border-b border-rock/10 z-30 shrink-0">
            <div className="px-8 py-4 flex items-center justify-between">
              <div>
                <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55">{weekdayDate()}</div>
                <h1 className="font-display font-black tracking-tightest uppercase text-2xl mt-0.5">{currentLabel}</h1>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-2 pl-3 border-l border-rock/15 h-10">
                  <span className="h-8 w-8 rounded-full bg-pine text-ivory grid place-items-center font-narrow font-bold text-xs">
                    JP
                  </span>
                  <div className="hidden sm:block">
                    <div className="font-narrow font-bold text-xs uppercase tracking-tight">Juan Pérez</div>
                    <div className="font-mono text-[9px] tracking-widest-2 uppercase text-rock/55">Administrador</div>
                  </div>
                </span>
              </div>
            </div>
          </header>
          <main className="p-8 flex-1"><Outlet /></main>
        </div>
      </div>
    </ProductsProvider>
  )
}
