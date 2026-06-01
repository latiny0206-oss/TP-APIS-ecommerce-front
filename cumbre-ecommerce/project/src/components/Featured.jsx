/* Featured products grid — pulls 4 from products slice */

const Featured = () => {
  const productIds = useSelector((s) => s.products.ids);
  const productsById = useSelector((s) => s.products.byId);
  const dispatch = useDispatch();

  // Pick the first 4 products
  const featured = productIds.slice(0, 4).map((id) => productsById[id]).filter(Boolean);

  return (
    <section className="relative py-20 lg:py-28 bg-ivory text-rock">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">

        <SectionHeader
          number="02" eyebrow="Selección Pro"
          title={<>Equipamiento<br/>destacado</>}
          dark={false}
          action={
            <button onClick={() => dispatch(navigate('catalog'))}
              className="self-start lg:self-end inline-flex items-center gap-2 font-narrow font-bold uppercase tracking-widest-2 text-sm hover:text-alpenglow link-underline text-rock">
              Ver todos los 148 productos
              <IconArrowRight size={16} stroke={2.2} />
            </button>
          } />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 lg:gap-y-12 mt-12 lg:mt-16">
          {featured.map((p) => <ProductCard key={p.id} product={p} dark={false} />)}
        </div>

        {/* Trust strip */}
        <div className="mt-16 lg:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-px bg-rock/10 border border-rock/10">
          {[
            { Icon: IconTruck,    label: 'Envío express',   sub: '48h a todo el país' },
            { Icon: IconShield,   label: 'Garantía Pro',    sub: 'De por vida' },
            { Icon: IconCompass,  label: 'Asesoría 1:1',    sub: 'Guías certificados' },
            { Icon: IconCheck,    label: 'Cambios fáciles', sub: 'Hasta 30 días' },
          ].map((t, i) => (
            <div key={i} className="bg-ivory p-5 lg:p-7 flex items-center gap-4">
              <span className="h-11 w-11 grid place-items-center border border-rock/15 text-rock">
                <t.Icon size={20} />
              </span>
              <div>
                <div className="font-narrow font-bold uppercase tracking-widest-2 text-sm">{t.label}</div>
                <div className="text-xs text-rock/55 mt-0.5">{t.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

window.Featured = Featured;
