import { Package, ClipboardList, Ticket, Users, AlertTriangle, TrendingUp, Clock } from 'lucide-react'
import { useProducts } from '../../context/ProductsContext.jsx'
import { fmtPrice as fmt } from '../../utils/format.js'

const RECENT_ORDERS = [
  { id: 'ORD-092', client: 'Carlos Mendoza',  initials: 'CM', date: '18/05/2026', amount: 450000, status: 'PENDIENTE' },
  { id: 'ORD-091', client: 'Lucía Torres',    initials: 'LT', date: '17/05/2026', amount: 120500, status: 'CONFIRMADA' },
  { id: 'ORD-090', client: 'Martín Silva',    initials: 'MS', date: '16/05/2026', amount: 890000, status: 'ENTREGADA' },
  { id: 'ORD-089', client: 'Sofía Mendieta',  initials: 'SM', date: '15/05/2026', amount: 234500, status: 'ENTREGADA' },
  { id: 'ORD-088', client: 'Iván Vargas',     initials: 'IV', date: '14/05/2026', amount: 89990,  status: 'CANCELADA' },
]

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
        <div className="font-display font-black tracking-tightest text-4xl">{value}</div>
        <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 mt-1">{label}</div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { ids, byId } = useProducts()
  const products      = ids.map((id) => byId[id])
  const lowStock      = products.filter((p) => p.stock > 0 && p.stock <= 3)

  return (
    <div className="space-y-8">

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard Icon={Package}       label="Productos activos"    value={products.length} accentClass="bg-pine/15 text-pine" />
        <KpiCard Icon={ClipboardList} label="Órdenes pendientes"   value="3"               accentClass="bg-alpenglow/15 text-alpenglow" />
        <KpiCard Icon={Ticket}        label="Descuentos activos"   value="3"               accentClass="bg-rock/10 text-rock" />
        <KpiCard Icon={Users}         label="Clientes registrados" value="1.247"           accentClass="bg-pine/15 text-pine" />
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">

        <section className="bg-white border border-rock/10">
          <div className="flex items-center justify-between p-5 border-b border-rock/10">
            <h2 className="font-display font-black tracking-tightest uppercase text-xl">Últimas órdenes</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                {['Orden', 'Cliente', 'Fecha', 'Monto', 'Estado'].map((h) => (
                  <th key={h} className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/45 px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_ORDERS.map((o) => (
                <tr key={o.id} className="border-t border-rock/10 hover:bg-rock/[0.02]">
                  <td className="px-5 py-3 font-mono text-xs">{o.id}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="h-7 w-7 rounded-full bg-pine text-ivory grid place-items-center font-narrow font-bold text-[10px]">{o.initials}</span>
                      <span className="font-narrow font-bold text-xs">{o.client}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-rock/65">{o.date}</td>
                  <td className="px-5 py-3 font-mono font-bold text-xs">{fmt(o.amount)}</td>
                  <td className="px-5 py-3">
                    <span className={`font-mono text-[9px] tracking-widest-2 uppercase px-2 py-1 ${STATUS_COLORS[o.status] || 'text-rock/55'}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="space-y-4">
          <section className="bg-white border border-rock/10">
            <div className="flex items-center justify-between p-5 border-b border-rock/10">
              <div className="flex items-center gap-2.5">
                <span className="h-8 w-8 grid place-items-center bg-alpenglow/15 text-alpenglow">
                  <AlertTriangle size={16} />
                </span>
                <h2 className="font-display font-black tracking-tightest uppercase text-base">Stock bajo</h2>
              </div>
              <span className="font-mono text-[10px] tracking-widest-2 uppercase text-alpenglow">
                {lowStock.length} alertas
              </span>
            </div>
            <ul>
              {lowStock.length > 0 ? (
                lowStock.slice(0, 4).map((p) => (
                  <li key={p.id} className="flex items-center gap-3 p-4 border-t border-rock/10">
                    <div className="h-10 w-10 bg-rock-700 shrink-0" style={{ backgroundColor: p.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="font-narrow font-bold text-xs uppercase tracking-tight truncate">{p.name}</div>
                      <div className="font-mono text-[10px] text-rock/55 mt-0.5">{p.brand}</div>
                    </div>
                    <span className="font-mono text-[10px] tracking-widest-2 uppercase text-alpenglow whitespace-nowrap">
                      Quedan {p.stock}
                    </span>
                  </li>
                ))
              ) : (
                <li className="p-5 text-center font-mono text-[11px] tracking-widest-2 uppercase text-rock/40">
                  Sin alertas
                </li>
              )}
            </ul>
          </section>

          <section className="bg-white border border-rock/10">
            <div className="flex items-center gap-2.5 p-5 border-b border-rock/10">
              <span className="h-8 w-8 grid place-items-center bg-pine/15 text-pine">
                <Clock size={16} />
              </span>
              <h2 className="font-display font-black tracking-tightest uppercase text-base">Próximos a vencer</h2>
            </div>
            <ul>
              {[{ code: 'INVIERNO24', days: 2 }, { code: 'NUEVOSOCIO', days: 5 }, { code: 'ENVIOPRO', days: 8 }].map((d) => (
                <li key={d.code} className="flex items-center gap-3 p-4 border-t border-rock/10">
                  <Ticket size={16} className="text-pine" />
                  <span className="font-mono text-xs font-bold tracking-widest-2">{d.code}</span>
                  <span className="ml-auto font-mono text-[10px] tracking-widest-2 uppercase text-rock/55">
                    Vence en {d.days} días
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-rock text-ivory p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-pine-300" />
              <span className="font-mono text-[10px] tracking-widest-2 uppercase text-ivory/55">Tendencia · 7 días</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-black tracking-tightest text-3xl">+18.4%</span>
              <span className="font-mono text-xs text-pine-300">vs. semana anterior</span>
            </div>
            <svg viewBox="0 0 200 40" className="w-full h-12 mt-4">
              <polyline points="0,30 20,28 40,32 60,24 80,20 100,22 120,16 140,18 160,12 180,8 200,4"
                fill="none" stroke="#E2DAC4" strokeWidth="1.5"/>
              <polyline points="0,30 20,28 40,32 60,24 80,20 100,22 120,16 140,18 160,12 180,8 200,4 200,40 0,40"
                fill="rgba(217,112,26,0.15)" stroke="none"/>
            </svg>
          </section>
        </div>
      </div>
    </div>
  )
}
