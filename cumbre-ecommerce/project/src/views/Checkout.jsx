/* Checkout view — order review + form for shipping; confirm dispatches checkoutThunk */

const Checkout = () => {
  const dispatch = useDispatch();
  const items = useSelector((s) => s.cart.items);
  const coupon = useSelector((s) => s.cart.coupon);
  const totals = useSelector(selectCartTotals);
  const user = useSelector((s) => s.auth.user);

  const [ship, setShip] = React.useState({
    fullName: user?.name || '', email: user?.email || '',
    phone: '+56 9 1234 5678',
    address: 'Av. Cordillera 1234',
    city: 'Bariloche', state: 'Río Negro', zip: '8400',
  });
  const [payment, setPayment] = React.useState('card');
  const [processing, setProcessing] = React.useState(false);

  React.useEffect(() => {
    if (items.length === 0) dispatch(navigate('cart'));
  }, [items.length]);

  const placeOrder = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 900));
    dispatch(checkoutThunk());
  };

  return (
    <div className="bg-ivory text-rock min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 lg:py-14">

        <Breadcrumb items={[
          { label: 'Inicio', view: 'home' },
          { label: 'Mi carrito', view: 'cart' },
          { label: 'Checkout' },
        ]} />

        <h1 className="font-display font-black tracking-tightest uppercase text-5xl lg:text-6xl leading-[0.9] mt-6 mb-10">
          Confirmá tu orden
        </h1>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-16">

          {/* Left — forms */}
          <div className="space-y-8">

            {/* Shipping */}
            <Section title="Envío" eyebrow="01 — Destino">
              <div className="grid sm:grid-cols-2 gap-4">
                <label><FieldLabel>Nombre completo</FieldLabel>
                  <Input value={ship.fullName} onChange={(e) => setShip({ ...ship, fullName: e.target.value })}/></label>
                <label><FieldLabel>Correo</FieldLabel>
                  <Input type="email" value={ship.email} onChange={(e) => setShip({ ...ship, email: e.target.value })}/></label>
                <label><FieldLabel>Teléfono</FieldLabel>
                  <Input value={ship.phone} onChange={(e) => setShip({ ...ship, phone: e.target.value })}/></label>
                <label><FieldLabel>Código postal</FieldLabel>
                  <Input value={ship.zip} onChange={(e) => setShip({ ...ship, zip: e.target.value })}/></label>
                <label className="sm:col-span-2"><FieldLabel>Dirección</FieldLabel>
                  <Input value={ship.address} onChange={(e) => setShip({ ...ship, address: e.target.value })}/></label>
                <label><FieldLabel>Ciudad</FieldLabel>
                  <Input value={ship.city} onChange={(e) => setShip({ ...ship, city: e.target.value })}/></label>
                <label><FieldLabel>Provincia / Región</FieldLabel>
                  <Input value={ship.state} onChange={(e) => setShip({ ...ship, state: e.target.value })}/></label>
              </div>
            </Section>

            {/* Shipping method */}
            <Section title="Método de envío" eyebrow="02 — Logística">
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { id: 'express', label: 'Express 48h', sub: 'Disponible' },
                  { id: 'pickup',  label: 'Retiro en tienda', sub: '14 puntos · 24h' },
                ].map((m, i) => (
                  <label key={m.id}
                    className={`relative flex items-start gap-3 p-4 border cursor-pointer transition-all ${i === 0 ? 'border-pine bg-pine/5' : 'border-rock/15 hover:border-rock'}`}>
                    <input type="radio" name="ship" defaultChecked={i === 0} className="mt-1 accent-pine"/>
                    <div>
                      <div className="font-narrow font-bold uppercase tracking-widest-2 text-xs">{m.label}</div>
                      <div className="font-mono text-[10px] text-rock/55 mt-1">{m.sub}</div>
                    </div>
                    <span className="ml-auto font-mono text-[11px] text-pine">Gratis</span>
                  </label>
                ))}
              </div>
            </Section>

            {/* Payment */}
            <Section title="Pago" eyebrow="03 — Método">
              <div className="grid sm:grid-cols-2 gap-3 mb-5">
                {[
                  { id: 'card',  label: 'Tarjeta de crédito' },
                  { id: 'debit', label: 'Débito' },
                ].map((p) => (
                  <button key={p.id} onClick={() => setPayment(p.id)}
                    className={`p-4 border text-left transition-all ${payment === p.id ? 'border-pine bg-pine/5' : 'border-rock/15 hover:border-rock'}`}>
                    <div className="font-narrow font-bold uppercase tracking-widest-2 text-xs">{p.label}</div>
                    <div className="font-mono text-[10px] text-rock/55 mt-1">12 cuotas sin interés</div>
                  </button>
                ))}
              </div>
              {payment === 'card' && (
                <div className="grid sm:grid-cols-2 gap-4 fadein">
                  <label className="sm:col-span-2"><FieldLabel>Número de tarjeta</FieldLabel>
                    <Input placeholder="•••• •••• •••• 4242" defaultValue="4242 4242 4242 4242"/></label>
                  <label><FieldLabel>Vencimiento</FieldLabel>
                    <Input placeholder="MM / AA" defaultValue="08 / 28"/></label>
                  <label><FieldLabel>CVV</FieldLabel>
                    <Input placeholder="•••" defaultValue="123"/></label>
                </div>
              )}
            </Section>
          </div>

          {/* Right — order summary */}
          <aside className="lg:sticky lg:top-24 h-fit bg-rock text-ivory p-7 lg:p-9">
            <div className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow mb-2">Tu pedido</div>
            <h2 className="font-display font-black tracking-tightest uppercase text-3xl mb-6">
              {items.length} productos
            </h2>

            <div className="space-y-3 mb-6 max-h-72 overflow-auto pr-2 no-scrollbar">
              {items.map((line) => (
                <div key={line.lineId} className="flex items-start gap-3 pb-3 border-b border-ivory/10">
                  <div className="flex-1 min-w-0">
                    <div className="font-narrow font-bold uppercase tracking-tight text-sm leading-tight">{line.name}</div>
                    <div className="font-mono text-[10px] tracking-widest-2 uppercase text-ivory/45 mt-1">
                      {line.variant.color} · {line.variant.size} · ×{line.qty}
                    </div>
                  </div>
                  <div className="font-mono text-sm whitespace-nowrap">{fmt(line.unitPrice * line.qty)}</div>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-6 border-t border-ivory/15 pt-5 text-sm">
              <div className="flex justify-between text-ivory/75"><span>Subtotal</span><span className="font-mono">{fmt(totals.subtotal)}</span></div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-alpenglow"><span>Descuento {coupon?.code}</span><span className="font-mono">−{fmt(totals.discount)}</span></div>
              )}
              <div className="flex justify-between text-ivory/45"><span>Envío</span><span className="font-mono">Gratis</span></div>
            </div>
            <div className="flex items-baseline justify-between border-t border-ivory/15 pt-5 mb-7">
              <span className="font-narrow font-bold uppercase tracking-widest-2">Total a pagar</span>
              <span className="font-display font-black tracking-tightest text-3xl">{fmt(totals.total)}</span>
            </div>

            <Button variant="secondary" size="lg" className="w-full"
              onClick={placeOrder} disabled={processing}
              iconRight={!processing && <IconCheck size={16} stroke={2.2}/>}>
              {processing ? 'Procesando…' : 'Confirmar orden'}
            </Button>

            <div className="mt-4 font-mono text-[10px] tracking-widest-2 uppercase text-ivory/40 text-center">
              Al confirmar aceptas los términos y condiciones
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, eyebrow, children }) => (
  <section>
    <div className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow mb-3">{eyebrow}</div>
    <h2 className="font-display font-black tracking-tightest uppercase text-3xl mb-6">{title}</h2>
    {children}
  </section>
);

window.Checkout = Checkout;
