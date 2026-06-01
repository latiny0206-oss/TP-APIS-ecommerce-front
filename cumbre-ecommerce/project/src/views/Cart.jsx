/* Cart view — line items, coupon, summary */

const Cart = () => {
  const dispatch = useDispatch();
  const items   = useSelector((s) => s.cart.items);
  const coupon  = useSelector((s) => s.cart.coupon);
  const couponError = useSelector((s) => s.cart.couponError);
  const totals  = useSelector(selectCartTotals);
  const productsById = useSelector((s) => s.products.byId);

  const [couponInput, setCouponInput] = React.useState(coupon?.code || '');

  return (
    <div className="bg-ivory text-rock min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 lg:py-14">

        <Breadcrumb items={[
          { label: 'Inicio', view: 'home' },
          { label: 'Mi carrito' },
        ]} />

        <div className="flex items-end justify-between gap-6 mt-6 mb-10">
          <div>
            <h1 className="font-display font-black tracking-tightest uppercase text-5xl lg:text-7xl leading-[0.9]">Mi carrito</h1>
            <p className="mt-3 font-mono text-[11px] tracking-widest-2 uppercase text-rock/55">
              {items.length} productos · {totals.itemCount} unidades
            </p>
          </div>
          <button onClick={() => dispatch(navigate('catalog'))}
            className="hidden sm:inline-flex items-center gap-2 font-mono text-[11px] tracking-widest-2 uppercase text-rock/55 hover:text-pine">
            <IconChevronLeft size={12}/> Seguir comprando
          </button>
        </div>

        {items.length === 0 ? (
          <EmptyCart onShop={() => dispatch(navigate('catalog'))} />
        ) : (
          <div className="grid lg:grid-cols-[1fr_420px] gap-10 lg:gap-16">

            {/* Items */}
            <div className="space-y-3">
              {items.map((line) => {
                const p = productsById[line.productId];
                return (
                  <div key={line.lineId}
                    className="grid grid-cols-[100px_1fr_auto] sm:grid-cols-[140px_1fr_auto_auto] gap-4 sm:gap-6 items-center bg-white border border-rock/10 p-4">

                    {/* Image */}
                    <button onClick={() => dispatch(navigate({ view: 'detail', params: { productId: line.productId } }))}
                      className="aspect-square overflow-hidden bg-rock-700"
                      style={{ backgroundColor: p?.color || '#454338' }}>
                      {p?.images?.[0] && <img src={p.images[0]} alt={line.name} className="w-full h-full object-cover"
                                              onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
                    </button>

                    {/* Info */}
                    <div className="min-w-0">
                      <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55">{p?.brand}</div>
                      <h3 className="font-narrow font-bold uppercase tracking-tight text-base sm:text-lg mt-1 leading-tight">{line.name}</h3>
                      <div className="font-mono text-[11px] text-rock/55 mt-1">
                        {line.variant.color} · Talla {line.variant.size}
                      </div>
                      {p?.stock <= 3 && p?.stock > 0 && (
                        <div className="font-mono text-[10px] tracking-widest-2 uppercase text-alpenglow mt-2">
                          ⚠ Solo quedan {p.stock} unidades
                        </div>
                      )}
                    </div>

                    {/* Qty */}
                    <div className="col-span-3 sm:col-span-1 flex items-center justify-between sm:justify-start sm:flex-col sm:items-end gap-2">
                      <QtyStepper value={line.qty} onChange={(v) => dispatch(updateQty({ lineId: line.lineId, qty: v }))} />
                      <button onClick={() => dispatch(removeItem(line.lineId))}
                        className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 hover:text-red-700 flex items-center gap-1.5">
                        <IconTrash size={12}/> Quitar
                      </button>
                    </div>

                    {/* Price (desktop only — squeezed in 4th col on sm+) */}
                    <div className="hidden sm:block text-right">
                      <div className="font-display font-black tracking-tightest text-xl">{fmt(line.unitPrice * line.qty)}</div>
                      {line.qty > 1 && <div className="font-mono text-[10px] text-rock/45 mt-1">{fmt(line.unitPrice)} c/u</div>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <aside className="lg:sticky lg:top-24 h-fit bg-rock text-ivory p-7 lg:p-9">
              <div className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow mb-2">Resumen</div>
              <h2 className="font-display font-black tracking-tightest uppercase text-3xl mb-6">Tu pedido</h2>

              {/* Coupon */}
              <div className="mb-6 pb-6 border-b border-ivory/15">
                <FieldLabelDark>Código de descuento</FieldLabelDark>
                {coupon ? (
                  <div className="flex items-center gap-2 p-3 bg-pine/20 border border-pine/40">
                    <IconCheck size={16} stroke={2.6} className="text-pine-300"/>
                    <div className="flex-1 font-mono text-xs tracking-widest-2 uppercase text-pine-300">
                      {coupon.label}
                    </div>
                    <button onClick={() => dispatch(removeCoupon())} className="text-ivory/55 hover:text-ivory">
                      <IconX size={14}/>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <Input dark value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                             placeholder="INVIERNO24" className="flex-1"/>
                      <Button variant="secondary" size="md" onClick={() => dispatch(applyCoupon(couponInput))}>
                        Aplicar
                      </Button>
                    </div>
                    {couponError && (
                      <div className="font-mono text-[10px] tracking-widest-2 uppercase text-red-300 mt-2">
                        ⚠ {couponError}
                      </div>
                    )}
                    <div className="font-mono text-[10px] tracking-widest-2 uppercase text-ivory/40 mt-2">
                      Prueba: INVIERNO24 · NUEVOSOCIO · ENVIOPRO
                    </div>
                  </>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-6">
                <Row label="Subtotal" value={fmt(totals.subtotal)} />
                {totals.discount > 0 && <Row label="Descuento" value={`− ${fmt(totals.discount)}`} accent />}
                <Row label="Envío" value="Gratis" muted />
              </div>
              <div className="flex items-baseline justify-between border-t border-ivory/15 pt-5 mb-7">
                <span className="font-narrow font-bold uppercase tracking-widest-2">Total</span>
                <span className="font-display font-black tracking-tightest text-3xl">{fmt(totals.total)}</span>
              </div>

              <Button variant="primary" size="lg" className="w-full"
                onClick={() => dispatch(navigate('checkout'))}
                iconRight={<IconArrowRight size={16} stroke={2.2}/>}>
                Ir al checkout
              </Button>
              <div className="mt-4 font-mono text-[10px] tracking-widest-2 uppercase text-ivory/40 text-center">
                Pago seguro · Envío 48h
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

const Row = ({ label, value, accent, muted }) => (
  <div className="flex justify-between text-sm">
    <span className={muted ? 'text-ivory/45' : 'text-ivory/70'}>{label}</span>
    <span className={accent ? 'text-alpenglow font-mono' : 'text-ivory font-mono'}>{value}</span>
  </div>
);

const EmptyCart = ({ onShop }) => (
  <div className="text-center py-24 border border-dashed border-rock/20 bg-white">
    <IconCart size={48} stroke={1.2} className="mx-auto text-rock/30 mb-6"/>
    <div className="font-display font-black uppercase text-3xl tracking-tightest mb-3">Tu carrito está vacío</div>
    <p className="text-rock/55 mb-8 max-w-md mx-auto">Agrega productos desde el catálogo para empezar tu expedición.</p>
    <Button variant="primary" onClick={onShop} iconRight={<IconArrowRight size={16}/>}>Explorar catálogo</Button>
  </div>
);

window.Cart = Cart;
