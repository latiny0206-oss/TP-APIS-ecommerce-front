import { useState, useEffect } from 'react'
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import { productService } from '../../api/productService.js'
import { getErrorMessage } from '../../api/api.js'

function TaxoTable({ title, endpoint, entityName, items, loading, onUpsert, onDelete }) {
  const [editId,   setEditId]   = useState(null)
  const [editForm, setEditForm] = useState({ nombre: '', descripcion: '' })
  const [showNew,  setShowNew]  = useState(false)
  const [newForm,  setNewForm]  = useState({ nombre: '', descripcion: '' })
  const [deleteId, setDeleteId] = useState(null)
  const [saving,   setSaving]   = useState(false)

  function startEdit(item) {
    setEditId(item.id)
    setEditForm({ nombre: item.nombre, descripcion: item.descripcion ?? '' })
    setShowNew(false)
  }

  async function commitEdit() {
    if (!editForm.nombre.trim()) { setEditId(null); return }
    setSaving(true)
    await onUpsert({ id: editId, nombre: editForm.nombre.trim(), descripcion: editForm.descripcion.trim() })
    setSaving(false)
    setEditId(null)
  }

  async function commitNew() {
    if (!newForm.nombre.trim()) { setShowNew(false); return }
    setSaving(true)
    await onUpsert({ nombre: newForm.nombre.trim(), descripcion: newForm.descripcion.trim() })
    setSaving(false)
    setNewForm({ nombre: '', descripcion: '' })
    setShowNew(false)
  }

  return (
    <div className="bg-white border border-rock/10">
      <div className="px-5 py-4 border-b border-rock/10 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display font-black tracking-tightest uppercase text-xl leading-tight">{title}</h2>
          <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/45 mt-0.5">{endpoint}</div>
        </div>
        <Button variant="primary" size="sm" icon={<Plus size={13} strokeWidth={2.3} />}
          onClick={() => { setShowNew(true); setEditId(null) }} disabled={showNew}>
          Añadir {entityName}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-rock/[0.02]">
              {['id', 'nombre', 'descripción', 'productos', ''].map(h => (
                <th key={h} className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {showNew && (
              <tr className="bg-pine/5">
                <td className="px-5 py-2.5">
                  <span className="font-mono text-[9px] tracking-widest-2 uppercase text-pine font-bold">NEW</span>
                </td>
                <td className="px-5 py-2.5">
                  <input autoFocus value={newForm.nombre}
                    onChange={e => setNewForm(p => ({ ...p, nombre: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') commitNew(); if (e.key === 'Escape') setShowNew(false) }}
                    placeholder="Nombre…" className="input-base w-full h-8 text-xs" />
                </td>
                <td className="px-5 py-2.5">
                  <input value={newForm.descripcion}
                    onChange={e => setNewForm(p => ({ ...p, descripcion: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') commitNew() }}
                    placeholder="Descripción…" className="input-base w-full h-8 text-xs" />
                </td>
                <td className="px-5 py-2.5 font-mono text-xs text-rock/35">—</td>
                <td className="px-5 py-2.5">
                  <div className="flex items-center gap-2">
                    <Button variant="primary" size="sm" icon={<Check size={12} strokeWidth={2.6} />}
                      onClick={commitNew} disabled={saving}>Crear</Button>
                    <button onClick={() => setShowNew(false)}
                      className="h-9 px-3 border border-rock/15 text-rock/55 hover:bg-rock/5 font-narrow font-bold text-xs uppercase tracking-widest-2 transition-colors">
                      Cancelar
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center font-mono text-[11px] tracking-widest-2 uppercase text-rock/40">
                  Cargando…
                </td>
              </tr>
            ) : items.map(item => (
              <tr key={item.id} className="border-t border-rock/10 hover:bg-rock/[0.02]">
                <td className="px-5 py-3 font-mono text-xs text-rock/50">#{item.id}</td>
                {editId === item.id ? (
                  <>
                    <td className="px-5 py-2.5">
                      <input autoFocus value={editForm.nombre}
                        onChange={e => setEditForm(p => ({ ...p, nombre: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditId(null) }}
                        className="input-base w-full h-8 text-xs" />
                    </td>
                    <td className="px-5 py-2.5">
                      <input value={editForm.descripcion}
                        onChange={e => setEditForm(p => ({ ...p, descripcion: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter') commitEdit() }}
                        className="input-base w-full h-8 text-xs" />
                    </td>
                    <td className="px-5 py-3 font-mono text-xs">{item.productos ?? item.cantidadProductos ?? 0}</td>
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <Button variant="primary" size="sm" icon={<Check size={12} strokeWidth={2.6} />}
                          onClick={commitEdit} disabled={saving}>Guardar</Button>
                        <button onClick={() => setEditId(null)}
                          className="h-9 px-3 border border-rock/15 text-rock/55 hover:bg-rock/5 font-narrow font-bold text-xs uppercase tracking-widest-2 transition-colors">
                          Cancelar
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-5 py-3 font-narrow font-bold text-sm uppercase tracking-tight">{item.nombre}</td>
                    <td className="px-5 py-3 text-xs text-rock/65 max-w-xs">
                      {item.descripcion || <span className="text-rock/30">—</span>}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-rock/60">
                      {item.productos ?? item.cantidadProductos ?? 0} prods.
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => startEdit(item)}
                          className="h-8 w-8 grid place-items-center text-rock/45 hover:text-pine border border-rock/15 transition-colors">
                          <Pencil size={12} />
                        </button>
                        <button onClick={() => setDeleteId(item.id)}
                          className="h-8 w-8 grid place-items-center text-rock/45 hover:text-red-700 border border-rock/15 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && items.length === 0 && (
          <div className="p-10 text-center font-mono text-[11px] tracking-widest-2 uppercase text-rock/35">
            Sin {title.toLowerCase()}
          </div>
        )}
      </div>

      {deleteId !== null && (
        <>
          <div className="fixed inset-0 bg-rock/60 z-40 fadein" onClick={() => setDeleteId(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 fadein">
            <div className="bg-ivory w-full max-w-xs border border-rock/15 shadow-2xl p-6">
              <h3 className="font-display font-black tracking-tightest uppercase text-lg">¿Eliminar?</h3>
              <p className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/50 mt-1 mb-5">Esta acción no se puede deshacer.</p>
              <div className="flex gap-3">
                <Button variant="ghost-light" size="sm" className="flex-1" onClick={() => setDeleteId(null)}>Cancelar</Button>
                <Button variant="danger" size="sm" className="flex-1"
                  onClick={() => { onDelete(deleteId); setDeleteId(null) }}>
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function AdminCatalog() {
  const [activeTab,  setActiveTab]  = useState('categorias')
  const [categorias, setCategorias] = useState([])
  const [marcas,     setMarcas]     = useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    Promise.all([
      productService.getCategorias(),
      productService.getMarcas(),
    ]).then(([cats, mars]) => {
      setCategorias(cats)
      setMarcas(mars)
    }).finally(() => setLoading(false))
  }, [])

  const catHandlers = {
    onUpsert: async (data) => {
      try {
        if (data.id) {
          const updated = await productService.actualizarCategoria(data.id, data)
          setCategorias(prev => prev.map(c => c.id === data.id ? { ...c, ...updated } : c))
        } else {
          const created = await productService.crearCategoria(data)
          setCategorias(prev => [...prev, created])
        }
      } catch (e) { alert(getErrorMessage(e)) }
    },
    onDelete: async (id) => {
      try {
        await productService.eliminarCategoria(id)
        setCategorias(prev => prev.filter(c => c.id !== id))
      } catch (e) { alert(getErrorMessage(e)) }
    },
  }

  const marcaHandlers = {
    onUpsert: async (data) => {
      try {
        if (data.id) {
          const updated = await productService.actualizarMarca(data.id, data)
          setMarcas(prev => prev.map(m => m.id === data.id ? { ...m, ...updated } : m))
        } else {
          const created = await productService.crearMarca(data)
          setMarcas(prev => [...prev, created])
        }
      } catch (e) { alert(getErrorMessage(e)) }
    },
    onDelete: async (id) => {
      try {
        await productService.eliminarMarca(id)
        setMarcas(prev => prev.filter(m => m.id !== id))
      } catch (e) { alert(getErrorMessage(e)) }
    },
  }

  return (
    <div className="space-y-6">
      <div className="inline-flex border border-rock/15">
        {[
          { key: 'categorias', label: 'Categorías', count: categorias.length },
          { key: 'marcas',     label: 'Marcas',     count: marcas.length },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`h-11 px-5 flex items-center gap-2 font-narrow font-bold uppercase tracking-widest-2 text-xs transition-colors
              ${activeTab === tab.key ? 'bg-rock text-ivory' : 'text-rock/65 hover:text-rock'}`}>
            {tab.label}
            <span className={`font-mono text-[10px] ${activeTab === tab.key ? 'text-ivory/55' : 'text-rock/40'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {activeTab === 'categorias' && (
        <TaxoTable key="categorias" title="Categorías" endpoint="/api/categorias" entityName="categoría"
          items={categorias} loading={loading} {...catHandlers} />
      )}
      {activeTab === 'marcas' && (
        <TaxoTable key="marcas" title="Marcas" endpoint="/api/marcas" entityName="marca"
          items={marcas} loading={loading} {...marcaHandlers} />
      )}
    </div>
  )
}
