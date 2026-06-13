import { useState } from 'react'
import { Search, Plus, Edit2, Image, Trash2, X, Check, Percent } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProducts }  from '../../context/ProductsContext.jsx'
import { fmt, computePrice, MARCAS, CATEGORIAS } from '../../data/index.js'
import Button from '../../components/ui/Button.jsx'

function FieldLabel({ children }) {
  return <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 block mb-1.5">{children}</span>
}

function AdminInput({ className = '', ...props }) {
  return <input {...props} className={`input-base w-full ${className}`} />
}

function ProductDrawer({ productId, onClose }) {
  const { byId, upsert } = useProducts()
  const existing = productId ? byId[productId] : null

  const [form, setForm] = useState(() =>
    existing
      ? {
          nombre:      existing.nombre,
          descripcion: existing.descripcion || '',
          marcaId:     existing.marcaId,
          categoriaId: existing.categoriaId,
          precioBase:  existing.precioBase,
          estado:      existing.estado || 'ACTIVO',
          tag:         existing.tag || '',
          descuentoPct: existing.descuentoPct ?? 0,
        }
      : { nombre: '', descripcion: '', marcaId: 1, categoriaId: 1, precioBase: 0, estado: 'ACTIVO', tag: '', descuentoPct: 0 }
  )
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.nombre.trim())          e.nombre = 'Ingresá un nombre'
    if (Number(form.precioBase) <= 0) e.precioBase = 'El precio debe ser mayor a 0'
    const pct = Number(form.descuentoPct)
    if (pct < 0 || pct > 100)         e.descuentoPct = 'Ingresá un valor entre 0 y 100'
    return e
  }

  const save = () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }

    const marca      = MARCAS.find((m) => m.id === Number(form.marcaId))
    const cat        = CATEGORIAS.find((c) => c.id === Number(form.categoriaId))
    const precioBase = Number(form.precioBase)
    const descuentoPct = Number(form.descuentoPct)
    const precioAnterior = descuentoPct > 0 ? precioBase : (existing?.precioAnterior ?? null)

    const next = {
      ...(existing || {}),
      id:          existing?.id ?? (Date.now() % 100000 + 200),
      nombre:      form.nombre,
      name:        form.nombre,
      descripcion: form.descripcion,
      marcaId:     Number(form.marcaId),
      categoriaId: Number(form.categoriaId),
      brand:       (marca?.nombre || '').toUpperCase(),
      category:    cat?.nombre || '',
      precioBase,
      precioAnterior,
      descuentoPct,
      price:    descuentoPct > 0 ? Math.round(precioBase * (1 - descuentoPct / 100)) : precioBase,
      oldPrice: precioAnterior,
      estado:   form.estado,
      tag:      form.tag || null,
      rating:   existing?.rating ?? 0,
      color:    existing?.color ?? '#454338',
      images:   existing?.images ?? [],
      image:    existing?.image ?? '',
      variants: existing?.variants ?? [],
      stock:    existing?.stock ?? 0,
    }

    upsert(next)
    onClose()
  }

  const f = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const precioBase_   = Number(form.precioBase) || 0
  const descuentoPct_ = Number(form.descuentoPct) || 0
  const precioFinal   = descuentoPct_ > 0 ? Math.round(precioBase_ * (1 - descuentoPct_ / 100)) : precioBase_

  return (
    <>
      <div className="fixed inset-0 bg-rock/60 z-40 fadein" onClick={onClose} />
      <aside className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-ivory text-rock z-50 shadow-2xl flex flex-col fadein">
        <header className="flex items-center justify-between p-5 border-b border-rock/10">
          <div>
            <div className="font-mono text-[10px] tracking-widest-2 uppercase text-alpenglow">
              {existing ? `Editar producto #${existing.id}` : 'Nuevo producto'}
            </div>
            <h2 className="font-display font-black tracking-tightest uppercase text-xl mt-0.5">
              {existing ? (form.nombre || 'Sin nombre') : 'Crear producto'}
            </h2>
          </div>
          <button onClick={onClose} className="h-9 w-9 grid place-items-center border border-rock/15 hover:bg-rock/5">
            <X size={16} />
          </button>
        </header>

        <div className="flex-1 overflow-auto p-5 space-y-4">
          <label className="block">
            <FieldLabel>Nombre</FieldLabel>
            <AdminInput value={form.nombre} onChange={f('nombre')} placeholder="Mochila Atmos AG 65" />
            {errors.nombre && <p className="font-mono text-[10px] text-red-600 mt-1">{errors.nombre}</p>}
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <FieldLabel>Marca</FieldLabel>
              <select value={form.marcaId} onChange={f('marcaId')} className="input-base w-full">
                {MARCAS.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
            </label>
            <label className="block">
              <FieldLabel>Categoría</FieldLabel>
              <select value={form.categoriaId} onChange={f('categoriaId')} className="input-base w-full">
                {CATEGORIAS.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <FieldLabel>Precio base ($)</FieldLabel>
              <AdminInput type="number" min="0" value={form.precioBase} onChange={f('precioBase')} />
              {errors.precioBase && <p className="font-mono text-[10px] text-red-600 mt-1">{errors.precioBase}</p>}
            </label>
            <label className="block">
              <FieldLabel>Descuento (%)</FieldLabel>
              <div className="relative">
                <AdminInput type="number" min="0" max="100" value={form.descuentoPct} onChange={f('descuentoPct')} placeholder="0" className="pr-8" />
                <Percent size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-rock/40 pointer-events-none" />
              </div>
              {errors.descuentoPct && <p className="font-mono text-[10px] text-red-600 mt-1">{errors.descuentoPct}</p>}
            </label>
          </div>

          {precioBase_ > 0 && (
            <div className="bg-rock/[0.04] border border-rock/10 px-4 py-3 flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55">
                Precio que verá el cliente
              </span>
              <div className="flex items-center gap-2">
                {descuentoPct_ > 0 && (
                  <span className="font-mono text-xs text-rock/35 line-through">{fmt(precioBase_)}</span>
                )}
                <span className="font-display font-black tracking-tightest text-lg text-rock">{fmt(precioFinal)}</span>
                {descuentoPct_ > 0 && (
                  <span className="bg-alpenglow text-ivory font-mono text-[10px] px-1.5 py-0.5">
                    -{descuentoPct_}%
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <FieldLabel>Estado</FieldLabel>
              <select value={form.estado} onChange={f('estado')} className="input-base w-full">
                <option value="ACTIVO">ACTIVO</option>
                <option value="INACTIVO">INACTIVO</option>
              </select>
            </label>
            <label className="block">
              <FieldLabel>Etiqueta</FieldLabel>
              <select value={form.tag} onChange={f('tag')} className="input-base w-full">
                <option value="">Sin etiqueta</option>
                <option value="INVIERNO">INVIERNO</option>
                <option value="NUEVO">NUEVO</option>
                <option value="BESTSELLER">BESTSELLER</option>
                <option value="TODO TERRENO">TODO TERRENO</option>
              </select>
            </label>
          </div>

          <label className="block">
            <FieldLabel>Descripción</FieldLabel>
            <textarea value={form.descripcion} onChange={f('descripcion')} rows={4}
              placeholder="Contá la historia del producto…" className="input-base w-full resize-none" />
          </label>
        </div>

        <footer className="border-t border-rock/10 p-5 flex gap-3">
          <Button variant="ghost-light" size="md" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="md" className="flex-1" onClick={save}
            iconRight={<Check size={14} strokeWidth={2.6} />}>
            {existing ? 'Guardar' : 'Crear producto'}
          </Button>
        </footer>
      </aside>
    </>
  )
}

export default function AdminProducts() {
  const navigate              = useNavigate()
  const { id: paramId }       = useParams()
  const { ids, byId, remove } = useProducts()
  const [query, setQuery]     = useState('')

  // Si la ruta tiene :id, el drawer se abre para ese producto
  const [drawerOpen, setDrawerOpen] = useState(!!paramId)
  const [editId, setEditId]         = useState(paramId ? Number(paramId) : null)

  const products = ids
    .map((id) => byId[id])
    .filter((p) => !query || (p.nombre + ' ' + p.brand).toLowerCase().includes(query.toLowerCase()))

  const openDrawer = (id = null) => {
    setEditId(id)
    setDrawerOpen(true)
    if (id) navigate(`/admin/productos/${id}`, { replace: true })
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditId(null)
    if (paramId) navigate('/admin/productos', { replace: true })
  }

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-rock/40" />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o marca…" className="input-base w-full pl-10" />
        </div>
        <Button variant="primary" icon={<Plus size={14} strokeWidth={2.2} />} onClick={() => openDrawer()}>
          Nuevo producto
        </Button>
      </div>

      <div className="bg-white border border-rock/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="text-left bg-rock/[0.02]">
              {['Producto', 'Marca', 'Categoría', 'Stock', 'Precio', 'Descuento', 'Estado', ''].map((h) => (
                <th key={h} className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const { price, oldPrice } = computePrice(p)
              return (
                <tr key={p.id} className="border-t border-rock/10 hover:bg-rock/[0.02]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden shrink-0" style={{ backgroundColor: p.color }}>
                        {p.image && (
                          <img src={p.image} alt="" className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none' }} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-narrow font-bold uppercase tracking-tight text-sm truncate max-w-[200px]">{p.nombre}</div>
                        <div className="font-mono text-[10px] text-rock/45">#{p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-rock/75">{p.brand}</td>
                  <td className="px-5 py-3 text-xs">{p.category}</td>
                  <td className="px-5 py-3">
                    <span className={`font-mono text-xs font-bold ${
                      p.stock === 0 ? 'text-red-700' : p.stock <= 3 ? 'text-alpenglow' : 'text-pine'
                    }`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-bold">{fmt(price)}</span>
                      {oldPrice && <span className="font-mono text-[10px] text-rock/40 line-through">{fmt(oldPrice)}</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {(p.descuentoPct ?? 0) > 0 ? (
                      <span className="inline-flex items-center gap-1 bg-alpenglow/15 text-alpenglow font-mono text-[10px] px-2 py-0.5 tracking-widest-2">
                        <Percent size={9} /> {p.descuentoPct}%
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] text-rock/30">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`font-mono text-[10px] tracking-widest-2 uppercase ${p.estado === 'ACTIVO' ? 'text-pine' : 'text-rock/45'}`}>
                      {p.estado || 'ACTIVO'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openDrawer(p.id)}
                        className="h-8 w-8 grid place-items-center text-rock/55 hover:text-pine border border-rock/15 transition-colors" title="Editar">
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => navigate(`/admin/fotos/${p.id}`)}
                        className="h-8 w-8 grid place-items-center text-rock/55 hover:text-pine border border-rock/15 transition-colors" title="Imágenes">
                        <Image size={13} />
                      </button>
                      <button onClick={() => remove(p.id)}
                        className="h-8 w-8 grid place-items-center text-rock/55 hover:text-red-700 border border-rock/15 transition-colors" title="Eliminar">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="p-10 text-center font-mono text-[11px] tracking-widest-2 uppercase text-rock/40">
            No se encontraron productos
          </div>
        )}
      </div>

      {drawerOpen && <ProductDrawer productId={editId} onClose={closeDrawer} />}
    </div>
  )
}
