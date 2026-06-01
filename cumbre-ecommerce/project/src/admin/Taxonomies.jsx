/* Admin Taxonomies — POST/PUT /api/categorias & /api/marcas
 * Payload shape: { nombre, descripcion } */

const AdminTaxonomies = () => {
  const dispatch = useDispatch();
  const { categorias, marcas } = useSelector((s) => s.taxonomies);
  const [tab, setTab] = React.useState('categorias');

  return (
    <div className="space-y-6">
      <div className="inline-flex border border-rock/15">
        {[
          { id: 'categorias', label: 'Categorías', count: categorias.length },
          { id: 'marcas',     label: 'Marcas',     count: marcas.length },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-5 h-11 font-narrow font-bold uppercase tracking-widest-2 text-xs flex items-center gap-2
              ${tab === t.id ? 'bg-rock text-ivory' : 'text-rock/65 hover:text-rock'}`}>
            {t.label}
            <span className={`font-mono text-[10px] ${tab === t.id ? 'text-ivory/65' : 'text-rock/45'}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {tab === 'categorias' ? (
        <TaxoTable
          endpoint="/api/categorias" title="Categorías" entityName="categoría"
          items={categorias}
          onUpsert={(item) => dispatch(upsertCategoria(item))}
          onDelete={(id) => dispatch(deleteCategoria(id))}
        />
      ) : (
        <TaxoTable
          endpoint="/api/marcas" title="Marcas" entityName="marca"
          items={marcas}
          onUpsert={(item) => dispatch(upsertMarca(item))}
          onDelete={(id) => dispatch(deleteMarca(id))}
        />
      )}
    </div>
  );
};

const TaxoTable = ({ endpoint, title, entityName, items, onUpsert, onDelete }) => {
  const [editing, setEditing] = React.useState(null); // id | 'new'
  const [draft, setDraft] = React.useState({ nombre: '', descripcion: '' });

  const startEdit = (item) => { setEditing(item.id); setDraft({ nombre: item.nombre, descripcion: item.descripcion || '' }); };
  const startNew = () => { setEditing('new'); setDraft({ nombre: '', descripcion: '' }); };

  const save = () => {
    if (!draft.nombre.trim()) { setEditing(null); return; }
    if (editing === 'new') {
      onUpsert({
        id: Math.max(0, ...items.map((it) => it.id)) + 1,
        nombre: draft.nombre.trim(),
        descripcion: draft.descripcion.trim(),
        productos: 0,
      });
    } else {
      const existing = items.find((it) => it.id === editing);
      onUpsert({ ...existing, nombre: draft.nombre.trim(), descripcion: draft.descripcion.trim() });
    }
    setEditing(null);
  };

  return (
    <div className="bg-white border border-rock/10">
      <header className="flex items-center justify-between p-5 border-b border-rock/10">
        <div>
          <h2 className="font-display font-black tracking-tightest uppercase text-xl">{title}</h2>
          <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/45 mt-1">{endpoint}</div>
        </div>
        <Button variant="primary" size="sm" onClick={startNew} icon={<IconPlus size={12}/>}>Añadir {entityName}</Button>
      </header>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left bg-rock/[0.02]">
            {['id', 'nombre', 'descripcion', 'productos', ''].map((h) => (
              <th key={h} className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 px-5 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {editing === 'new' && (
            <tr className="border-t border-rock/10 bg-pine/5">
              <td className="px-5 py-3 font-mono text-[10px] text-pine">NEW</td>
              <td className="px-5 py-3">
                <Input value={draft.nombre} autoFocus onChange={(e) => setDraft({ ...draft, nombre: e.target.value })}
                  placeholder={`Nombre de la ${entityName}`}/>
              </td>
              <td className="px-5 py-3">
                <Input value={draft.descripcion} onChange={(e) => setDraft({ ...draft, descripcion: e.target.value })}
                  placeholder="Descripción"/>
              </td>
              <td className="px-5 py-3 text-rock/45 font-mono text-xs">—</td>
              <td className="px-5 py-3">
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" onClick={save}>Crear</Button>
                  <Button variant="ghost-light" size="sm" onClick={() => setEditing(null)}>Cancelar</Button>
                </div>
              </td>
            </tr>
          )}

          {items.map((it) => (
            <tr key={it.id} className="border-t border-rock/10 hover:bg-rock/[0.02]">
              <td className="px-5 py-3 font-mono text-xs">#{it.id}</td>
              <td className="px-5 py-3">
                {editing === it.id ? (
                  <Input value={draft.nombre} autoFocus onChange={(e) => setDraft({ ...draft, nombre: e.target.value })}/>
                ) : (
                  <span className="font-narrow font-bold text-sm">{it.nombre}</span>
                )}
              </td>
              <td className="px-5 py-3 max-w-md">
                {editing === it.id ? (
                  <Input value={draft.descripcion} onChange={(e) => setDraft({ ...draft, descripcion: e.target.value })}/>
                ) : (
                  <span className="text-xs text-rock/65 line-clamp-2">{it.descripcion}</span>
                )}
              </td>
              <td className="px-5 py-3 font-mono text-xs text-rock/65 whitespace-nowrap">{it.productos} prods.</td>
              <td className="px-5 py-3">
                {editing === it.id ? (
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" onClick={save}>Guardar</Button>
                    <Button variant="ghost-light" size="sm" onClick={() => setEditing(null)}>Cancelar</Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEdit(it)}
                      className="h-8 w-8 grid place-items-center text-rock/55 hover:text-pine border border-rock/15">
                      <IconEdit size={13}/>
                    </button>
                    <button onClick={() => onDelete(it.id)}
                      className="h-8 w-8 grid place-items-center text-rock/55 hover:text-red-700 border border-rock/15">
                      <IconTrash size={13}/>
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

window.AdminTaxonomies = AdminTaxonomies;
