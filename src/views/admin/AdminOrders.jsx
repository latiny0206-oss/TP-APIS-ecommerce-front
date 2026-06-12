import { useState } from 'react'
import { X, Check, Ban, Package, ChevronRight } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import { fmtPrice } from '../../mocks/data.js'

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'PENDIENTE',  label: 'Pendientes' },
  { key: 'CONFIRMADA', label: 'Confirmadas' },
  { key: 'ENTREGADA',  label: 'Entregadas' },
  { key: 'CANCELADA',  label: 'Canceladas' },
]

const STATUS_STYLES = {
  PENDIENTE:  'bg-alpenglow/15 text-alpenglow border-alpenglow/30',
  CONFIRMADA: 'bg-pine/15 text-pine border-pine/30',
  ENTREGADA:  'bg-pine/25 text-pine border-pine/40',
  CANCELADA:  'bg-red-50 text-red-700 border-red-200',
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const INITIAL_ORDERS = [
  {
    id: '#ORD-10298',
    cliente: { nombre: 'Carlos Mendoza', iniciales: 'CM', email: 'carlos@test.com' },
    fecha: '2026-05-18',
    estado: 'PENDIENTE',
    items: [
      { nombre: 'Chaqueta Hardshell Cumbre Pro', talle: 'L',  qty: 1, precio: 129990 },
      { nombre: 'Pantalón Trekking Strider',      talle: '32', qty: 1, precio: 89990  },
    ],
    total: 219980,
    envio: 'Estándar · CABA',
    metodoPago: 'Tarjeta de crédito',
  },
  {
    id: '#ORD-10299',
    cliente: { nombre: 'Ana García', iniciales: 'AG', email: 'ana@test.com' },
    fecha: '2026-05-20',
    estado: 'PENDIENTE',
    items: [
      { nombre: 'Mochila Expedition 40L',   talle: 'Único', qty: 1, precio: 149990 },
      { nombre: 'Linterna Frontal 500 lm',  talle: 'Único', qty: 2, precio: 34990  },
    ],
    total: 219970,
    envio: 'Express · Rosario',
    metodoPago: 'MercadoPago',
  },
  {
    id: '#ORD-10295',
    cliente: { nombre: 'Sofía Mendieta', iniciales: 'SM', email: 'sofia@test.com' },
    fecha: '2026-05-14',
    estado: 'PENDIENTE',
    items: [
      { nombre: 'Bota Invierno Thermal -20°C', talle: '39', qty: 1, precio: 159990 },
    ],
    total: 159990,
    envio: 'Express · Neuquén',
    metodoPago: 'Transferencia bancaria',
  },
  {
    id: '#ORD-10289',
    cliente: { nombre: 'Martín Silva', iniciales: 'MS', email: 'martin@test.com' },
    fecha: '2026-05-10',
    estado: 'CONFIRMADA',
    items: [
      { nombre: 'Bota Summit GTX High', talle: '42', qty: 1, precio: 189990 },
    ],
    total: 189990,
    envio: 'Estándar · Córdoba',
    metodoPago: 'Transferencia bancaria',
  },
  {
    id: '#ORD-10285',
    cliente: { nombre: 'Lucía Torres', iniciales: 'LT', email: 'lucia@test.com' },
    fecha: '2026-05-06',
    estado: 'CONFIRMADA',
    items: [
      { nombre: 'Bastones Plegables Carbon Z',      talle: 'Único', qty: 1, precio: 89990 },
      { nombre: 'Guantes Escalada Dedo Completo',   talle: 'M',     qty: 1, precio: 49990 },
    ],
    total: 139980,
    envio: 'Express · Mendoza',
    metodoPago: 'Tarjeta de débito',
  },
  {
    id: '#ORD-10270',
    cliente: { nombre: 'Iván Vargas', iniciales: 'IV', email: 'ivan@test.com' },
    fecha: '2026-04-28',
    estado: 'ENTREGADA',
    items: [
      { nombre: 'Zapatilla Trail Running Pro', talle: '41', qty: 1, precio: 129990 },
      { nombre: 'Base Layer Merino 200',        talle: 'M',  qty: 2, precio: 59990  },
    ],
    total: 249970,
    envio: 'Estándar · Buenos Aires',
    metodoPago: 'MercadoPago',
  },
  {
    id: '#ORD-10265',
    cliente: { nombre: 'Sofía Mendieta', iniciales: 'SM', email: 'sofia@test.com' },
    fecha: '2026-04-20',
    estado: 'ENTREGADA',
    items: [
      { nombre: 'Fleece Midlayer Polartec', talle: 'S', qty: 1, precio: 109990 },
    ],
    total: 109990,
    envio: 'Express · CABA',
    metodoPago: 'Tarjeta de crédito',
  },
  {
    id: '#ORD-10258',
    cliente: { nombre: 'Luis Torres', iniciales: 'LT', email: 'luis@test.com' },
    fecha: '2026-04-15',
    estado: 'CANCELADA',
    items: [
      { nombre: 'Gafas Montaña UV400 Cat.4', talle: 'Único', qty: 1, precio: 79990 },
    ],
    total: 79990,
    envio: 'Estándar · Tucumán',
    metodoPago: 'Transferencia bancaria',
  },
  {
    id: '#ORD-10251',
    cliente: { nombre: 'Carlos Mendoza', iniciales: 'CM', email: 'carlos@test.com' },
    fecha: '2026-04-08',
    estado: 'CANCELADA',
    items: [
      { nombre: 'Cortaviento Ultralight', talle: 'XL', qty: 1, precio: 79990 },
      { nombre: 'Sandalia Trekking Amphibian', talle: '42', qty: 1, precio: 69990 },
    ],
    total: 149980,
    envio: 'Express · CABA',
    metodoPago: 'MercadoPago',
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusChip({ status }) {
  return (
    <span className={`inline-flex items-center font-mono text-[9px] tracking-widest-2 uppercase px-2 py-1 border ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  )
}

function OrderDetail({ order, onClose, onConfirm, onCancel }) {
  const isPendiente = order.estado === 'PENDIENTE'

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-rock/60 z-40 fadein" onClick={onClose} />

      {/* Drawer */}
      <aside className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-ivory text-rock z-50 shadow-2xl flex flex-col fadein">

        {/* Header */}
        <header className="flex items-center justify-between p-5 border-b border-rock/10">
          <div>
            <div className="font-mono text-[10px] tracking-widest-2 uppercase text-alpenglow">
              Detalle de orden
            </div>
            <h2 className="font-display font-black tracking-tightest uppercase text-xl mt-0.5">
              {order.id}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 grid place-items-center border border-rock/15 hover:bg-rock/5 transition-colors"
          >
            <X size={16} />
          </button>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-auto p-5 space-y-4">

          {/* Status + date */}
          <div className="flex items-center justify-between">
            <StatusChip status={order.estado} />
            <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/50">
              {new Date(order.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          {/* Client */}
          <div className="bg-rock/[0.03] border border-rock/10 p-4">
            <div className="font-mono text-[9px] tracking-widest-2 uppercase text-rock/40 mb-2.5">Cliente</div>
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-full bg-pine text-ivory grid place-items-center font-narrow font-bold text-[11px] shrink-0">
                {order.cliente.iniciales}
              </span>
              <div>
                <div className="font-narrow font-bold text-sm uppercase tracking-tight leading-tight">
                  {order.cliente.nombre}
                </div>
                <div className="font-mono text-[10px] text-rock/50 mt-0.5">{order.cliente.email}</div>
              </div>
            </div>
          </div>

          {/* Shipping + payment */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-rock/[0.03] border border-rock/10 p-3">
              <div className="font-mono text-[9px] tracking-widest-2 uppercase text-rock/40 mb-1">Envío</div>
              <div className="font-narrow font-bold text-xs uppercase tracking-tight">{order.envio}</div>
            </div>
            <div className="bg-rock/[0.03] border border-rock/10 p-3">
              <div className="font-mono text-[9px] tracking-widest-2 uppercase text-rock/40 mb-1">Pago</div>
              <div className="font-narrow font-bold text-xs uppercase tracking-tight">{order.metodoPago}</div>
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="font-mono text-[9px] tracking-widest-2 uppercase text-rock/40 mb-2">
              Productos · {order.items.length} {order.items.length === 1 ? 'artículo' : 'artículos'}
            </div>
            <ul className="border border-rock/10 divide-y divide-rock/10">
              {order.items.map((item, i) => (
                <li key={i} className="flex items-start gap-3 p-3">
                  <span className="h-7 w-7 bg-rock/[0.05] grid place-items-center shrink-0 mt-0.5">
                    <Package size={12} className="text-rock/35" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-narrow font-bold text-xs uppercase tracking-tight leading-tight truncate">
                      {item.nombre}
                    </div>
                    <div className="font-mono text-[9px] text-rock/45 mt-0.5">
                      Talle: {item.talle} · Cant.: {item.qty}
                    </div>
                  </div>
                  <div className="font-mono text-xs font-bold shrink-0 tabular-nums">
                    {fmtPrice(item.precio * item.qty)}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between py-2 border-t-2 border-rock/10">
            <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55">Total</span>
            <span className="font-display font-black tracking-tightest text-2xl tabular-nums">
              {fmtPrice(order.total)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-rock/10 p-5 flex gap-3">
          {isPendiente ? (
            <>
              <Button
                variant="danger"
                size="md"
                className="flex-1"
                icon={<Ban size={13} strokeWidth={2} />}
                onClick={onCancel}
              >
                Cancelar orden
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                icon={<Check size={14} strokeWidth={2.6} />}
                onClick={onConfirm}
              >
                Confirmar
              </Button>
            </>
          ) : (
            <Button variant="ghost-light" size="md" className="flex-1" onClick={onClose}>
              Cerrar
            </Button>
          )}
        </footer>
      </aside>
    </>
  )
}

// ─── Main view ────────────────────────────────────────────────────────────────
export default function AdminOrders() {
  const [tab,        setTab]        = useState('PENDIENTE')
  const [orders,     setOrders]     = useState(INITIAL_ORDERS)
  const [selectedId, setSelectedId] = useState(null)

  const filtered  = orders.filter((o) => o.estado === tab)
  const selected  = orders.find((o) => o.id === selectedId) ?? null
  // Panel only shows when the selected order belongs to the active tab
  const panelOrder = selected?.estado === tab ? selected : null

  const tabCounts = TABS.reduce((acc, t) => {
    acc[t.key] = orders.filter((o) => o.estado === t.key).length
    return acc
  }, {})

  function handleTabChange(key) {
    setTab(key)
    setSelectedId(null)
  }

  function handleConfirm() {
    setOrders((prev) => prev.map((o) => o.id === selectedId ? { ...o, estado: 'CONFIRMADA' } : o))
    setSelectedId(null)
    setTab('CONFIRMADA')
  }

  function handleCancel() {
    setOrders((prev) => prev.map((o) => o.id === selectedId ? { ...o, estado: 'CANCELADA' } : o))
    setSelectedId(null)
    setTab('CANCELADA')
  }

  return (
    <div className="space-y-6">

      {/* Tabs */}
      <div className="flex border-b border-rock/10">
        {TABS.map((t) => {
          const active = tab === t.key
          const count  = tabCounts[t.key]
          return (
            <button
              key={t.key}
              onClick={() => handleTabChange(t.key)}
              className={`
                relative flex items-center gap-2 px-5 py-3
                font-mono text-[11px] tracking-widest-2 uppercase transition-colors
                border-b-2 -mb-px
                ${active
                  ? 'border-alpenglow text-alpenglow'
                  : 'border-transparent text-rock/45 hover:text-rock/70'
                }
              `}
            >
              {t.label}
              {count > 0 && (
                <span className={`
                  inline-flex items-center justify-center h-4 min-w-[1rem] px-1
                  font-mono text-[9px] rounded-sm
                  ${active ? 'bg-alpenglow text-ivory' : 'bg-rock/10 text-rock/50'}
                `}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div>
        {filtered.length === 0 ? (
            <div className="bg-white border border-rock/10 py-16 text-center">
              <div className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/35">
                Sin órdenes {TABS.find((t) => t.key === tab)?.label.toLowerCase()}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-rock/10 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    {['Orden', 'Cliente', 'Fecha', 'Artículos', 'Total', ''].map((h) => (
                      <th
                        key={h}
                        className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/45 px-5 py-3"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => {
                    const isActive = selectedId === o.id
                    return (
                      <tr
                        key={o.id}
                        onClick={() => setSelectedId(isActive ? null : o.id)}
                        className={`
                          border-t border-rock/10 cursor-pointer transition-colors
                          ${isActive
                            ? 'bg-alpenglow/[0.06]'
                            : 'hover:bg-rock/[0.025]'
                          }
                        `}
                      >
                        {/* Left accent bar for selected row */}
                        <td className={`px-5 py-3.5 font-mono text-xs font-bold relative
                          ${isActive ? 'pl-4 border-l-2 border-l-alpenglow' : ''}`}
                        >
                          {o.id}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <span className="h-7 w-7 rounded-full bg-pine text-ivory grid place-items-center font-narrow font-bold text-[10px] shrink-0">
                              {o.cliente.iniciales}
                            </span>
                            <div>
                              <div className="font-narrow font-bold text-xs uppercase tracking-tight leading-tight">
                                {o.cliente.nombre}
                              </div>
                              <div className="font-mono text-[9px] text-rock/45">
                                {o.cliente.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-rock/60 whitespace-nowrap">
                          {new Date(o.fecha).toLocaleDateString('es-AR', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                          })}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-rock/60">
                          {o.items.length} {o.items.length === 1 ? 'artículo' : 'artículos'}
                        </td>
                        <td className="px-5 py-3.5 font-mono font-bold text-xs tabular-nums">
                          {fmtPrice(o.total)}
                        </td>
                        <td className="px-5 py-3.5">
                          <ChevronRight
                            size={14}
                            className={`transition-transform ${isActive ? 'rotate-90 text-alpenglow' : 'text-rock/25'}`}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
        )}
      </div>

      {/* Detail drawer */}
      {panelOrder && (
        <OrderDetail
          order={panelOrder}
          onClose={() => setSelectedId(null)}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}
