/* OrderDetail view — API field shape (estado, fecha, items.nombre, etc.) */

const OrderDetail = () => {
  const dispatch = useDispatch();
  const orderId = useSelector((s) => s.navigation.params.orderId);
  const order = useSelector((s) => s.orders.byId[orderId]);

  if (!order) {
    return (
      <div className="bg-ivory text-rock min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="font-display font-black text-3xl tracking-tightest uppercase mb-3">Orden no encontrada</div>
          <Button variant="primary" onClick={() => dispatch(navigate('orders'))}>Ver mis órdenes</Button>
        </div>
      </div>
    );
  }

  const isPending = order.estado === 'PENDIENTE';

  return (
    <div className="bg-ivory text-rock min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 lg:py-14">

        <Breadcrumb items={[
          { label: 'Inicio', view: 'home' },
          { label: 'Mis órdenes', view: 'orders' },
          { label: order.id },
        ]} />

        <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-end mt-6 mb-10">
          <div>
            <div className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow mb-2">
              Realizada el {formatDate(order.fecha)}
            </div>
            <h1 className="font-display font-black tracking-tightest uppercase text-5xl lg:text-6xl leading-[0.9]">
              Orden {order.id}
            </h1>
          </div>
          <StatusBadge status={order.estado} size="md" className="text-base px-4 py-2"/>
        </div>

        {/* Status tracker */}
        <div className="bg-white border border-rock/10 p-7 mb-8">
          <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/45 mb-5">Seguimiento</div>
          <StatusTracker status={order.estado}/>
        </div>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-12">

          {/* Items */}
          <div className="bg-white border border-rock/10">
            <div className="flex items-center justify-between p-6 border-b border-rock/10">
              <h2 className="font-display font-black tracking-tightest uppercase text-2xl">Artículos de la orden</h2>
              <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55">Precio al momento</span>
            </div>

            <ul>
              {order.items.map((it, i) => (
                <li key={i} className="flex items-start gap-4 p-6 border-b border-rock/10 last:border-0">
                  <span className="h-10 w-10 grid place-items-center bg-rock-700 text-ivory font-mono text-[10px] tracking-widest-2">
                    /0{i+1}
                  </span>
                  <div className="flex-1">
                    <div className="font-narrow font-bold uppercase tracking-tight text-lg leading-tight">{it.nombre}</div>
                    <div className="font-mono text-[11px] text-rock/55 mt-1">{it.variante}</div>
                    <div className="font-mono text-[11px] text-rock/55 mt-0.5">Cantidad: {it.cantidad}</div>
                    <div className="font-mono text-[10px] text-rock/40 mt-0.5">idVariante #{it.idVariante}</div>
                  </div>
                  <div className="font-display font-black tracking-tightest text-xl">{fmt(it.precio * it.cantidad)}</div>
                </li>
              ))}
            </ul>
          </div>

          {/* Summary + actions */}
          <aside className="space-y-6">
            <div className="bg-rock text-ivory p-6 lg:p-7">
              <div className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow mb-3">Total</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-ivory/75"><span>Subtotal</span><span className="font-mono">{fmt(order.subtotal)}</span></div>
                {order.descuento > 0 && (
                  <div className="flex justify-between text-alpenglow"><span>Descuento {order.descuentoCodigo}</span><span className="font-mono">−{fmt(order.descuento)}</span></div>
                )}
              </div>
              <div className="flex items-baseline justify-between border-t border-ivory/15 pt-4 mt-4">
                <span className="font-narrow font-bold uppercase tracking-widest-2 text-xs">Total pagado</span>
                <span className="font-display font-black tracking-tightest text-3xl">{fmt(order.total)}</span>
              </div>
            </div>

            {isPending ? (
              <div className="bg-white border border-rock/10 p-6">
                <p className="text-sm text-rock/65 mb-4">
                  Si cancelás, el stock de los productos será restaurado automáticamente.
                </p>
                <div className="grid gap-2">
                  <Button variant="primary" size="md" className="w-full"
                    onClick={() => dispatch(confirmarOrdenAsync(order.id))}
                    iconRight={<IconCheck size={14} stroke={2.6}/>}>
                    Confirmar orden
                  </Button>
                  <Button variant="danger" size="md" className="w-full"
                    onClick={() => dispatch(cancelarOrdenAsync(order.id))}>
                    Cancelar orden
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-rock/10 p-6 text-sm text-rock/65">
                {order.estado === 'CANCELADA'  && 'Esta orden fue cancelada. El stock fue restaurado.'}
                {order.estado === 'CONFIRMADA' && 'Tu orden está siendo preparada. Te avisaremos cuando esté en camino.'}
                {order.estado === 'ENTREGADA'  && '¡Esta orden fue entregada! Esperamos que estés disfrutando tu equipo.'}
                {order.estado === 'ENVIADA'    && 'Tu orden está en camino. Llega en máximo 48h.'}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

window.OrderDetail = OrderDetail;
