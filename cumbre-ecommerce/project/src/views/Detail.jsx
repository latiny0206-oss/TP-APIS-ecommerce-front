/* Product Detail view — gallery + variants + qty + add to cart */

const Detail = () => {
  const dispatch = useDispatch();
  const productId = useSelector((s) => s.navigation.params.productId);
  const product = useSelector((s) => s.products.byId[productId]);

  const [activeImg, setActiveImg] = React.useState(0);
  const [selectedColor, setSelectedColor] = React.useState(null);
  const [selectedSize, setSelectedSize] = React.useState(null);
  const [qty, setQty] = React.useState(1);
  const [added, setAdded] = React.useState(false);

  React.useEffect(() => {
    if (!product) return;
    const firstAvailable = product.variants.find((v) => v.stock > 0) || product.variants[0];
    setSelectedColor(firstAvailable.color);
    setSelectedSize(firstAvailable.size);
    setActiveImg(0);
  }, [productId]);

  if (!product) {
    return (
      <div className="bg-ivory text-rock min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="font-display font-black text-3xl tracking-tightest uppercase mb-3">Producto no encontrado</div>
          <Button variant="primary" onClick={() => dispatch(navigate('catalog'))}>Volver al catálogo</Button>
        </div>
      </div>
    );
  }

  const colors = [...new Set(product.variants.map((v) => v.color))];
  const sizes = [...new Set(product.variants.filter((v) => v.color === selectedColor).map((v) => v.size))];
  const currentVariant = product.variants.find((v) => v.color === selectedColor && v.size === selectedSize);
  const availableStock = currentVariant?.stock ?? 0;
  const outOfStock = availableStock === 0;

  const handleAdd = () => {
    if (outOfStock) return;
    dispatch(addCartItemAsync({
      idVariante: currentVariant.id,
      cantidad: qty,
      productoId: product.id,
      variant: { color: selectedColor, size: selectedSize, talla: selectedSize },
      unitPrice: currentVariant.precio || product.price,
      name: product.nombre || product.name,
    }));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-ivory text-rock min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8 lg:py-12">

        <Breadcrumb items={[
          { label: 'Inicio',   view: 'home' },
          { label: 'Catálogo', view: 'catalog' },
          { label: product.category, view: 'catalog', params: { filter: product.category } },
          { label: product.name },
        ]} />

        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-16 mt-8">

          {/* Gallery */}
          <div className="grid grid-cols-[80px_1fr] gap-4">
            <div className="flex flex-col gap-3">
              {product.images.map((src, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`aspect-square overflow-hidden border-2 transition-all ${activeImg === i ? 'border-pine' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  style={{ backgroundColor: product.color }}>
                  <img src={src} alt="" className="w-full h-full object-cover"
                       onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </button>
              ))}
            </div>
            <div className="relative aspect-[4/5] overflow-hidden" style={{ backgroundColor: product.color }}>
              <img src={product.images[activeImg]} alt={product.name}
                className="w-full h-full object-cover fadein" key={activeImg}
                onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              {product.tag && (
                <div className="absolute top-4 left-4">
                  <StatusBadge status={product.tag} />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="lg:py-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow">{product.brand}</span>
              <span className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/40">SKU · {product.id.toUpperCase()}</span>
            </div>

            <h1 className="font-display font-black tracking-tightest uppercase text-4xl lg:text-5xl leading-[0.95] mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex gap-1 text-alpenglow">
                {[0,1,2,3,4].map((s) => <IconStar key={s} size={14} stroke={1} fill="currentColor"/>)}
              </div>
              <span className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/55">
                {product.rating} · {product.reviews} reseñas
              </span>
            </div>

            {/* Promo strip */}
            {product.oldPrice && (
              <div className="bg-alpenglow/10 border border-alpenglow/30 px-4 py-2 mb-5 inline-flex items-center gap-2">
                <IconTag size={12} className="text-alpenglow"/>
                <span className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow">
                  20% OFF · INVIERNO24
                </span>
              </div>
            )}

            <div className="flex items-baseline gap-3 mb-8">
              <span className="font-display font-black tracking-tightest text-4xl lg:text-5xl">{fmt(product.price)}</span>
              {product.oldPrice && <span className="text-rock/40 line-through text-lg">{fmt(product.oldPrice)}</span>}
            </div>

            {/* Color */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <FieldLabel>Color: <span className="text-rock font-normal normal-case tracking-normal text-sm font-narrow font-bold">{selectedColor}</span></FieldLabel>
              </div>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button key={c} onClick={() => {
                    setSelectedColor(c);
                    const newSizes = product.variants.filter((v) => v.color === c).map((v) => v.size);
                    if (!newSizes.includes(selectedSize)) setSelectedSize(newSizes[0]);
                  }}
                    className={`px-4 h-10 border font-mono text-xs tracking-widest-2 uppercase transition-all
                      ${selectedColor === c ? 'border-pine bg-pine text-ivory' : 'border-rock/20 hover:border-rock'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <FieldLabel>Talla: <span className="text-rock font-normal normal-case tracking-normal text-sm font-narrow font-bold">{selectedSize}</span></FieldLabel>
                <button className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 hover:text-pine underline">
                  Guía de tallas
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => {
                  const v = product.variants.find((vv) => vv.color === selectedColor && vv.size === s);
                  const dis = !v || v.stock === 0;
                  return (
                    <button key={s} disabled={dis} onClick={() => setSelectedSize(s)}
                      className={`min-w-[3rem] px-4 h-11 border font-mono text-sm tracking-widest-2 uppercase transition-all
                        ${selectedSize === s ? 'border-pine bg-pine text-ivory' :
                          dis ? 'border-rock/10 text-rock/30 line-through cursor-not-allowed' :
                          'border-rock/20 hover:border-rock'}`}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stock + Qty + Add */}
            <div className="border-t border-rock/10 pt-6 space-y-5">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-2 font-mono text-[11px] tracking-widest-2 uppercase ${outOfStock ? 'text-red-700' : 'text-pine'}`}>
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${outOfStock ? 'bg-red-700' : 'bg-pine'}`}/>
                  {outOfStock ? 'Sin stock' : `Disponible — ${availableStock} unidades`}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <QtyStepper value={qty} onChange={setQty} max={availableStock || 1} />
                <Button variant={added ? 'solid' : 'primary'} size="lg" onClick={handleAdd}
                  disabled={outOfStock} className="flex-1"
                  iconRight={!outOfStock && !added && <IconCart size={16} stroke={2.2}/>}>
                  {outOfStock ? 'Sin stock' : added ? '✓ Agregado al carrito' : 'Agregar al carrito'}
                </Button>
              </div>

              <Button variant="ghost-light" size="md" className="w-full"
                onClick={() => dispatch(navigate('cart'))}>
                Ver carrito
              </Button>
            </div>

            {/* Spec strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 mt-8 border-t border-rock/10 pt-6 gap-x-4">
              {Object.entries(product.specs).map(([k, v]) => (
                <div key={k}>
                  <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/45">{k}</div>
                  <div className="font-narrow font-bold text-sm mt-1">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description + Features */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 mt-20 pb-20">
          <div>
            <div className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow mb-3">— Descripción</div>
            <h2 className="font-display font-black tracking-tightest uppercase text-3xl mb-4">
              Construido para resistir
            </h2>
            <p className="text-rock/75 leading-relaxed">{product.desc}</p>
          </div>
          <div>
            <div className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow mb-3">— Características técnicas</div>
            <ul className="space-y-3">
              {product.features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 pb-3 border-b border-rock/10">
                  <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/40 mt-1">/0{i+1}</span>
                  <span className="text-rock/85">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

window.Detail = Detail;
