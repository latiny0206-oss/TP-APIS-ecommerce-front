/* Admin Discounts — API contract: { codigo, tipo, valor, porcentaje, fechaInicio, fechaFin, estado } */

const AdminDiscounts = () => {
  const dispatch = useDispatch();
  const discounts = useSelector((s) => s.discounts);
  const [showNew, setShowNew] = React.useState(false);
  const [form, setForm] = React.useState({
    codigo: '', tipo: 'PORCENTAJE',
    porcentaje: 10, valor: 0,
    fechaInicio: '2026-06-01', fechaFin: '2026-12-31',
  });

  const create = async () => {
    if (!form.codigo.trim()) return;
    const payload = {
      codigo: form.codigo.toUpperCase(),
      tipo: form.tipo,
      valor: form.tipo === 'FIJO' ? Number(form.valor) : 0,
      porcentaje: form.tipo === 'PORCENTAJE' ? Number(form.porcentaje) : null,
      fechaInicio: form.fechaInicio,
      fechaFin: form.fechaFin,
      estado: 'ACTIVO',
      usos: 0,
    };
    await dispatch(createDescuentoAsync(payload));
    setShowNew(false);
    setForm({ codigo: '', tipo: 'PORCENTAJE', porcentaje: 10, valor: 0, fechaInicio: '2026-06-01', fechaFin: '2026-12-31' });
  };

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 grid place-items-center bg-alpenglow/15 text-alpenglow">
            <IconTicket size={18}/>
          </span>
          <div>
            <h2 className="font-display font-black tracking-tightest uppercase text-2xl">Cupones</h2>
            <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55">
              {discounts.filter((d) => d.estado === 'ACTIVO').length} activos · {discounts.length} totales
            </div>
          </div>
        </div>
        <Button variant="primary" onClick={() => setShowNew(!showNew)} icon={<IconPlus size={14}/>}>
          Nuevo cupón
        </Button>
      </div>

      {showNew && (
        <div className="bg-pine/5 border border-pine/30 p-5 fadein">
          <div className="font-mono text-[10px] tracking-widest-2 uppercase text-pine mb-3">POST /api/descuentos</div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
            <label className="block">
              <FieldLabel>codigo</FieldLabel>
              <Input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })} placeholder="VERANO25"/>
            </label>
            <label className="block">
              <FieldLabel>tipo</FieldLabel>
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                className="input-base w-full">
                <option value="PORCENTAJE">PORCENTAJE</option>
                <option value="FIJO">FIJO</option>
              </select>
            </label>
            {form.tipo === 'PORCENTAJE' ? (
              <label className="block">
                <FieldLabel>porcentaje (%)</FieldLabel>
                <Input type="number" value={form.porcentaje}
                  onChange={(e) => setForm({ ...form, porcentaje: e.target.value })}/>
              </label>
            ) : (
              <label className="block">
                <FieldLabel>valor ($)</FieldLabel>
                <Input type="number" value={form.valor}
                  onChange={(e) => setForm({ ...form, valor: e.target.value })}/>
              </label>
            )}
            <label className="block">
              <FieldLabel>fechaInicio</FieldLabel>
              <Input type="date" value={form.fechaInicio} onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}/>
            </label>
            <label className="block">
              <FieldLabel>fechaFin</FieldLabel>
              <Input type="date" value={form.fechaFin} onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}/>
            </label>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="primary" size="sm" onClick={create} iconRight={<IconCheck size={14}/>}>Crear cupón</Button>
            <Button variant="ghost-light" size="sm" onClick={() => setShowNew(false)}>Cancelar</Button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {discounts.map((d) => {
          const isActive = d.estado === 'ACTIVO';
          return (
            <article key={d.id}
              className={`bg-white border p-5 flex flex-col gap-4 transition-all ${isActive ? 'border-pine' : 'border-rock/15 opacity-60'}`}>

              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-[10px] tracking-widest-2 uppercase text-alpenglow mb-1">
                    {d.tipo === 'PORCENTAJE' ? `${d.porcentaje}% OFF` : `${fmt(d.valor)} OFF`}
                    <span className="ml-2 text-rock/40">· tipo: {d.tipo}</span>
                  </div>
                  <div className="font-display font-black tracking-tightest text-2xl">{d.codigo}</div>
                </div>

                <button onClick={() => dispatch(toggleDiscount(d.id))}
                  className={`relative h-6 w-11 rounded-full transition-colors ${isActive ? 'bg-pine' : 'bg-rock/20'}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-ivory shadow transition-transform ${isActive ? 'translate-x-[22px]' : 'translate-x-0.5'}`}/>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 py-3 border-y border-rock/10">
                <div>
                  <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/45 mb-1">usos</div>
                  <div className="font-narrow font-bold text-sm">{d.usos || 0}</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/45 mb-1">vigencia</div>
                  <div className="font-mono text-xs">{d.fechaInicio.slice(5)} → {d.fechaFin.slice(5)}</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/45 mb-1">estado</div>
                  <div className={`font-mono text-[10px] tracking-widest-2 uppercase ${isActive ? 'text-pine' : 'text-rock/45'}`}>
                    {d.estado}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button className="font-mono text-[10px] tracking-widest-2 uppercase text-pine hover:underline flex items-center gap-1.5">
                  <IconEdit size={11}/> Editar
                </button>
                <button onClick={() => dispatch(deleteDiscount(d.id))}
                  className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/45 hover:text-red-700">
                  Eliminar
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

window.AdminDiscounts = AdminDiscounts;
