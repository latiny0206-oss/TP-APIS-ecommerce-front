import { useState, useEffect } from 'react'
import { Package, ClipboardList, Ticket, Users, AlertTriangle, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'
import { adminService } from '../../api/adminService.js'
import { getErrorMessage } from '../../api/api.js'
import { fmtPrice as fmt } from '../../utils/format.js'
import Button from '../../components/ui/Button.jsx'

let cachedDashboard = null
let cachedDashboardPromise = null
if (typeof window !== 'undefined') {
  const clear = () => { cachedDashboard = null; cachedDashboardPromise = null }
  window.addEventListener('auth:logout', clear)
  window.addEventListener('auth:login',  clear)
}

const STATUS_COLORS = {
  PENDIENTE:  'bg-alpenglow/15 text-alpenglow',
  CONFIRMADA: 'bg-pine/15 text-pine',
  ENTREGADA:  'bg-pine/25 text-pine',
  CANCELADA:  'bg-red-100 text-red-700',
}

function KpiCard({ Icon, label, value, accentClass }) {
  return (
    <div className="bg-white border border-rock/10 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className={`h-9 w-9 grid place-items-center ${accentClass}`}>
          <Icon size={16} />
        </span>
        <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/40">En vivo</span>
      </div>
      <div>
        <div className="font-display font-black tracking-tightest text-4xl">{value ?? '—'}</div>
        <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 mt-1">{label}</div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [kpis,    setKpis]    = useState(cachedDashboard)
  const [loading, setLoading] = useState(cachedDashboard === null)
  const [error,   setError]   = useState(null)

  const loadDashboard = (forceRefresh = false) => {
    if (!forceRefresh && cachedDashboard !== null) {
      setKpis(cachedDashboard)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    if (!cachedDashboardPromise || forceRefresh) {
      cachedDashboardPromise = adminService.getDashboard()
    }
    cachedDashboardPromise
      .then((data) => { cachedDashboard = data; setKpis(data) })
      .catch((e) => { cachedDashboardPromise = null; setError(getErrorMessage(e)) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadDashboard() }, []) // eslint-disable-line

  const ordenesRecientes   = Array.isArray(kpis?.ordenesRecientes)   ? kpis.ordenesRecientes   : []
  const variantesBajoStock = Array.isArray(kpis?.variantesBajoStock) ? kpis.variantesBajoStock : []

  const crecPct             = kpis?.crecimientoVentasPct
  const crecimientoPositivo = crecPct != null && crecPct >= 0

  return (
    <div className="space-y-8">

      {/* KPIs */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-rock/10 p-5 h-28 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 flex items-center justify-between">
          <span className="font-mono text-[11px] tracking-widest-2 uppercase">{error}</span>
          <Button variant="ghost-light" size="sm" icon={<RefreshCw size={13} />} onClick={() => loadDashboard(true)}>
            Reintentar
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard Icon={Package}       label="Productos activos"      value={kpis?.productosActivos ?? '—'}     accentClass="bg-pine/15 text-pine" />
          <KpiCard Icon={ClipboardList} label="Órdenes pendientes"     value={kpis?.ordenesPendientes ?? '—'}    accentClass="bg-alpenglow/15 text-alpenglow" />
          <KpiCard Icon={Ticket}        label="Descuentos activos"     value={kpis?.descuentosActivos ?? '—'}    accentClass="bg-rock/10 text-rock" />
          <KpiCard Icon={Users}         label="Clientes registrados"   value={kpis?.clientesRegistrados ?? '—'}  accentClass="bg-pine/15 text-pine" />
        </div>
      )}

      {/* KPI Semanal */}
      {!loading && !error && kpis && (
        <div className="bg-white border border-rock/10 p-5 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <div className="flex-1">
            <div className="font-mono text-[10px] tracking-widest-2 uppercase text-alpenglow mb-1">Ventas confirmadas esta semana</div>
            <div className="font-display font-black tracking-tightest text-3xl">{fmt(kpis.ventasSemanaActual ?? 0)}</div>
            <div className="font-mono text-[10px] text-rock/45 mt-1">
              Semana anterior: {fmt(kpis.ventasSemanaAnterior ?? 0)}
            </div>
          </div>
          {crecPct != null ? (
            <div className={`flex items-center gap-2 px-4 py-3 ${crecimientoPositivo ? 'bg-pine/10 text-pine' : 'bg-red-50 text-red-700'}`}>
              {crecimientoPositivo ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
              <div>
                <div className="font-display font-black text-2xl">
                  {crecimientoPositivo ? '+' : ''}{crecPct.toFixed(1)}%
                </div>
                <div className="font-mono text-[10px] tracking-widest-2 uppercase opacity-70">vs semana ant.</div>
              </div>
            </div>
          ) : (
            <div className="font-mono text-[10px] text-rock/40 tracking-widest-2 uppercase">Sin datos semana anterior</div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">

        {/* Últimas órdenes */}
        <section className="bg-white border border-rock/10">
          <div className="flex items-center justify-between p-5 border-b border-rock/10">
            <h2 className="font-display font-black tracking-tightest uppercase text-xl">Últimas órdenes</h2>
            {kpis?.ventasTotales != null && (
              <span className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/55">
                Total: <span className="font-bold text-rock">{fmt(kpis.ventasTotales)}</span>
              </span>
            )}
          </div>
          {loading ? (
            <div className="p-10 text-center"><span className="spinner" /></div>
          ) : ordenesRecientes.length === 0 ? (
            <div className="p-10 text-center font-mono text-[11px] tracking-widest-2 uppercase text-rock/35">Sin órdenes recientes</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  {['Orden', 'Cliente', 'Fecha', 'Monto', 'Estado'].map((h) => (
                    <th key={h} className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/45 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ordenesRecientes.map((o) => {
                  const cliente  = o.usuario?.nombre ?? o.usuario?.username ?? '—'
                  const initials = cliente.slice(0, 2).toUpperCase()
                  const fecha    = o.fecha
                    ? new Date(o.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    : '—'
                  return (
                    <tr key={o.id} className="border-t border-rock/10 hover:bg-rock/[0.02]">
                      <td className="px-5 py-3 font-mono text-xs font-bold">#{o.id}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="h-7 w-7 rounded-full bg-pine text-ivory grid place-items-center font-narrow font-bold text-[10px]">
                            {initials}
                          </span>
                          <span className="font-narrow font-bold text-xs uppercase tracking-tight truncate max-w-[100px]">{cliente}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-rock/65">{fecha}</td>
                      <td className="px-5 py-3 font-mono font-bold text-xs">{fmt(o.total ?? 0)}</td>
                      <td className="px-5 py-3">
                        <span className={`font-mono text-[9px] tracking-widest-2 uppercase px-2 py-1 ${STATUS_COLORS[o.estado] || 'bg-rock/10 text-rock/55'}`}>
                          {o.estado ?? '—'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </section>

        {/* Stock bajo — datos reales de variantes del backend */}
        <section className="bg-white border border-rock/10">
          <div className="flex items-center justify-between p-5 border-b border-rock/10">
            <div className="flex items-center gap-2.5">
              <span className="h-8 w-8 grid place-items-center bg-alpenglow/15 text-alpenglow">
                <AlertTriangle size={16} />
              </span>
              <h2 className="font-display font-black tracking-tightest uppercase text-base">Stock bajo</h2>
            </div>
            <span className="font-mono text-[10px] tracking-widest-2 uppercase text-alpenglow">
              {variantesBajoStock.length} alertas
            </span>
          </div>
          <ul>
            {variantesBajoStock.length > 0 ? (
              variantesBajoStock.slice(0, 5).map((v) => (
                <li key={v.id} className="flex items-center gap-3 p-4 border-t border-rock/10">
                  <div className="flex-1 min-w-0">
                    <div className="font-narrow font-bold text-xs uppercase tracking-tight truncate">{v.nombreProducto}</div>
                    <div className="font-mono text-[10px] text-rock/55 mt-0.5">{v.color} · {v.talla}</div>
                  </div>
                  <span className="font-mono text-[10px] tracking-widest-2 uppercase text-alpenglow whitespace-nowrap">
                    Quedan {v.stock}
                  </span>
                </li>
              ))
            ) : loading ? (
              <li className="p-5 text-center"><span className="spinner" /></li>
            ) : (
              <li className="p-5 text-center font-mono text-[11px] tracking-widest-2 uppercase text-rock/40">Sin alertas</li>
            )}
          </ul>
        </section>

      </div>
    </div>
  )
}
