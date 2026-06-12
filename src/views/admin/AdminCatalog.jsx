import { useState } from 'react'
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import { PRODUCTS_SEED } from '../../data/index.js'

// Build initial data with product counts and descriptions
const _catCounts   = PRODUCTS_SEED.reduce((acc, p) => { acc[p.categoriaId] = (acc[p.categoriaId] || 0) + 1; return acc }, {})
const _marcaCounts = PRODUCTS_SEED.reduce((acc, p) => { acc[p.marcaId]     = (acc[p.marcaId]     || 0) + 1; return acc }, {})

const INITIAL_CATEGORIAS = [
  { id: 1, nombre: 'Mochilas',        descripcion: 'Mochilas de trekking, daypack y expedición' },
  { id: 2, nombre: 'Carpas',          descripcion: 'Carpas de montaña para 2, 3 y 4 estaciones' },
  { id: 3, nombre: 'Sacos de Dormir', descripcion: 'Sacos de plumas y sintético por temperatura' },
  { id: 4, nombre: 'Calzado Técnico', descripcion: 'Botas, zapatillas y calzado de aproximación' },
  { id: 5, nombre: 'Ropa Técnica',    descripcion: 'Capas base, fleece, hardshell e impermeables' },
  { id: 6, nombre: 'Accesorios',      descripcion: 'Guantes, gorros, gafas y complementos técnicos' },
  { id: 7, nombre: 'Escalada',        descripcion: 'Arneses, piolets, aseguradoras y material técnico' },
].map(c => ({ ...c, productos: _catCounts[c.id] || 0 }))

const INITIAL_MARCAS = [
  { id: 1, nombre: 'Osprey',        descripcion: 'Fabricante de mochilas y bolsas de senderismo' },
  { id: 2, nombre: 'Marmot',        descripcion: 'Equipamiento de alpinismo y clima extremo' },
  { id: 3, nombre: 'Petzl',         descripcion: 'Iluminación y material de escalada francés' },
  { id: 4, nombre: 'Black Diamond', descripcion: 'Equipamiento técnico de escalada y ski' },
  { id: 5, nombre: 'Cumbre Pro',    descripcion: 'Marca propia Cumbre — relación precio/calidad' },
  { id: 6, nombre: 'Salomon',       descripcion: 'Calzado y ropa técnica para deporte al aire libre' },
  { id: 7, nombre: 'MSR',           descripcion: 'Mountain Safety Research — carpas y cocinas' },
].map(m => ({ ...m, productos: _marcaCounts[m.id] || 0 }))

