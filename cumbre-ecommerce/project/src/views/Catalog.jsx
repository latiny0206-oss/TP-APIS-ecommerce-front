/* Catalog view — sidebar filters + sorting + product grid */

const SORT_OPTIONS = [
  { id: 'relevance', label: 'Relevancia' },
  { id: 'price-asc', label: 'Precio: menor a mayor' },
  { id: 'price-desc', label: 'Precio: mayor a menor' },
  { id: 'newest',    label: 'Más nuevos' },
];

const Catalog = () => {
  const dispatch = useDispatch();
  const productIds = useSelector((s) => s.products.ids);
  const productsById = useSelector((s) => s.products.byId);
  const { categories, brands } = useSelector((s) => s.taxonomies);
  const initialFilter = useSelector((s) => s.navigation.params.filter || 'todos');

  const [selectedCats, setSelectedCats] = React.useState([]);
  const [selectedBrands, setSelectedBrands] = React.useState([]);
  const [selectedSeasons, setSelectedSeasons] = React.useState([]);
  const [sort, setSort] = React.useState('relevance');
  const [showSort, setShowSort] = React.useState(false);
  const [query, setQuery] = React.useState('');

  const products = productIds.map((id) => productsById[id]).filter(Boolean);
  const filtered = React.useMemo(() => {
    let out = products;
    if (query) out = out.filter((p) => (p.name + ' ' + p.brand).toLowerCase().includes(query.toLowerCase()));
    if (selectedCats.length)    out = out.filter((p) => selectedCats.includes(p.category));
    if (selectedBrands.length)  out = out.filter((p) => selectedBrands.includes(p.brand.toUpperCase()) || selectedBrands.includes(p.brand));
    if (selectedSeasons.length) out = out.filter((p) => selectedSeasons.includes(p.season));
    if (sort === 'price-asc')  out = [...out].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') out = [...out].sort((a, b) => b.price - a.price);
    return out;
  }, [products, selectedCats, selectedBrands, selectedSeasons, sort, query]);

  const toggle = (list, setList, v) =>
    setList(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const clearAll = () => { setSelectedCats([]); setSelectedBrands([]); setSelectedSeasons([]); setQuery(''); };

  return (
    <div className="bg-ivory text-rock min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 lg:py-14">

        {/* Breadcrumb */}
        <Breadcrumb items={[
          { label: 'Inicio', view: 'home' },
          { label: 'Catálogo' },
        ]} />

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mt-6 mb-10">
          <div>
            <h1 className="font-display font-black tracking-tightest uppercase text-5xl lg:text-7xl leading-[0.9]">
              Catálogo
            </h1>
            <p className="mt-3 font-mono text-[11px] tracking-widest-2 uppercase text-rock/55">
              {filtered.length} productos encontrados · Filtro activo: <span className="text-pine">{initialFilter}</span>
            </p>
          </div>

          {/* Sort */}
          <div className="relative">
            <button onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-3 px-4 h-11 border border-rock/20 hover:border-rock font-narrow font-bold uppercase tracking-widest-2 text-xs">
              <IconSliders size={14}/> Ordenar por: <span className="text-pine">{SORT_OPTIONS.find((s) => s.id === sort).label}</span>
              <IconChevronDown size={14} className={showSort ? 'rotate-180' : ''}/>
            </button>
            {showSort && (
              <div className="absolute right-0 mt-1 w-64 bg-white border border-rock/15 shadow-xl z-20 fadein">
                {SORT_OPTIONS.map((o) => (
                  <button key={o.id} onClick={() => { setSort(o.id); setShowSort(false); }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-rock/5 ${sort === o.id ? 'text-pine font-medium' : ''}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8 lg:gap-12">

          {/* Sidebar filters — scrolls internally when content exceeds viewport */}
          <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-3 -mr-3 no-scrollbar">
            <div className="relative mb-6">
              <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-rock/40"/>
              <input
                value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar productos…"
                className="input-base w-full pl-10" />
            </div>

            <FilterGroup title="Categoría" items={categories.map((c) => ({ id: c.name, label: c.name, count: c.products }))}
              selected={selectedCats} onToggle={(v) => toggle(selectedCats, setSelectedCats, v)} />
            <FilterGroup title="Marca" items={brands.map((b) => ({ id: b.name.toUpperCase(), label: b.name, count: b.products }))}
              selected={selectedBrands} onToggle={(v) => toggle(selectedBrands, setSelectedBrands, v)} />
            <FilterGroup title="Temporada"
              items={[
                { id: 'Invierno',     label: 'Invierno',      count: 42 },
                { id: 'Verano',       label: 'Verano',        count: 18 },
                { id: '4 Estaciones', label: '4 Estaciones',  count: 88 },
              ]}
              selected={selectedSeasons} onToggle={(v) => toggle(selectedSeasons, setSelectedSeasons, v)} />

            {(selectedCats.length + selectedBrands.length + selectedSeasons.length > 0 || query) && (
              <Button variant="ghost-light" size="sm" onClick={clearAll} className="w-full mt-2">
                Limpiar filtros
              </Button>
            )}
          </aside>

          {/* Product grid */}
          <div>
            {filtered.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-rock/20">
                <div className="font-display font-black uppercase text-2xl tracking-tightest mb-2">Sin resultados</div>
                <p className="text-rock/55 text-sm">Ajusta los filtros o limpia la búsqueda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-10">
                {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}

            {/* Pagination */}
            <div className="mt-16 flex items-center justify-center gap-2">
              {['1', '2', '3', '…', '12'].map((p, i) => (
                <button key={i}
                  className={`h-10 w-10 grid place-items-center font-mono text-sm border
                    ${i === 0 ? 'bg-rock text-ivory border-rock' : 'border-rock/15 hover:border-rock'}`}>
                  {p}
                </button>
              ))}
              <button className="h-10 px-4 grid place-items-center font-mono text-sm border border-rock/15 hover:border-rock">
                <IconChevronRight size={14}/>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterGroup = ({ title, items, selected, onToggle }) => (
  <div className="mb-6 border-b border-rock/10 pb-6">
    <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 mb-3">{title}</div>
    <ul className="space-y-2">
      {items.map((it) => (
        <li key={it.id}>
          <label className="flex items-center gap-3 group cursor-pointer">
            <span className={`relative h-4 w-4 border transition-colors ${selected.includes(it.id) ? 'border-pine bg-pine' : 'border-rock/30 group-hover:border-rock'}`}>
              {selected.includes(it.id) && <IconCheck size={12} stroke={3} className="text-ivory absolute inset-0 m-auto"/>}
            </span>
            <input type="checkbox" checked={selected.includes(it.id)} onChange={() => onToggle(it.id)} className="sr-only" />
            <span className="text-sm flex-1 text-rock group-hover:text-pine">{it.label}</span>
            <span className="font-mono text-[10px] text-rock/40">({it.count})</span>
          </label>
        </li>
      ))}
    </ul>
  </div>
);

window.Catalog = Catalog;
