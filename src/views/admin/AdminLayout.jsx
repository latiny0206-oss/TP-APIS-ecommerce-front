import { useDispatch, useSelector } from 'react-redux'
import {
  Mountain, LayoutDashboard, Package, Layers, Sliders,
  Ticket, ClipboardList, Users, Plus, Settings, LogOut, ChevronRight,
} from 'lucide-react'
import { navigate } from '../../store/navigationSlice.js'
import { openDrawer } from '../../store/adminSlice.js'
import Button from '../../components/ui/Button.jsx'

// Cambio 6: "Imágenes" está en la sidebar con ícono Image
const ADMIN_NAV = [
  { id: 'admin-dashboard', label: 'Tablero',    Icon: LayoutDashboard },
  { id: 'admin-products',  label: 'Productos',  Icon: Package },
  { id: 'admin-variants',  label: 'Variantes',  Icon: Sliders },
  { id: 'admin-catalog',   label: 'Catálogo',   Icon: Layers },
  { id: 'admin-discounts', label: 'Descuentos', Icon: Ticket },
  { id: 'admin-orders',    label: 'Órdenes',    Icon: ClipboardList },
  { id: 'admin-users',     label: 'Usuarios',   Icon: Users },
]

const VIEW_LABELS = {
  'admin-photos': 'Imágenes',
  ...Object.fromEntries(ADMIN_NAV.map((n) => [n.id, n.label])),
}

function weekdayDate() {
  return new Date().toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default function AdminLayout({ children }) {
  const dispatch     = useDispatch()
  const currentView  = useSelector((s) => s.navigation.currentView)
  const currentLabel = VIEW_LABELS[currentView] ?? 'Tablero'

  return (
    <div className="bg-ivory text-rock min-h-screen flex">

      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 bg-rock text-ivory flex flex-col sticky top-0 h-screen overflow-hidden">

        {/* Brand */}
        <div className="px-6 py-6 border-b border-ivory/10">
          <button
            onClick={() => dispatch(navigate('home'))}
            className="flex items-center gap-2.5 group"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-alpenglow text-ivory">
              <Mountain size={18} strokeWidth={2.2} />
            </span>
            <div className="text-left">
              <div className="font-display font-black tracking-tightest uppercase text-base leading-none">
                Cumbre
              </div>
              <div className="font-mono text-[9px] tracking-widest-2 uppercase text-ivory/45 mt-1">
                Admin · Panel de control
              </div>
            </div>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-auto py-4 px-3">
          {ADMIN_NAV.map(({ id, label, Icon }) => {
            const active = currentView === id
            return (
              <button
                key={id}
                onClick={() => dispatch(navigate(id))}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-[13px] font-narrow font-bold uppercase tracking-widest-2 transition-all rounded-sm mb-0.5
                  ${active
                    ? 'bg-alpenglow text-ivory'
                    : 'text-ivory/70 hover:text-ivory hover:bg-ivory/5'
                  }`}
              >
                <Icon size={14} strokeWidth={2} />
                {label}
                {active && (
                  <span className="ml-auto">
                    <ChevronRight size={12} />
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Footer CTA */}
        <div className="p-3 border-t border-ivory/10">
          <Button
            variant="secondary"
            size="md"
            className="w-full"
            icon={<Plus size={14} strokeWidth={2.2} />}
            onClick={() => {
              dispatch(openDrawer())
              dispatch(navigate('admin-products'))
            }}
          >
            Nuevo producto
          </Button>
          <div className="flex items-center justify-between mt-3 px-2">
            <button className="font-mono text-[10px] tracking-widest-2 uppercase text-ivory/55 hover:text-ivory flex items-center gap-1.5">
              <Settings size={12} /> Ajustes
            </button>
            <button
              onClick={() => dispatch(navigate('home'))}
              className="font-mono text-[10px] tracking-widest-2 uppercase text-ivory/55 hover:text-alpenglow flex items-center gap-1.5"
            >
              <LogOut size={12} /> Salir
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 min-w-0">

        {/* Topbar */}
        <header className="sticky top-0 bg-ivory border-b border-rock/10 z-30">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55">
                {weekdayDate()}
              </div>
              <h1 className="font-display font-black tracking-tightest uppercase text-2xl mt-0.5">
                {currentLabel}
              </h1>
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

        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}
