import { useState, useEffect } from 'react'
import { Search, Plus, Pencil, Trash2, X } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import { userService } from '../../api/userService.js'
import { getErrorMessage } from '../../api/api.js'

const EMPTY_FORM = {
  username: '', email: '', password: '', nombre: '', apellido: '', rol: 'CLIENTE', estado: 'ACTIVO',
}

function initials(nombre, apellido) {
  return `${nombre?.[0] ?? ''}${apellido?.[0] ?? ''}`.toUpperCase()
}

function UserDrawer({ editing, onClose, onSave }) {
  const isNew = editing === 'new'
  const user  = isNew ? null : editing

  const [form,   setForm]   = useState(() =>
    isNew
      ? { ...EMPTY_FORM }
      : { username: user.username, email: user.email, password: '',
          nombre: user.nombre, apellido: user.apellido, rol: user.rol, estado: user.estado }
  )
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState(null)

  const setF = field => e => setForm(prev => ({ ...prev, [field]: e.target.value }))

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  async function handleSubmit() {
    if (!form.username.trim() || !form.email.trim()) return
    setSaving(true)
    setError(null)
    try {
      const payload = { ...form }
      if (!isNew && !payload.password) delete payload.password
      const result = await onSave(isNew ? payload : { ...user, ...payload })
      if (result !== false) onClose()
    } catch (e) {
      setError(getErrorMessage(e))
    }
    setSaving(false)
  }

  const endpoint = isNew ? 'POST /api/usuarios' : `PUT /api/usuarios/${user?.id}`

  return (
    <>
      <div className="fixed inset-0 bg-rock/60 z-40 fadein" onClick={onClose} />
      <aside className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-ivory text-rock z-50 shadow-2xl flex flex-col fadein">

        <header className="flex items-center justify-between p-5 border-b border-rock/10">
          <div>
            <div className="font-mono text-[10px] tracking-widest-2 uppercase text-alpenglow">{endpoint}</div>
            <h2 className="font-display font-black tracking-tightest uppercase text-xl mt-0.5">
              {isNew ? 'Nuevo usuario' : `Editar ${user.username}`}
            </h2>
          </div>
          <button onClick={onClose}
            className="h-9 w-9 grid place-items-center border border-rock/15 hover:bg-rock/5 transition-colors">
            <X size={16} />
          </button>
        </header>

        <div className="flex-1 overflow-auto p-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 font-mono text-[11px] tracking-widest-2 uppercase px-4 py-3">
              {error}
            </div>
          )}

          <label className="block">
            <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 block mb-1.5">username</span>
            <input value={form.username} onChange={setF('username')} placeholder="anagarcia"
              className="input-base w-full" />
          </label>

          <label className="block">
            <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 block mb-1.5">email</span>
            <input type="email" value={form.email} onChange={setF('email')} placeholder="usuario@email.com"
              className="input-base w-full" />
          </label>

          {isNew && (
            <label className="block">
              <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 block mb-1.5">password</span>
              <input type="password" value={form.password} onChange={setF('password')} placeholder="••••••••"
                className="input-base w-full" />
            </label>
          )}

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 block mb-1.5">nombre</span>
              <input value={form.nombre} onChange={setF('nombre')} placeholder="Ana" className="input-base w-full" />
            </label>
            <label className="block">
              <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 block mb-1.5">apellido</span>
              <input value={form.apellido} onChange={setF('apellido')} placeholder="García" className="input-base w-full" />
            </label>
          </div>

          <label className="block">
            <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 block mb-1.5">rol</span>
            <select value={form.rol} onChange={setF('rol')} className="input-base w-full">
              <option value="CLIENTE">CLIENTE</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </label>

          <label className="block">
            <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 block mb-1.5">estado</span>
            <select value={form.estado} onChange={setF('estado')} className="input-base w-full">
              <option value="ACTIVO">ACTIVO</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </label>
        </div>

        <footer className="border-t border-rock/10 p-5 flex gap-3">
          <Button variant="ghost-light" size="md" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="md" className="flex-1" disabled={saving} onClick={handleSubmit}>
            {saving ? 'Guardando…' : isNew ? 'Crear usuario' : 'Actualizar'}
          </Button>
        </footer>
      </aside>
    </>
  )
}

