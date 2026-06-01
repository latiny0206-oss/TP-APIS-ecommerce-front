/* Orders view — history of orders with status filters */

const ORDER_FILTERS = ['Todas', 'PENDIENTE', 'CONFIRMADA', 'ENTREGADA', 'CANCELADA'];

const Orders = () => {
  const dispatch = useDispatch();
  const orderIds = useSelector((s) => s.orders.ids);
  const ordersById = useSelector((s) => s.orders.byId);
  const user = useSelector((s) => s.auth.user);

  const [filter, setFilter] = React.useState('Todas');

  const orders = orderIds.map((id) => ordersById[id]);
  const filtered = filter === 'Todas' ? orders : orders.filter((o) => o.estado === filter);

  return (
    <div className="bg-ivory text-rock min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 lg:py-14">

        {/* Profile header */}
        <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-end mb-10">
          <div>
            <Breadcrumb items={[{ label: 'Inicio', view: 'home' }, { label: 'Mis órdenes' }]} />
            <div className="flex items-center gap-4 mt-6">
              <span className="h-16 w-16 rounded-full bg-pine text-ivory grid place-items-center font-display font-black text-2xl tracking-tightest">
                {user?.initials || 'JD'}
              </span>
              <div>
                <h1 className="font-display font-black tracking-tightest uppercase text-4xl lg:text-5xl leading-[0.95]">Mis órdenes</h1>
                <p className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/55 mt-1">
                  {user?.handle} · {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Profile sidebar links — compact horizontal on top */}
          <nav className="flex gap-2">
            {[
              { label: 'Mi perfil', Icon: IconUser },
              { label: 'Mis órdenes', Icon: IconClipboard, active: true },
              { label: 'Mi carrito',  Icon: IconCart, view: 'cart' },
            ].map((it) => (
              <button key={it.label}
                onClick={() => it.view && dispatch(navigate(it.view))}
                className={`flex items-center gap-2 px-4 h-10 border font-mono text-[10px] tracking-widest-2 uppercase transition-all
                  ${it.active ? 'bg-rock text-ivory border-rock' : 'border-rock/15 text-rock/65 hover:border-rock hover:text-rock'}`}>
                <it.Icon size={12}/> {it.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-8 border-b border-rock/10">
          {ORDER_FILTERS.map((f) => {
            const count = f === 'Todas' ? orders.length : orders.filter((o) => o.estado === f).length;
            return (
              <button key={f} onClick={() => setFilter(f)}
                className={`shrink-0 flex items-center gap-2 px-4 h-10 border-b-2 font-mono text-[11px] tracking-widest-2 uppercase transition-all
                  ${filter === f ? 'border-pine text-pine' : 'border-transparent text-rock/55 hover:text-rock'}`}>
                {f}
                <span className={`font-mono text-[10px] ${filter === f ? 'text-pine' : 'text-rock/40'}`}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Order list */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-rock/20">
            <div className="font-display font-black uppercase text-2xl tracking-tightest mb-2">Sin órdenes</div>
            <p className="text-rock/55 text-sm">No tenés órdenes en estado <span className="text-pine">{filter}</span>.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((o) => (
              <article key={o.id}
                onClick={() => dispatch(navigate({ view: 'order-detail', params: { orderId: o.id } }))}
                className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-4 md:gap-6 items-center bg-white border border-rock/10 hover:border-pine hover:shadow-md p-5 lg:p-6 cursor-pointer transition-all">

                <div>
                  <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55">Orden</div>
                  <div className="font-display font-black tracking-tightest text-xl mt-0.5">{o.id}</div>
                </div>

                <div>
                  <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55">Fecha</div>
                  <div className="font-narrow font-bold text-sm mt-0.5">{formatDate(o.fecha)}</div>
                </div>

                <div>
                  <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55">
                    {o.items.length} {o.items.length === 1 ? 'producto' : 'productos'}
                  </div>
                  <div className="font-display font-black tracking-tightest text-lg mt-0.5">{fmt(o.total)}</div>
                </div>

                <div className="flex items-center gap-4">
                  <StatusBadge status={o.estado}/>
                  <button className="font-mono text-[10px] tracking-widest-2 uppercase text-pine hover:underline flex items-center gap-1">
                    Ver detalle <IconChevronRight size={12}/>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
}

window.Orders = Orders;
window.formatDate = formatDate;
