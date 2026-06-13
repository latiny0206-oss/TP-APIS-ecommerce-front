import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth }       from '../context/AuthContext.jsx'
import { MOCK_PEDIDOS, fmtPrice } from '../mocks/data.js'
import Button from '../components/ui/Button.jsx'

const ESTADO_STYLE = {
  'Entregado':  'bg-pine/10 text-pine',
  'En camino':  'bg-alpenglow/10 text-alpenglow',
  'Procesando': 'bg-rock/10 text-rock/60',
}

export default function CuentaOrdenDetalle() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const { user }   = useAuth()

  // El ID en la URL no lleva '#' — se reconstruye para buscar en MOCK_PEDIDOS
  const pedido = MOCK_PEDIDOS.find((p) => p.id === `#${id}`)

  if (!pedido || pedido.userId !== user?.id) {
    return (
      <div className="min-h-[calc(100vh-160px)] bg-ivory flex items-center justify-center text-rock">
        <div className="text-center">
          <p className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/55 mb-4">
            Pedido no encontrado
          </p>
          <Button variant="primary" onClick={() => navigate('/cuenta/ordenes')}>
            Ver mis pedidos
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-ivory text-rock min-h-[calc(100vh-160px)]">
      <div className="max-w-[900px] mx-auto px-6 lg:px-10 py-10 lg:py-14">

        <nav className="flex items-center gap-2 font-mono text-[11px] tracking-widest-2 uppercase text-rock/55 mb-8">
          <Link to="/" className="hover:text-alpenglow transition-colors">Inicio</Link>
          <span className="text-rock/30">›</span>
          <Link to="/cuenta/ordenes" className="hover:text-alpenglow transition-colors">Mis Pedidos</Link>
          <span className="text-rock/30">›</span>
          <span className="text-rock">{pedido.id}</span>
        </nav>

        <div className="flex flex-wrap items-start justify-between gap-4 mb-10">
          <div>
            <div className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow mb-2">
              Detalle del pedido
            </div>
            <h1 className="font-display font-black tracking-tightest uppercase text-4xl lg:text-5xl leading-[0.9]">
              {pedido.id}
            </h1>
          </div>
          <span className={`font-mono text-[10px] tracking-widest-2 uppercase px-3 py-1.5 ${ESTADO_STYLE[pedido.estado] ?? 'bg-rock/10 text-rock/60'}`}>
            {pedido.estado}
          </span>
        </div>

        <div className="bg-white border border-rock/10 p-6 mb-6">
          <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 mb-4">Productos</div>
          <ul className="space-y-3 divide-y divide-rock/10">
            {pedido.items.map((item, i) => (
              <li key={i} className="flex justify-between items-baseline gap-4 pt-3 first:pt-0">
                <span className="text-rock/80">
                  {item.qty > 1 && <span className="font-mono text-[10px] mr-1.5">{item.qty}×</span>}
                  {item.nombre}
                </span>
                <span className="font-mono text-[11px] text-rock/55 shrink-0">{fmtPrice(item.precio * item.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between items-center border-t border-rock/10 pt-4 mt-4">
            <span className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/55">Total</span>
            <span className="font-display font-black tracking-tightest text-2xl">{fmtPrice(pedido.total)}</span>
          </div>
        </div>

        <p className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/45 mb-8">
          Fecha: {pedido.fecha}
        </p>

        <Button variant="ghost-light" icon={<ArrowLeft size={14} />} onClick={() => navigate('/cuenta/ordenes')}>
          Volver a mis pedidos
        </Button>
      </div>
    </div>
  )
}
