import { useDispatch, useSelector } from 'react-redux'
import { UserCircle, Package, LogOut, ShoppingBag } from 'lucide-react'
import { logout }    from '../store/authSlice.js'
import { navigate }  from '../store/navigationSlice.js'
import { MOCK_PEDIDOS, fmtPrice } from '../mocks/data.js'
import Button from '../components/ui/Button.jsx'

const ESTADO_STYLE = {
  'Entregado': 'bg-pine/10 text-pine',
  'En camino': 'bg-alpenglow/10 text-alpenglow',
  'Procesando': 'bg-rock/10 text-rock/60',
}

export default function Perfil() {
  const dispatch = useDispatch()
  const { user, isLoggedIn } = useSelector((s) => s.auth)

  if (!isLoggedIn) {
    dispatch(navigate('login'))
    return null
  }

  const pedidos = MOCK_PEDIDOS.filter((p) => p.userId === user.id)

  const handleLogout = () => {
    dispatch(logout())
    dispatch(navigate('home'))
  }

  return (
    <div className="bg-ivory text-rock min-h-[calc(100vh-160px)]">
      <div className="max-w-[900px] mx-auto px-6 lg:px-10 py-10 lg:py-14">

        {/* Encabezado */}
        <div className="flex items-start justify-between gap-4 mb-10">
          <div>
            <div className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow mb-2">
              Mi cuenta
            </div>
            <h1 className="font-display font-black tracking-tightest uppercase text-4xl lg:text-5xl leading-[0.9]">
              Perfil
            </h1>
          </div>
          <Button variant="ghost-light" size="sm" onClick={handleLogout} icon={<LogOut size={14} />}>
            Cerrar sesión
          </Button>
        </div>

        {/* Datos del usuario */}
        <section className="bg-rock text-ivory p-6 lg:p-8 mb-8">
          <div className="flex items-center gap-4 mb-1">
            <UserCircle size={36} strokeWidth={1.5} className="text-ivory/40 shrink-0" />
            <div>
              <p className="font-display font-black tracking-tightest uppercase text-2xl leading-tight">
                {user.nombre}
              </p>
              <p className="font-mono text-[11px] tracking-widest-2 uppercase text-ivory/55 mt-0.5">
                {user.email}
              </p>
            </div>
          </div>
        </section>

        {/* Mis pedidos */}
        <section>
          <div className="flex items-center gap-2.5 mb-5">
            <Package size={16} strokeWidth={2} className="text-alpenglow" />
            <h2 className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/70">
              Mis pedidos
            </h2>
          </div>

          {pedidos.length === 0 ? (
            <div className="border border-rock/10 p-10 text-center">
              <ShoppingBag size={32} strokeWidth={1.5} className="mx-auto mb-3 text-rock/25" />
              <p className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/55 mb-4">
                Todavía no realizaste ningún pedido
              </p>
              <Button variant="primary" size="md" onClick={() => dispatch(navigate('indumentaria'))}>
                Ir al catálogo
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-rock/10 border border-rock/10">
              {pedidos.map((pedido) => (
                <div key={pedido.id} className="p-5 lg:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-[12px] tracking-widest-2 uppercase">
                        {pedido.id}
                      </span>
                      <span className={`font-mono text-[10px] tracking-widest-2 uppercase px-2 py-0.5 ${ESTADO_STYLE[pedido.estado] ?? 'bg-rock/10 text-rock/60'}`}>
                        {pedido.estado}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/45">
                      {pedido.fecha}
                    </span>
                  </div>
                  <ul className="space-y-1 mb-3">
                    {pedido.items.map((item, i) => (
                      <li key={i} className="flex justify-between items-baseline gap-4 text-sm">
                        <span className="text-rock/70">
                          {item.qty > 1 && <span className="font-mono text-[10px] mr-1.5">{item.qty}×</span>}
                          {item.nombre}
                        </span>
                        <span className="font-mono text-[11px] text-rock/55 shrink-0">
                          {fmtPrice(item.precio * item.qty)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-end border-t border-rock/10 pt-3">
                    <span className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/55 mr-3">
                      Total
                    </span>
                    <span className="font-display font-black tracking-tightest text-lg uppercase">
                      {fmtPrice(pedido.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