export default function AdminUsers() {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [query,   setQuery]   = useState('')
  const [rolTab,  setRolTab]  = useState('TODOS')
  const [editing, setEditing] = useState(null)
  const [delId,   setDelId]   = useState(null)

  useEffect(() => {
    userService.getUsuarios()
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = users.filter(u => {
    const matchSearch = !query || [u.username, u.email, u.nombre, u.apellido]
      .some(s => (s ?? '').toLowerCase().includes(query.toLowerCase()))
    const matchRol = rolTab === 'TODOS' || u.rol === rolTab
    return matchSearch && matchRol
  })

  const [deleteError, setDeleteError] = useState(null)

  async function handleSave(data) {
    if (data.id) {
      const updated = await userService.actualizarUsuario(data.id, data)
      setUsers(prev => prev.map(u => u.id === data.id ? { ...u, ...updated } : u))
    } else {
      const created = await userService.crearUsuario(data)
      setUsers(prev => [created, ...prev])
    }
  }

  async function handleDelete(id) {
    setDeleteError(null)
    try {
      await userService.eliminarUsuario(id)
      setUsers(prev => prev.filter(u => u.id !== id))
      setDelId(null)
    } catch (e) {
      setDeleteError(getErrorMessage(e))
    }
  }

  const admins   = users.filter(u => u.rol === 'ADMIN').length
  const clientes = users.filter(u => u.rol === 'CLIENTE').length

  return (
    <div className="space-y-6">

      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative w-80">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-rock/40 pointer-events-none" />
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Buscar por username, email o nombre…"
              className="input-base w-full pl-10 h-10" />
          </div>

          <div className="inline-flex border border-rock/15">
            {['TODOS', 'ADMIN', 'CLIENTE'].map(r => (
              <button key={r} onClick={() => setRolTab(r)}
                className={`h-10 px-4 font-mono text-[10px] tracking-widest-2 uppercase transition-colors
                  ${rolTab === r ? 'bg-rock text-ivory' : 'text-rock/60 hover:text-rock'}`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55">
            <span className="text-pine font-bold">{admins}</span> admin · <span className="font-bold">{clientes}</span> clientes
          </div>
          <Button variant="primary" icon={<Plus size={14} strokeWidth={2.2} />}
            onClick={() => setEditing('new')}>
            Nuevo usuario
          </Button>
        </div>
      </div>

      <div className="bg-white border border-rock/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-left bg-rock/[0.02]">
              {['Usuario', 'Email', 'Nombre completo', 'Rol', 'Estado', 'Acciones'].map(h => (
                <th key={h} className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center font-mono text-[11px] tracking-widest-2 uppercase text-rock/40">
                  Cargando…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center font-mono text-[11px] tracking-widest-2 uppercase text-rock/40">
                  Sin usuarios
                </td>
              </tr>
            ) : filtered.map(u => {
              const avatarBg = u.rol === 'ADMIN' ? 'bg-alpenglow' : 'bg-pine'
              const active   = u.estado === 'ACTIVO'
              return (
                <tr key={u.id} className="border-t border-rock/10 hover:bg-rock/[0.02]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`h-9 w-9 rounded-full ${avatarBg} text-ivory grid place-items-center font-narrow font-bold text-[11px] shrink-0`}>
                        {initials(u.nombre, u.apellido)}
                      </span>
                      <div>
                        <div className="font-narrow font-bold text-sm uppercase tracking-tight leading-tight">{u.username}</div>
                        <div className="font-mono text-[10px] text-rock/40">id · {u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-rock/70">{u.email}</td>
                  <td className="px-5 py-3 font-narrow text-sm">{u.nombre} {u.apellido}</td>
                  <td className="px-5 py-3">
                    <span className={`font-mono text-[9px] tracking-widest-2 uppercase px-2 py-1 border
                      ${u.rol === 'ADMIN'
                        ? 'bg-alpenglow/15 text-alpenglow border-alpenglow/30'
                        : 'bg-pine/10 text-pine border-pine/25'
                      }`}>
                      {u.rol}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${active ? 'bg-pine' : 'bg-rock/35'}`} />
                      <span className={`font-mono text-[10px] tracking-widest-2 uppercase ${active ? 'text-pine' : 'text-rock/55'}`}>
                        {u.estado}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setEditing(u)}
                        className="h-8 w-8 grid place-items-center text-rock/45 hover:text-pine border border-rock/15 transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => setDelId(u.id)}
                        className="h-8 w-8 grid place-items-center text-rock/45 hover:text-red-700 border border-rock/15 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {editing !== null && (
        <UserDrawer editing={editing} onClose={() => setEditing(null)} onSave={handleSave} />
      )}

      {delId !== null && (
        <>
          <div className="fixed inset-0 bg-rock/60 z-40 fadein" onClick={() => { setDelId(null); setDeleteError(null) }} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 fadein">
            <div className="bg-ivory w-full max-w-xs border border-rock/15 shadow-2xl p-6">
              <h3 className="font-display font-black tracking-tightest uppercase text-lg">¿Eliminar usuario?</h3>
              <p className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/50 mt-1 mb-5">
                Esta acción no se puede deshacer.
              </p>
              {deleteError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 font-mono text-[10px] tracking-widest-2 uppercase mb-4">
                  {deleteError}
                </div>
              )}
              <div className="flex gap-3">
                <Button variant="ghost-light" size="sm" className="flex-1" onClick={() => { setDelId(null); setDeleteError(null) }}>Cancelar</Button>
                <Button variant="danger" size="sm" className="flex-1" onClick={() => handleDelete(delId)}>Eliminar</Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