// ─── TaxoTable ────────────────────────────────────────────────────────────────
function TaxoTable({ title, endpoint, entityName, items, onUpsert, onDelete }) {
  const [editId,   setEditId]   = useState(null)
  const [editForm, setEditForm] = useState({ nombre: '', descripcion: '' })
  const [showNew,  setShowNew]  = useState(false)
  const [newForm,  setNewForm]  = useState({ nombre: '', descripcion: '' })
  const [deleteId, setDeleteId] = useState(null)

  function startEdit(item) {
    setEditId(item.id)
    setEditForm({ nombre: item.nombre, descripcion: item.descripcion })
    setShowNew(false)
  }

  function commitEdit() {
    if (!editForm.nombre.trim()) { setEditId(null); return }
    onUpsert({ id: editId, nombre: editForm.nombre.trim(), descripcion: editForm.descripcion.trim() })
    setEditId(null)
  }

  function commitNew() {
    if (!newForm.nombre.trim()) { setShowNew(false); return }
    onUpsert({ nombre: newForm.nombre.trim(), descripcion: newForm.descripcion.trim() })
    setNewForm({ nombre: '', descripcion: '' })
    setShowNew(false)
  }

  return (
    <div className="bg-white border border-rock/10">

      {/* Header */}
      <div className="px-5 py-4 border-b border-rock/10 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display font-black tracking-tightest uppercase text-xl leading-tight">{title}</h2>
          <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/45 mt-0.5">{endpoint}</div>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus size={13} strokeWidth={2.3} />}
          onClick={() => { setShowNew(true); setEditId(null) }}
          disabled={showNew}
        >
          Añadir {entityName}
        </Button>
      </div>

      {/* Table */}
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

            {/* New row */}
            {showNew && (
              <tr className="bg-pine/5">
                <td className="px-5 py-2.5">
                  <span className="font-mono text-[9px] tracking-widest-2 uppercase text-pine font-bold">NEW</span>
                </td>
                <td className="px-5 py-2.5">
                  <input
                    autoFocus
                    value={newForm.nombre}
                    onChange={e => setNewForm(p => ({ ...p, nombre: e.target.value }))}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitNew()
                      if (e.key === 'Escape') setShowNew(false)
                    }}
                    placeholder="Nombre…"
                    className="input-base w-full h-8 text-xs"
                  />
                </td>
                <td className="px-5 py-2.5">
                  <input
                    value={newForm.descripcion}
                    onChange={e => setNewForm(p => ({ ...p, descripcion: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') commitNew() }}
                    placeholder="Descripción…"
                    className="input-base w-full h-8 text-xs"
                  />
                </td>
                <td className="px-5 py-2.5 font-mono text-xs text-rock/35">—</td>
                <td className="px-5 py-2.5">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Check size={12} strokeWidth={2.6} />}
                      onClick={commitNew}
                    >
                      Crear
                    </Button>
                    <button
                      onClick={() => setShowNew(false)}
                      className="h-9 px-3 border border-rock/15 text-rock/55 hover:bg-rock/5 font-narrow font-bold text-xs uppercase tracking-widest-2 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {items.map(item => (
              <tr key={item.id} className="border-t border-rock/10 hover:bg-rock/[0.02]">
                <td className="px-5 py-3 font-mono text-xs text-rock/50">#{item.id}</td>

                {editId === item.id ? (
                  <>
                    <td className="px-5 py-2.5">
                      <input
                        autoFocus
                        value={editForm.nombre}
                        onChange={e => setEditForm(p => ({ ...p, nombre: e.target.value }))}
                        onKeyDown={e => {
                          if (e.key === 'Enter') commitEdit()
                          if (e.key === 'Escape') setEditId(null)
                        }}
                        className="input-base w-full h-8 text-xs"
                      />
                    </td>
                    <td className="px-5 py-2.5">
                      <input
                        value={editForm.descripcion}
                        onChange={e => setEditForm(p => ({ ...p, descripcion: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter') commitEdit() }}
                        className="input-base w-full h-8 text-xs"
                      />
                    </td>
                    <td className="px-5 py-3 font-mono text-xs">{item.productos}</td>
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Check size={12} strokeWidth={2.6} />}
                          onClick={commitEdit}
                        >
                          Guardar
                        </Button>
                        <button
                          onClick={() => setEditId(null)}
                          className="h-9 px-3 border border-rock/15 text-rock/55 hover:bg-rock/5 font-narrow font-bold text-xs uppercase tracking-widest-2 transition-colors"
                        >
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
                    <td className="px-5 py-3 font-mono text-xs text-rock/60">{item.productos} prods.</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(item)}
                          className="h-8 w-8 grid place-items-center text-rock/45 hover:text-pine border border-rock/15 transition-colors"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => setDeleteId(item.id)}
                          disabled={item.productos > 0}
                          title={item.productos > 0 ? 'Tiene productos asociados' : 'Eliminar'}
                          className="h-8 w-8 grid place-items-center text-rock/45 hover:text-red-700 border border-rock/15 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
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

        {items.length === 0 && (
          <div className="p-10 text-center font-mono text-[11px] tracking-widest-2 uppercase text-rock/35">
            Sin {title.toLowerCase()}
          </div>
        )}
      </div>

      {/* Confirm delete */}
      {deleteId !== null && (
        <>
          <div className="fixed inset-0 bg-rock/60 z-40 fadein" onClick={() => setDeleteId(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 fadein">
            <div className="bg-ivory w-full max-w-xs border border-rock/15 shadow-2xl p-6">
              <h3 className="font-display font-black tracking-tightest uppercase text-lg">¿Eliminar?</h3>
              <p className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/50 mt-1 mb-5">
                Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <Button variant="ghost-light" size="sm" className="flex-1" onClick={() => setDeleteId(null)}>
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-1"
                  onClick={() => { onDelete(deleteId); setDeleteId(null) }}
                >
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

// ─── Vista principal ──────────────────────────────────────────────────────────
export default function AdminCatalog() {
  const [activeTab,  setActiveTab]  = useState('categorias')
  const [categorias, setCategorias] = useState(INITIAL_CATEGORIAS)
  const [marcas,     setMarcas]     = useState(INITIAL_MARCAS)

  function nextId(list) { return Math.max(0, ...list.map(i => i.id)) + 1 }

  const catHandlers = {
    onUpsert: (data) => setCategorias(prev =>
      data.id
        ? prev.map(c => c.id === data.id ? { ...c, ...data } : c)
        : [...prev, { ...data, id: nextId(prev), productos: 0 }]
    ),
    onDelete: (id) => setCategorias(prev => prev.filter(c => c.id !== id)),
  }

  const marcaHandlers = {
    onUpsert: (data) => setMarcas(prev =>
      data.id
        ? prev.map(m => m.id === data.id ? { ...m, ...data } : m)
        : [...prev, { ...data, id: nextId(prev), productos: 0 }]
    ),
    onDelete: (id) => setMarcas(prev => prev.filter(m => m.id !== id)),
  }

  return (
    <div className="space-y-6">

      {/* Segmented tabs */}
      <div className="inline-flex border border-rock/15">
        {[
          { key: 'categorias', label: 'Categorías', count: categorias.length },
          { key: 'marcas',     label: 'Marcas',     count: marcas.length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`h-11 px-5 flex items-center gap-2 font-narrow font-bold uppercase tracking-widest-2 text-xs transition-colors
              ${activeTab === tab.key
                ? 'bg-rock text-ivory'
                : 'text-rock/65 hover:text-rock'
              }`}
          >
            {tab.label}
            <span className={`font-mono text-[10px] ${activeTab === tab.key ? 'text-ivory/55' : 'text-rock/40'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {activeTab === 'categorias' && (
        <TaxoTable
          key="categorias"
          title="Categorías"
          endpoint="/api/categorias"
          entityName="categoría"
          items={categorias}
          {...catHandlers}
        />
      )}

      {activeTab === 'marcas' && (
        <TaxoTable
          key="marcas"
          title="Marcas"
          endpoint="/api/marcas"
          entityName="marca"
          items={marcas}
          {...marcaHandlers}
        />
      )}
    </div>
  )
}
