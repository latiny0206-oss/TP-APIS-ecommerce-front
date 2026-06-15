import { useState } from 'react'
import { X, Check, Ban, Package, ChevronRight } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import { fmtPrice }    from '../../utils/format.js'
import { useOrdenes }  from '../../hooks/useOrders.js'
import { orderService } from '../../api/orderService.js'
import { getErrorMessage } from '../../api/api.js'

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

function StatusChip({ status }) {
  return (
    <span className={`inline-flex items-center font-mono text-[9px] tracking-widest-2 uppercase px-2 py-1 border ${STATUS_STYLES[status] ?? ''}`}>
      {status}
    </span>
  )
}

function OrderDetail({ order, onClose, onConfirm, onCancel, actionLoading }) {
  const isPendiente = order.estado === 'PENDIENTE'
  const items = order.items ?? order.detalles ?? []

  return (
    <>
      <div className="fixed inset-0 bg-rock/60 z-40 fadein" onClick={onClose} />
      <aside className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-ivory text-rock z-50 shadow-2xl flex flex-col fadein">
        <header className="flex items-center justify-between p-5 border-b border-rock/10">
          <div>
            <div className="font-mono text-[10px] tracking-widest-2 uppercase text-alpenglow">Detalle de orden</div>
            <h2 className="font-display font-black tracking-tightest uppercase text-xl mt-0.5">#{order.id}</h2>
          </div>
          <button onClick={onClose}
            className="h-9 w-9 grid place-items-center border border-rock/15 hover:bg-rock/5 transition-colors">
            <X size={16} />
          </button>
        </header>

        <div className="flex-1 overflow-auto p-5 space-y-4">
          <div className="flex items-center justify-between">
            <StatusChip status={order.estado} />
            <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/50">
              {order.fecha
                ? new Date(order.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
                : '—'}
            </span>
          </div>

          {order.usuario && (
            <div className="bg-rock/[0.03] border border-rock/10 p-4">
              <div className="font-mono text-[9px] tracking-widest-2 uppercase text-rock/40 mb-2.5">Cliente</div>
              <div className="font-narrow font-bold text-sm uppercase tracking-tight">
                {order.usuario.nombre ?? order.usuario.username}
              </div>
              {order.usuario.email && (
                <div className="font-mono text-[10px] text-rock/50 mt-0.5">{order.usuario.email}</div>
              )}
            </div>
          )}

          <div>
            <div className="font-mono text-[9px] tracking-widest-2 uppercase text-rock/40 mb-2">
              Productos · {items.length} {items.length === 1 ? 'artículo' : 'artículos'}
            </div>
            <ul className="border border-rock/10 divide-y divide-rock/10">
              {items.map((item, i) => {
                const nombre   = item.nombreProducto ?? item.nombre ?? '—'
                const cantidad = item.cantidad ?? item.qty ?? 1
                const precio   = item.precioUnitario ?? item.precio ?? 0
                return (
                  <li key={i} className="flex items-start gap-3 p-3">
                    <span className="h-7 w-7 bg-rock/[0.05] grid place-items-center shrink-0 mt-0.5">
                      <Package size={12} className="text-rock/35" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-narrow font-bold text-xs uppercase tracking-tight leading-tight truncate">{nombre}</div>
                      {(item.talla ?? item.talle) && (
                        <div className="font-mono text-[9px] text-rock/45 mt-0.5">
                          Talle: {item.talla ?? item.talle} · Cant.: {cantidad}
                        </div>
                      )}
                    </div>
                    <div className="font-mono text-xs font-bold shrink-0 tabular-nums">
                      {fmtPrice(precio * cantidad)}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="flex items-center justify-between py-2 border-t-2 border-rock/10">
            <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55">Total</span>
            <span className="font-display font-black tracking-tightest text-2xl tabular-nums">
              {fmtPrice(order.total ?? 0)}
            </span>
          </div>
        </div>

        <footer className="border-t border-rock/10 p-5 flex gap-3">
          {isPendiente ? (
            <>
              <Button variant="danger" size="md" className="flex-1"
                icon={<Ban size={13} strokeWidth={2} />} onClick={onCancel} disabled={actionLoading}>
                Cancelar orden
              </Button>
              <Button variant="primary" size="md" className="flex-1"
                icon={<Check size={14} strokeWidth={2.6} />} onClick={onConfirm} disabled={actionLoading}>
                Confirmar
              </Button>
            </>
          ) : (
            <Button variant="ghost-light" size="md" className="flex-1" onClick={onClose}>Cerrar</Button>
          )}
        </footer>
      </aside>
    </>
  )
}

export default function AdminOrders() {
  const [tab,        setTab]        = useState('PENDIENTE')
  const [selectedId, setSelectedId] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const { ordenes, loading, error, reload, confirmar, cancelar } = useOrdenes()

  const filtered  = ordenes.filter((o) => o.estado === tab)
  const selected  = ordenes.find((o) => o.id === selectedId) ?? null
  const panelOrder = selected?.estado === tab ? selected : null

  const tabCounts = TABS.reduce((acc, t) => {
    acc[t.key] = ordenes.filter((o) => o.estado === t.key).length
    return acc
  }, {})

  const handleTabChange = (key) => { setTab(key); setSelectedId(null) }

  const handleConfirm = async () => {
    setActionLoading(true)
    try { await confirmar(selectedId) } catch { /* error mostrado en hook */ }
    setSelectedId(null)
    setTab('CONFIRMADA')
    setActionLoading(false)
  }

  const handleCancel = async () => {
    setActionLoading(true)
    try { await cancelar(selectedId) } catch {}
    setSelectedId(null)
    setTab('CANCELADA')
    setActionLoading(false)
  }

  return (
    <div className="space-y-6">

      <div className="flex border-b border-rock/10">
        {TABS.map((t) => {
          const active = tab === t.key
          const count  = tabCounts[t.key]
          return (
            <button key={t.key} onClick={() => handleTabChange(t.key)}
              className={`relative flex items-center gap-2 px-5 py-3 font-mono text-[11px] tracking-widest-2 uppercase transition-colors border-b-2 -mb-px
                ${active ? 'border-alpenglow text-alpenglow' : 'border-transparent text-rock/45 hover:text-rock/70'}`}>
              {t.label}
              {count > 0 && (
                <span className={`inline-flex items-center justify-center h-4 min-w-[1rem] px-1 font-mono text-[9px] rounded-sm
                  ${active ? 'bg-alpenglow text-ivory' : 'bg-rock/10 text-rock/50'}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="bg-white border border-rock/10 py-16 text-center">
          <span className="spinner" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 text-center font-mono text-[11px] tracking-widest-2 uppercase">
          {error}
        </div>
      ) : filtered.length === 0 ? (
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
                  <th key={h} className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/45 px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const isActive = selectedId === o.id
                const items    = o.items ?? o.detalles ?? []
                const cliente  = o.usuario?.nombre ?? o.usuario?.username ?? '—'
                const fecha    = o.fecha ? new Date(o.fecha).toLocaleDateString('es-AR', { day:'2-digit', month:'2-digit', year:'numeric' }) : '—'
                return (
                  <tr key={o.id} onClick={() => setSelectedId(isActive ? null : o.id)}
                    className={`border-t border-rock/10 cursor-pointer transition-colors
                      ${isActive ? 'bg-alpenglow/[0.06]' : 'hover:bg-rock/[0.025]'}`}>
                    <td className={`px-5 py-3.5 font-mono text-xs font-bold relative ${isActive ? 'pl-4 border-l-2 border-l-alpenglow' : ''}`}>
                      #{o.id}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="h-7 w-7 rounded-full bg-pine text-ivory grid place-items-center font-narrow font-bold text-[10px] shrink-0">
                          {cliente.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="font-narrow font-bold text-xs uppercase tracking-tight">{cliente}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-rock/60 whitespace-nowrap">{fecha}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-rock/60">
                      {items.length} {items.length === 1 ? 'artículo' : 'artículos'}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-xs tabular-nums">{fmtPrice(o.total ?? 0)}</td>
                    <td className="px-5 py-3.5">
                      <ChevronRight size={14} className={`transition-transform ${isActive ? 'rotate-90 text-alpenglow' : 'text-rock/25'}`} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {panelOrder && (
        <OrderDetail
          order={panelOrder}
          onClose={() => setSelectedId(null)}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          actionLoading={actionLoading}
        />
      )}
    </div>
  )
}
