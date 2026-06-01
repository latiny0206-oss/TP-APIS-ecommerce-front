/* Admin Users — full ABM matching POST/PUT/DELETE /api/usuarios contract.
 * Payload shape: { username, email, password, nombre, apellido, rol, estado } */

const AdminUsers = () => {
  const dispatch = useDispatch();
  const users = useSelector((s) => s.users.list);

  const [query, setQuery] = React.useState('');
  const [filterRole, setFilterRole] = React.useState('todos');
  const [editing, setEditing] = React.useState(null); // user object or 'new'

  const filtered = users.filter((u) => {
    const matchQ = !query || (u.username + ' ' + u.email + ' ' + (u.nombre || '') + ' ' + (u.apellido || '')).toLowerCase().includes(query.toLowerCase());
    const matchR = filterRole === 'todos' || u.rol === filterRole;
    return matchQ && matchR;
  });

  return (
    <div className="space-y-6">

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-80">
            <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-rock/40"/>
            <Input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por username, email o nombre…" className="pl-10"/>
          </div>
          <div className="inline-flex border border-rock/15">
            {[
              { id: 'todos',   label: 'Todos' },
              { id: 'ADMIN',   label: 'Admin' },
              { id: 'CLIENTE', label: 'Cliente' },
            ].map((r) => (
              <button key={r.id} onClick={() => setFilterRole(r.id)}
                className={`h-10 px-4 font-mono text-[10px] tracking-widest-2 uppercase transition-colors
                  ${filterRole === r.id ? 'bg-rock text-ivory' : 'text-rock/65 hover:text-rock'}`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <Button variant="primary" onClick={() => setEditing('new')} icon={<IconPlus size={14}/>}>
          Nuevo usuario
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white border border-rock/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-rock/[0.02]">
              {['Usuario', 'Email', 'Nombre completo', 'Rol', 'Estado', 'Acciones'].map((h) => (
                <th key={h} className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-t border-rock/10 hover:bg-rock/[0.02]">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`h-9 w-9 rounded-full grid place-items-center font-narrow font-bold text-[11px] ${u.rol === 'ADMIN' ? 'bg-alpenglow text-ivory' : 'bg-pine text-ivory'}`}>
                      {(u.nombre?.[0] || u.username[0] || 'U').toUpperCase()}{(u.apellido?.[0] || '').toUpperCase()}
                    </span>
                    <div>
                      <div className="font-narrow font-bold uppercase tracking-tight text-sm">{u.username}</div>
                      <div className="font-mono text-[10px] text-rock/45">id · {u.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 font-mono text-xs text-rock/75">{u.email}</td>
                <td className="px-5 py-3 text-sm">{u.nombre} {u.apellido}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex px-2 py-0.5 font-mono text-[10px] tracking-widest-2 uppercase
                    ${u.rol === 'ADMIN' ? 'bg-alpenglow/15 text-alpenglow' : 'bg-pine/15 text-pine'}`}>
                    {u.rol}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <button onClick={() => dispatch(toggleUserStatus(u.id))}
                    className={`inline-flex items-center gap-1.5 px-2 py-1 font-mono text-[10px] tracking-widest-2 uppercase
                      ${u.estado === 'ACTIVO' ? 'text-pine hover:bg-pine/10' : 'text-rock/55 hover:bg-rock/5'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${u.estado === 'ACTIVO' ? 'bg-pine' : 'bg-rock/35'}`}/>
                    {u.estado}
                  </button>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setEditing(u)}
                      className="h-8 w-8 grid place-items-center text-rock/55 hover:text-pine border border-rock/15">
                      <IconEdit size={13}/>
                    </button>
                    <button onClick={() => dispatch(deleteUsuarioAsync(u.id))}
                      className="h-8 w-8 grid place-items-center text-rock/55 hover:text-red-700 border border-rock/15">
                      <IconTrash size={13}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center font-mono text-[11px] tracking-widest-2 uppercase text-rock/45">
                Sin usuarios
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && <UserDrawer user={editing === 'new' ? null : editing} onClose={() => setEditing(null)}/>}
    </div>
  );
};

const UserDrawer = ({ user, onClose }) => {
  const dispatch = useDispatch();
  const [form, setForm] = React.useState(user || {
    username: '', email: '', password: '', nombre: '', apellido: '',
    rol: 'CLIENTE', estado: 'ACTIVO',
  });
  const [saving, setSaving] = React.useState(false);

  const save = async () => {
    setSaving(true);
    try {
      if (user) await dispatch(updateUsuarioAsync(user.id, form));
      else      await dispatch(createUsuarioAsync(form));
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <>
      <div className="fixed inset-0 bg-rock/60 z-40 fadein" onClick={onClose}/>
      <aside className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-ivory text-rock z-50 shadow-2xl flex flex-col fadein">
        <header className="flex items-center justify-between p-5 border-b border-rock/10">
          <div>
            <div className="font-mono text-[10px] tracking-widest-2 uppercase text-alpenglow">
              {user ? 'PUT /api/usuarios/' + user.id : 'POST /api/usuarios'}
            </div>
            <h2 className="font-display font-black tracking-tightest uppercase text-xl mt-0.5">
              {user ? `Editar ${user.username}` : 'Nuevo usuario'}
            </h2>
          </div>
          <button onClick={onClose} className="h-9 w-9 grid place-items-center border border-rock/15 hover:bg-rock/5">
            <IconX size={16}/>
          </button>
        </header>

        <div className="flex-1 overflow-auto p-5 space-y-4">
          <label className="block">
            <FieldLabel>username</FieldLabel>
            <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="juanperez"/>
          </label>
          <label className="block">
            <FieldLabel>email</FieldLabel>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="user@email.com"/>
          </label>
          {!user && (
            <label className="block">
              <FieldLabel>password</FieldLabel>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••"/>
            </label>
          )}
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <FieldLabel>nombre</FieldLabel>
              <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}/>
            </label>
            <label className="block">
              <FieldLabel>apellido</FieldLabel>
              <Input value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })}/>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <FieldLabel>rol</FieldLabel>
              <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}
                className="input-base w-full">
                <option value="CLIENTE">CLIENTE</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </label>
            <label className="block">
              <FieldLabel>estado</FieldLabel>
              <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}
                className="input-base w-full">
                <option value="ACTIVO">ACTIVO</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </label>
          </div>
        </div>

        <footer className="border-t border-rock/10 p-5 flex gap-3">
          <Button variant="ghost-light" size="md" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="md" className="flex-1" onClick={save} disabled={saving}
            iconRight={!saving && <IconCheck size={14} stroke={2.6}/>}>
            {saving ? 'Guardando…' : (user ? 'Actualizar' : 'Crear usuario')}
          </Button>
        </footer>
      </aside>
    </>
  );
};

window.AdminUsers = AdminUsers;
