import { Link, useNavigate } from 'react-router-dom'
import { UserCircle, Package, LogOut, ShoppingBag } from 'lucide-react'
import { useAuth }     from '../context/AuthContext.jsx'
import { useOrdenes }  from '../hooks/useOrders.js'
import { fmtPrice }    from '../utils/format.js'
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

export default function Perfil() {
  const navigate        = useNavigate()
  const { user, logout } = useAuth()

  if (!user) return null

  // user?.id ?? null: si id no existe (sesión vieja), el hook muestra error en lugar de llamar /ordenes
  const { ordenes, loading, error } = useOrdenes(user?.id ?? null)

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className="bg-ivory text-rock min-h-[calc(100vh-160px)]">
      <div className="max-w-[900px] mx-auto px-6 lg:px-10 py-10 lg:py-14">

        <div className="flex items-start justify-between gap-4 mb-10">
          <div>
            <div className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow mb-2">Mi cuenta</div>
            <h1 className="font-display font-black tracking-tightest uppercase text-4xl lg:text-5xl leading-[0.9]">Mis Pedidos</h1>
          </div>
          <Button variant="ghost-light" size="sm" onClick={handleLogout} icon={<LogOut size={14} />}>
            Cerrar sesión
          </Button>
        </div>

        <section className="bg-rock text-ivory p-6 lg:p-8 mb-8">
          <div className="flex items-center gap-4 mb-1">
            <UserCircle size={36} strokeWidth={1.5} className="text-ivory/40 shrink-0" />
            <div>
              <p className="font-display font-black tracking-tightest uppercase text-2xl leading-tight">
                {user.nombre ?? user.username}
              </p>
              {user.email && (
                <p className="font-mono text-[11px] tracking-widest-2 uppercase text-ivory/55 mt-0.5">{user.email}</p>
              )}
              <p className="font-mono text-[10px] tracking-widest-2 uppercase text-ivory/35 mt-0.5">
                {user.rol}
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2.5 mb-5">
            <Package size={16} strokeWidth={2} className="text-alpenglow" />
            <h2 className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/70">Historial de pedidos</h2>
          </div>

          {loading ? (
            <div className="border border-rock/10 p-10 text-center">
              <span className="spinner" />
            </div>
          ) : error ? (
            <div className="border border-red-200 bg-red-50 p-6 text-center font-mono text-[11px] text-red-700 tracking-widest-2 uppercase">
              {error}
            </div>
          ) : ordenes.length === 0 ? (
            <div className="border border-rock/10 p-10 text-center">
              <ShoppingBag size={32} strokeWidth={1.5} className="mx-auto mb-3 text-rock/25" />
              <p className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/55 mb-4">
                Todavía no realizaste ningún pedido
              </p>
              <Button variant="primary" size="md" onClick={() => navigate('/catalogo')}>Ir al catálogo</Button>
            </div>
          ) : (
            <div className="divide-y divide-rock/10 border border-rock/10">
              {ordenes.map((orden) => {
                const items = orden.items ?? orden.detalles ?? []
                return (
                  <div key={orden.id} className="p-5 lg:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-[12px] tracking-widest-2 uppercase">
                          #{orden.id}
                        </span>
                        <span className={`font-mono text-[10px] tracking-widest-2 uppercase px-2 py-0.5 ${ESTADO_STYLE[orden.estado] ?? 'bg-rock/10 text-rock/60'}`}>
                          {orden.estado}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/45">
                          {fmtFecha(orden.fecha ?? orden.fechaCreacion)}
                        </span>
                        <Link to={`/cuenta/ordenes/${orden.id}`}
                          className="font-mono text-[10px] tracking-widest-2 uppercase text-pine hover:underline">
                          Ver detalle →
                        </Link>
                      </div>
                    </div>

                    {items.length > 0 && (
                      <ul className="space-y-1 mb-3">
                        {items.map((item, i) => (
                          <li key={i} className="flex justify-between items-baseline gap-4 text-sm">
                            <span className="text-rock/70">
                              {(item.cantidad ?? item.qty) > 1 && (
                                <span className="font-mono text-[10px] mr-1.5">{item.cantidad ?? item.qty}×</span>
                              )}
                              {item.nombreProducto ?? item.nombre}
                            </span>
                            <span className="font-mono text-[11px] text-rock/55 shrink-0">
                              {fmtPrice((item.precioUnitario ?? item.precio) * (item.cantidad ?? item.qty ?? 1))}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="flex justify-end border-t border-rock/10 pt-3">
                      <span className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/55 mr-3">Total</span>
                      <span className="font-display font-black tracking-tightest text-lg uppercase">
                        {fmtPrice(orden.total ?? 0)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
