/* Admin Products — grid with search + drawer for POST/PUT /api/productos
 * Payload shape: { marcaId, categoriaId, nombre, descripcion, estado, precioBase } */

const AdminProducts = () => {
  const dispatch = useDispatch();
  const productIds = useSelector((s) => s.products.ids);
  const productsById = useSelector((s) => s.products.byId);
  const drawerOpen = useSelector((s) => s.ui.newProductDrawerOpen);
  const editId = useSelector((s) => s.ui.editProductId);

  const [query, setQuery] = React.useState('');
  const products = productIds.map((id) => productsById[id])
    .filter((p) => !query || (p.nombre + ' ' + p.brand).toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-rock/40"/>
          <Input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o marca…" className="pl-10"/>
        </div>
        <Button variant="primary" onClick={() => dispatch(openProductDrawer())}
          icon={<IconPlus size={14} stroke={2.2}/>}>
          Nuevo producto
        </Button>
      </div>

      <div className="bg-white border border-rock/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-rock/[0.02]">
              {['Producto', 'marcaId', 'categoriaId', 'Stock', 'precioBase', 'estado', 'Acciones'].map((h) => (
                <th key={h} className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-rock/10 hover:bg-rock/[0.02]">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden bg-rock-700 shrink-0" style={{ backgroundColor: p.color }}>
                      {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover"
                                              onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-narrow font-bold uppercase tracking-tight text-sm truncate max-w-[260px]">{p.nombre}</div>
                      <div className="font-mono text-[10px] text-rock/45">productoId · #{p.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 font-mono text-xs text-rock/75">
                  <span className="text-rock/40">#{p.marcaId}</span> · {p.brand}
                </td>
                <td className="px-5 py-3 text-sm">
                  <span className="font-mono text-xs text-rock/40">#{p.categoriaId}</span> · {p.category}
                </td>
                <td className="px-5 py-3">
                  <span className={`font-mono text-xs font-bold ${p.stock === 0 ? 'text-red-700' : p.stock <= 3 ? 'text-alpenglow' : 'text-pine'}`}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-5 py-3 font-mono text-xs font-bold">{fmt(p.precioBase)}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex font-mono text-[10px] tracking-widest-2 uppercase
                    ${p.estado === 'ACTIVO' ? 'text-pine' : 'text-rock/45'}`}>{p.estado || 'ACTIVO'}</span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => dispatch(openProductDrawer(p.id))}
                      className="h-8 w-8 grid place-items-center text-rock/55 hover:text-pine border border-rock/15">
                      <IconEdit size={13}/>
                    </button>
                    <button onClick={() => dispatch(navigate({ view: 'admin-photos', params: { productId: p.id } }))}
                      className="h-8 w-8 grid place-items-center text-rock/55 hover:text-pine border border-rock/15">
                      <IconImage size={13}/>
                    </button>
                    <button onClick={() => dispatch(deleteProduct(p.id))}
                      className="h-8 w-8 grid place-items-center text-rock/55 hover:text-red-700 border border-rock/15">
                      <IconTrash size={13}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {drawerOpen && <ProductDrawer productId={editId} />}
    </div>
  );
};

const ProductDrawer = ({ productId }) => {
  const dispatch = useDispatch();
  const existing = useSelector((s) => productId ? s.products.byId[productId] : null);
  const categorias = useSelector((s) => s.taxonomies.categorias);
  const marcas = useSelector((s) => s.taxonomies.marcas);

  const [form, setForm] = React.useState(() => existing ? {
    nombre: existing.nombre,
    descripcion: existing.descripcion,
    marcaId: existing.marcaId,
    categoriaId: existing.categoriaId,
    precioBase: existing.precioBase,
    estado: existing.estado || 'ACTIVO',
    tag: existing.tag || null,
  } : {
    nombre: '',
    descripcion: '',
    marcaId: marcas[0]?.id || 1,
    categoriaId: categorias[0]?.id || 1,
    precioBase: 0,
    estado: 'ACTIVO',
    tag: null,
  });

  const close = () => dispatch(closeProductDrawer());
  const save = () => {
    const marca = marcas.find((m) => m.id === Number(form.marcaId));
    const cat   = categorias.find((c) => c.id === Number(form.categoriaId));
    const next = existing ? {
      ...existing,
      ...form,
      marcaId: Number(form.marcaId),
      categoriaId: Number(form.categoriaId),
      precioBase: Number(form.precioBase),
      // re-derive legacy aliases so views stay in sync
      nombre: form.nombre, descripcion: form.descripcion,
      name: form.nombre, desc: form.descripcion, price: Number(form.precioBase),
      brand: (marca?.nombre || '').toUpperCase(),
      category: cat?.nombre || '',
    } : {
      id: Math.max(...PRODUCTOS_RAW.map((p) => p.id)) + Math.floor(Math.random() * 1000) + 1,
      ...form,
      marcaId: Number(form.marcaId),
      categoriaId: Number(form.categoriaId),
      precioBase: Number(form.precioBase),
      name: form.nombre, desc: form.descripcion, price: Number(form.precioBase),
      brand: (marca?.nombre || '').toUpperCase(),
      category: cat?.nombre || '',
      rating: 0, reviews: 0,
      color: '#454338',
      images: [], variants: [],
      features: [], specs: {}, stock: 0,
    };
    dispatch(upsertProduct(next));
    close();
  };

  return (
    <>
      <div className="fixed inset-0 bg-rock/60 z-40 fadein" onClick={close}/>
      <aside className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-ivory text-rock z-50 shadow-2xl flex flex-col fadein">
        <header className="flex items-center justify-between p-5 border-b border-rock/10">
          <div>
            <div className="font-mono text-[10px] tracking-widest-2 uppercase text-alpenglow">
              {existing ? `PUT /api/productos/${existing.id}` : 'POST /api/productos'}
            </div>
            <h2 className="font-display font-black tracking-tightest uppercase text-xl mt-0.5">
              {existing ? form.nombre || 'Producto sin nombre' : 'Crear producto'}
            </h2>
          </div>
          <button onClick={close} className="h-9 w-9 grid place-items-center border border-rock/15 hover:bg-rock/5">
            <IconX size={16}/>
          </button>
        </header>

        <div className="flex-1 overflow-auto p-5 space-y-4">
          <label className="block">
            <FieldLabel>nombre</FieldLabel>
            <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Mochila Atmos AG 65"/>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <FieldLabel>marcaId</FieldLabel>
              <select value={form.marcaId} onChange={(e) => setForm({ ...form, marcaId: e.target.value })}
                className="input-base w-full">
                {marcas.map((m) => <option key={m.id} value={m.id}>#{m.id} · {m.nombre}</option>)}
              </select>
            </label>
            <label className="block">
              <FieldLabel>categoriaId</FieldLabel>
              <select value={form.categoriaId} onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
                className="input-base w-full">
                {categorias.map((c) => <option key={c.id} value={c.id}>#{c.id} · {c.nombre}</option>)}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <FieldLabel>precioBase ($)</FieldLabel>
              <Input type="number" value={form.precioBase} onChange={(e) => setForm({ ...form, precioBase: e.target.value })}/>
            </label>
            <label className="block">
              <FieldLabel>estado</FieldLabel>
              <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}
                className="input-base w-full">
                <option value="ACTIVO">ACTIVO</option>
                <option value="INACTIVO">INACTIVO</option>
              </select>
            </label>
          </div>

          <label className="block">
            <FieldLabel>descripcion</FieldLabel>
            <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              rows={4} placeholder="Cuenta la historia del producto…"
              className="input-base w-full resize-none"/>
          </label>

          <label className="block">
            <FieldLabel>Etiqueta destacada</FieldLabel>
            <select value={form.tag || ''} onChange={(e) => setForm({ ...form, tag: e.target.value || null })}
              className="input-base w-full">
              <option value="">Sin etiqueta</option>
              <option value="INVIERNO">INVIERNO</option>
              <option value="NUEVO">NUEVO</option>
              <option value="BESTSELLER">BESTSELLER</option>
              <option value="TODO TERRENO">TODO TERRENO</option>
            </select>
          </label>

          {existing && (
            <div className="bg-pine/5 border border-pine/30 p-4">
              <div className="font-mono text-[10px] tracking-widest-2 uppercase text-pine mb-1">Variantes</div>
              <div className="text-sm text-rock/75 mb-3">{existing.variants?.length || 0} combinaciones registradas</div>
              <Button variant="ghost-light" size="sm" onClick={() => { close(); dispatch(navigate({ view: 'admin-variants', params: { productId: existing.id } })); }}>
                Editar variantes →
              </Button>
            </div>
          )}
        </div>

        <footer className="border-t border-rock/10 p-5 flex gap-3">
          <Button variant="ghost-light" size="md" className="flex-1" onClick={close}>Cancelar</Button>
          <Button variant="primary" size="md" className="flex-1" onClick={save}
            iconRight={<IconCheck size={14} stroke={2.6}/>}>
            {existing ? 'Guardar' : 'Crear producto'}
          </Button>
        </footer>
      </aside>
    </>
  );
};

window.AdminProducts = AdminProducts;
