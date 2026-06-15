import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useOrden } from '../hooks/useOrders.js'
import { fmtPrice } from '../utils/format.js'
import Button from '../components/ui/Button.jsx'

const ESTADO_STYLE = {
  CONFIRMADA: 'bg-pine/10 text-pine',
  ENTREGADA:  'bg-pine/10 text-pine',
  PENDIENTE:  'bg-alpenglow/10 text-alpenglow',
  CANCELADA:  'bg-red-50 text-red-700',
}

function fmtFecha(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function CuentaOrdenDetalle() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { orden, loading, error } = useOrden(id)

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-160px)] bg-ivory flex items-center justify-center text-rock">
        <span className="spinner" />
      </div>
    )
  }

  if (error || !orden) {
    return (
      <div className="min-h-[calc(100vh-160px)] bg-ivory flex items-center justify-center text-rock">
        <div className="text-center">
          <p className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/55 mb-4">
            {error ?? 'Pedido no encontrado'}
          </p>
          <Button variant="primary" onClick={() => navigate('/cuenta/ordenes')}>Ver mis pedidos</Button>
        </div>
      </div>
    )
  }

  const items    = orden.items ?? orden.detalles ?? []
  const estado   = orden.estado ?? 'PENDIENTE'
  const fecha    = fmtFecha(orden.fecha ?? orden.fechaCreacion)

  return (
    <div className="bg-ivory text-rock min-h-[calc(100vh-160px)]">
      <div className="max-w-[900px] mx-auto px-6 lg:px-10 py-10 lg:py-14">

        <nav className="flex items-center gap-2 font-mono text-[11px] tracking-widest-2 uppercase text-rock/55 mb-8">
          <Link to="/" className="hover:text-alpenglow transition-colors">Inicio</Link>
          <span className="text-rock/30">›</span>
          <Link to="/cuenta/ordenes" className="hover:text-alpenglow transition-colors">Mis Pedidos</Link>
          <span className="text-rock/30">›</span>
          <span className="text-rock">#{orden.id}</span>
        </nav>

        <div className="flex flex-wrap items-start justify-between gap-4 mb-10">
          <div>
            <div className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow mb-2">
              Detalle del pedido
            </div>
            <h1 className="font-display font-black tracking-tightest uppercase text-4xl lg:text-5xl leading-[0.9]">
              #{orden.id}
            </h1>
          </div>
          <span className={`font-mono text-[10px] tracking-widest-2 uppercase px-3 py-1.5 ${ESTADO_STYLE[estado] ?? 'bg-rock/10 text-rock/60'}`}>
            {estado}
          </span>
        </div>

        <div className="bg-white border border-rock/10 p-6 mb-6">
          <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 mb-4">Productos</div>
          <ul className="space-y-3 divide-y divide-rock/10">
            {items.map((item, i) => (
              <li key={i} className="flex justify-between items-baseline gap-4 pt-3 first:pt-0">
                <span className="text-rock/80">
                  {(item.cantidad ?? item.qty ?? 1) > 1 && (
                    <span className="font-mono text-[10px] mr-1.5">{item.cantidad ?? item.qty}×</span>
                  )}
                  {item.nombreProducto ?? item.nombre}
                  {(item.talla ?? item.talle) && (
                    <span className="font-mono text-[10px] text-rock/45 ml-2">
                      · talle {item.talla ?? item.talle}
                    </span>
                  )}
                </span>
                <span className="font-mono text-[11px] text-rock/55 shrink-0">
                  {fmtPrice((item.precioUnitario ?? item.precio ?? 0) * (item.cantidad ?? item.qty ?? 1))}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between items-center border-t border-rock/10 pt-4 mt-4">
            <span className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/55">Total</span>
            <span className="font-display font-black tracking-tightest text-2xl">{fmtPrice(orden.total ?? 0)}</span>
          </div>
        </div>

        {fecha && (
          <p className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/45 mb-8">
            Fecha: {fecha}
          </p>
        )}

        <Button variant="ghost-light" icon={<ArrowLeft size={14} />} onClick={() => navigate('/cuenta/ordenes')}>
          Volver a mis pedidos
        </Button>
      </div>
    </div>
  )
}
