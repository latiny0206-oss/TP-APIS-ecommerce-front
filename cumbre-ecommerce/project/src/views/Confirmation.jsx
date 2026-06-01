/* Confirmation view — celebratory order success (API field shape) */

const Confirmation = () => {
  const dispatch = useDispatch();
  const orderId = useSelector((s) => s.navigation.params.orderId);
  const order   = useSelector((s) => s.orders.byId[orderId]);

  if (!order) {
    return (
      <div className="bg-ivory text-rock min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="font-display font-black text-3xl tracking-tightest uppercase mb-3">Sin orden activa</div>
          <Button variant="primary" onClick={() => dispatch(navigate('home'))}>Volver al inicio</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ivory text-rock min-h-screen relative overflow-hidden">
      <div className="absolute -bottom-10 -left-6 right-0 pointer-events-none select-none opacity-[0.04]">
        <div className="font-display font-black tracking-tightest text-[28vw] leading-none uppercase whitespace-nowrap">
          Cumbre
        </div>
      </div>

      <div className="relative max-w-3xl mx-auto px-6 lg:px-10 py-16 lg:py-24">

        <div className="text-center mb-12 rise">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-pine text-ivory mb-6">
            <IconCheck size={28} stroke={2.6}/>
          </span>
          <div className="font-mono text-[11px] tracking-widest-2 uppercase text-pine mb-3">— Pedido realizado</div>
          <h1 className="font-display font-black tracking-tightest uppercase text-5xl lg:text-7xl leading-[0.9] mb-4">
            ¡Cumbre alcanzada!
          </h1>
          <p className="text-rock/65 text-lg">Tu orden fue procesada correctamente.</p>
        </div>

        <div className="bg-white border border-rock/15 shadow-sm rise rise-d1">
          <div className="bg-rock text-ivory p-6 flex items-center justify-between">
            <div>
              <div className="font-mono text-[10px] tracking-widest-2 uppercase text-ivory/55 mb-1">Orden</div>
              <div className="font-display font-black tracking-tightest text-2xl">{order.id}</div>
            </div>
            <StatusBadge status={order.estado}/>
          </div>

          <div className="p-6 border-b border-rock/10">
            <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/45 mb-3">Seguimiento</div>
            <StatusTracker status={order.estado}/>
          </div>

          <div className="p-6">
            <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/45 mb-4">Resumen del pedido</div>
            <ul className="space-y-3">
              {order.items.map((it, i) => (
                <li key={i} className="flex items-start gap-3 pb-3 border-b border-rock/10 last:border-0">
                  <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/40 mt-1">/0{i+1}</span>
                  <div className="flex-1">
                    <div className="font-narrow font-bold uppercase tracking-tight">{it.nombre}</div>
                    <div className="font-mono text-[11px] text-rock/55 mt-0.5">{it.variante} · ×{it.cantidad}</div>
                  </div>
                  <div className="font-mono text-sm">{fmt(it.precio * it.cantidad)}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="px-6 pb-6 space-y-2 text-sm">
            <div className="flex justify-between text-rock/65"><span>Subtotal</span><span className="font-mono">{fmt(order.subtotal)}</span></div>
            {order.descuento > 0 && (
              <div className="flex justify-between text-alpenglow"><span>Descuento {order.descuentoCodigo}</span><span className="font-mono">−{fmt(order.descuento)}</span></div>
            )}
            <div className="flex items-baseline justify-between border-t border-rock/15 pt-3 mt-3">
              <span className="font-narrow font-bold uppercase tracking-widest-2">Total pagado</span>
              <span className="font-display font-black tracking-tightest text-2xl">{fmt(order.total)}</span>
            </div>
          </div>
        </div>

        <p className="text-center text-rock/55 text-xs mt-6">
          Los precios son los vigentes al momento de la compra.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
          <Button variant="primary" size="lg" onClick={() => dispatch(navigate('orders'))}
            iconRight={<IconArrowRight size={16}/>}>Ver mis órdenes</Button>
          <Button variant="ghost-light" size="lg" onClick={() => dispatch(navigate('home'))}>
            Seguir comprando
          </Button>
        </div>
      </div>
    </div>
  );
};

/* Status tracker — accepts either API estado or legacy status */
const StatusTracker = ({ status }) => {
  const steps = ['Recibida', 'Confirmada', 'Enviada', 'Entregada'];
  const map = { PENDIENTE: 0, CONFIRMADA: 1, ENVIADA: 2, ENTREGADA: 3, CANCELADA: -1 };
  const active = map[status] ?? 0;
  return (
    <div className="flex items-center">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div className="flex flex-col items-center flex-1">
            <span className={`h-7 w-7 rounded-full grid place-items-center text-[10px] font-mono font-bold
              ${i <= active ? 'bg-pine text-ivory' : 'bg-rock/10 text-rock/45'}`}>
              {i <= active ? <IconCheck size={12} stroke={2.6}/> : i + 1}
            </span>
            <span className={`mt-2 font-mono text-[9px] tracking-widest-2 uppercase
              ${i <= active ? 'text-pine' : 'text-rock/40'}`}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-[2] h-px -mt-7 ${i < active ? 'bg-pine' : 'bg-rock/15'}`}/>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

window.Confirmation = Confirmation;
window.StatusTracker = StatusTracker;
