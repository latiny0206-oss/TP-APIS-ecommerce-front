/* Admin Variants — full editor for color/talla/material/peso/precio/stock/estacion */

const ESTACION_OPTIONS = [
  { value: 'INVIERNO', label: 'Invierno' },
  { value: 'VERANO',   label: 'Verano' },
  { value: 'TODAS',    label: 'Todas' },
];

const AdminVariants = () => {
  const dispatch = useDispatch();
  const productIds = useSelector((s) => s.products.ids);
  const productsById = useSelector((s) => s.products.byId);
  const paramId = useSelector((s) => s.navigation.params.productId);

  const [selectedId, setSelectedId] = React.useState(paramId || productIds[0]);
  const product = productsById[selectedId];
  const [newRow, setNewRow] = React.useState(null);

  if (!product) return null;

  const startNew = () => setNewRow({
    id: Date.now(),
    color: 'Negro', talla: 'M', material: '210D Nylon',
    peso: 500, stock: 0, precio: product.precioBase || product.price, estacion: 'TODAS',
  });
  const commitNew = () => {
    dispatch(updateVariant({ productoId: product.id, variant: newRow }));
    setNewRow(null);
  };

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-6">

      <aside className="bg-white border border-rock/10 h-fit">
        <div className="p-4 border-b border-rock/10">
          <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55">Producto</div>
          <h2 className="font-narrow font-bold uppercase text-sm mt-0.5">Seleccionar</h2>
        </div>
        <ul className="max-h-[600px] overflow-auto">
          {productIds.map((id) => {
            const p = productsById[id];
            const active = id === selectedId;
            return (
              <li key={id}>
                <button onClick={() => setSelectedId(id)}
                  className={`w-full flex items-center gap-3 p-3 text-left border-b border-rock/5 transition-colors ${active ? 'bg-pine/5 border-l-2 border-l-pine' : 'hover:bg-rock/[0.02]'}`}>
                  <div className="h-10 w-10 bg-rock-700 shrink-0" style={{ backgroundColor: p.color }}>
                    {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover"
                                            onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-narrow font-bold text-xs uppercase tracking-tight truncate">{p.nombre || p.name}</div>
                    <div className="font-mono text-[10px] text-rock/55 mt-0.5">{p.variants?.length || 0} variantes</div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <section className="bg-white border border-rock/10">
        <header className="p-5 border-b border-rock/10 flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] tracking-widest-2 uppercase text-alpenglow">{product.brand}</div>
            <h2 className="font-display font-black tracking-tightest uppercase text-xl mt-0.5">{product.nombre || product.name}</h2>
            <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/45 mt-1">
              productoId · {product.id} · {product.variants.length} variantes activas
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={startNew} icon={<IconPlus size={12}/>}>
            Nueva variante
          </Button>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[820px]">
            <thead>
              <tr className="text-left bg-rock/[0.02]">
                {['idVariante', 'Color', 'Talla', 'Material', 'Peso (g)', 'Precio', 'Stock', 'Estación', ''].map((h) => (
                  <th key={h} className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {product.variants.map((v) => (
                <VariantRow key={v.id} product={product} variant={v}
                  onSave={(patch) => dispatch(updateVariant({ productoId: product.id, variant: { ...v, ...patch } }))}
                  onDelete={() => {
                    const remaining = product.variants.filter((vv) => vv.id !== v.id);
                    dispatch(upsertProduct({ ...product, variants: remaining }));
                  }}/>
              ))}
              {newRow && (
                <NewVariantRow row={newRow} onChange={setNewRow} onSave={commitNew} onCancel={() => setNewRow(null)} />
              )}
            </tbody>
          </table>
        </div>

        <footer className="p-5 border-t border-rock/10 flex items-center justify-between text-sm">
          <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55">
            Stock total: <span className="text-pine font-bold">{(product?.variants || []).reduce((s, v) => s + v.stock, 0)}</span> unidades
          </div>
          <Button variant="primary" size="md" iconRight={<IconCheck size={14}/>}>
            Guardar cambios
          </Button>
        </footer>
      </section>
    </div>
  );
};

const COLOR_SWATCH = {
  'Azul Marino': '#1f3a5f', 'Verde Oliva': '#3d4a2a', 'Negro': '#1a1a1a',
  'Rojo': '#9b1b1b', 'Azul': '#1d4ed8', 'Naranja': '#D9701A', 'Gris': '#6b7280',
  'Verde': '#3d6849', 'Marrón': '#6b4423',
};

const VariantRow = ({ product, variant, onSave, onDelete }) => {
  const [draft, setDraft] = React.useState(variant);
  React.useEffect(() => setDraft(variant), [variant.id]);

  const patch = (k, v) => {
    const next = { ...draft, [k]: v };
    setDraft(next);
    onSave({ [k]: v });
  };

  return (
    <tr className="border-t border-rock/10 hover:bg-rock/[0.02]">
      <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">#{variant.id}</td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 rounded-sm border border-rock/20 shrink-0"
                style={{ background: COLOR_SWATCH[variant.color] || '#454338' }}/>
          <span className="font-narrow font-bold text-xs whitespace-nowrap">{variant.color}</span>
        </span>
      </td>
      <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{variant.talla}</td>
      <td className="px-4 py-3 text-rock/65 text-xs whitespace-nowrap">{variant.material}</td>
      <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
        <input type="number" value={draft.peso}
          onChange={(e) => patch('peso', Math.max(0, Number(e.target.value) || 0))}
          className="w-20 px-2 h-8 border border-rock/15 font-mono text-xs text-center"/>
      </td>
      <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
        <input type="number" value={draft.precio}
          onChange={(e) => patch('precio', Math.max(0, Number(e.target.value) || 0))}
          className="w-24 px-2 h-8 border border-rock/15 font-mono text-xs text-center"/>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <input type="number" value={draft.stock}
            onChange={(e) => patch('stock', Math.max(0, Number(e.target.value) || 0))}
            className="w-16 px-2 h-8 border border-rock/15 font-mono text-xs text-center"/>
          {draft.stock === 0 && <StatusBadge status="AGOTADO" size="sm"/>}
          {draft.stock > 0 && draft.stock <= 2 && <StatusBadge status="STOCK BAJO" size="sm"/>}
        </div>
      </td>
      <td className="px-4 py-3">
        <select value={draft.estacion} onChange={(e) => patch('estacion', e.target.value)}
          className="h-8 px-2 border border-rock/15 font-mono text-xs">
          {ESTACION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </td>
      <td className="px-4 py-3">
        <button onClick={onDelete}
          className="h-8 w-8 grid place-items-center text-rock/55 hover:text-red-700 border border-rock/15">
          <IconTrash size={13}/>
        </button>
      </td>
    </tr>
  );
};

const NewVariantRow = ({ row, onChange, onSave, onCancel }) => (
  <tr className="border-t border-rock/10 bg-pine/5">
    <td className="px-4 py-3 font-mono text-[10px] text-pine">NUEVA</td>
    <td className="px-4 py-3">
      <input value={row.color} onChange={(e) => onChange({ ...row, color: e.target.value })}
        className="w-28 px-2 h-8 border border-rock/15 text-xs"/>
    </td>
    <td className="px-4 py-3">
      <input value={row.talla} onChange={(e) => onChange({ ...row, talla: e.target.value })}
        className="w-16 px-2 h-8 border border-rock/15 text-xs"/>
    </td>
    <td className="px-4 py-3">
      <input value={row.material} onChange={(e) => onChange({ ...row, material: e.target.value })}
        className="w-28 px-2 h-8 border border-rock/15 text-xs"/>
    </td>
    <td className="px-4 py-3">
      <input type="number" value={row.peso} onChange={(e) => onChange({ ...row, peso: Number(e.target.value) })}
        className="w-20 px-2 h-8 border border-rock/15 text-xs text-center"/>
    </td>
    <td className="px-4 py-3">
      <input type="number" value={row.precio} onChange={(e) => onChange({ ...row, precio: Number(e.target.value) })}
        className="w-24 px-2 h-8 border border-rock/15 text-xs text-center"/>
    </td>
    <td className="px-4 py-3">
      <input type="number" value={row.stock} onChange={(e) => onChange({ ...row, stock: Number(e.target.value) })}
        className="w-16 px-2 h-8 border border-rock/15 text-xs text-center"/>
    </td>
    <td className="px-4 py-3">
      <select value={row.estacion} onChange={(e) => onChange({ ...row, estacion: e.target.value })}
        className="h-8 px-2 border border-rock/15 font-mono text-xs">
        {ESTACION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </td>
    <td className="px-4 py-3">
      <div className="flex gap-1">
        <button onClick={onSave} className="h-8 w-8 grid place-items-center bg-pine text-ivory hover:bg-pine-700">
          <IconCheck size={13} stroke={2.4}/>
        </button>
        <button onClick={onCancel} className="h-8 w-8 grid place-items-center text-rock/55 hover:text-rock border border-rock/15">
          <IconX size={13}/>
        </button>
      </div>
    </td>
  </tr>
);

window.AdminVariants = AdminVariants;
