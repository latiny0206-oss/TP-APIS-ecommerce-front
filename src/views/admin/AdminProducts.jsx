import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Edit2, Image, Trash2, X, Check, Percent } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProducts }    from '../../context/ProductsContext.jsx'
import { productService } from '../../api/productService.js'
import { getErrorMessage } from '../../api/api.js'
import { fmtPrice }       from '../../utils/format.js'
import Button from '../../components/ui/Button.jsx'

function FieldLabel({ children }) {
  return <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 block mb-1.5">{children}</span>
}
function AdminInput({ className = '', ...props }) {
  return <input {...props} className={`input-base w-full ${className}`} />
}

function ProductDrawer({ product: existing, onClose, onSaved }) {
  const [marcas,     setMarcas]     = useState([])
  const [categorias, setCategorias] = useState([])
  const [saving,     setSaving]     = useState(false)
  const [errors,     setErrors]     = useState({})
  const [saveError,  setSaveError]  = useState(null)

  const [form, setForm] = useState(() =>
    existing
      ? {
          nombre:      existing.nombre,
          descripcion: existing.descripcion || '',
          marcaId:     existing.marcaId ?? 1,
          categoriaId: existing.categoriaId ?? 1,
          precioBase:  existing.precioBase ?? existing.precio ?? 0,
          estado:      existing.estado || 'ACTIVO',
          tag:         existing.tag || '',
          descuentoPct: existing.descuentoPct ?? 0,
        }
      : { nombre: '', descripcion: '', marcaId: 1, categoriaId: 1, precioBase: 0, estado: 'ACTIVO', tag: '', descuentoPct: 0 }
  )

  useEffect(() => {
    Promise.all([productService.getMarcas(), productService.getCategorias()]).then(([m, c]) => {
      setMarcas(m)
      setCategorias(c)
      if (!existing) {
        setForm(prev => ({ ...prev, marcaId: m[0]?.id ?? 1, categoriaId: c[0]?.id ?? 1 }))
      }
    })
  }, []) // eslint-disable-line

  const validate = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Ingresá un nombre'
    if (Number(form.precioBase) <= 0) e.precioBase = 'El precio debe ser mayor a 0'
    const pct = Number(form.descuentoPct)
    if (pct < 0 || pct > 100) e.descuentoPct = 'Ingresá entre 0 y 100'
    return e
  }

  const save = async () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setSaving(true)
    setSaveError(null)
    try {
      const payload = {
        nombre:       form.nombre,
        descripcion:  form.descripcion,
        precioBase:   Number(form.precioBase),
        estado:       form.estado,
        marcaId:      Number(form.marcaId),
        categoriaId:  Number(form.categoriaId),
        descuentoPct: Number(form.descuentoPct) || 0,
        tag:          form.tag || null,
      }
      if (existing) {
        await productService.actualizarProducto(existing.id, payload)
      } else {
        await productService.crearProducto(payload)
      }
      onSaved()
      onClose()
    } catch (err) {
      setSaveError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
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
          {saveError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 font-mono text-[11px] tracking-widest-2 uppercase">
              {saveError}
            </div>
          )}

          <label className="block">
            <FieldLabel>Nombre</FieldLabel>
            <AdminInput value={form.nombre} onChange={f('nombre')} placeholder="Mochila Atmos AG 65" />
            {errors.nombre && <p className="font-mono text-[10px] text-red-600 mt-1">{errors.nombre}</p>}
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <FieldLabel>Marca</FieldLabel>
              <select value={form.marcaId} onChange={f('marcaId')} className="input-base w-full">
                {marcas.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
            </label>
            <label className="block">
              <FieldLabel>Categoría</FieldLabel>
              <select value={form.categoriaId} onChange={f('categoriaId')} className="input-base w-full">
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
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
              <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55">Precio cliente</span>
              <div className="flex items-center gap-2">
                {descuentoPct_ > 0 && (
                  <span className="font-mono text-xs text-rock/35 line-through">{fmtPrice(precioBase_)}</span>
                )}
                <span className="font-display font-black tracking-tightest text-lg text-rock">{fmtPrice(precioFinal)}</span>
                {descuentoPct_ > 0 && (
                  <span className="bg-alpenglow text-ivory font-mono text-[10px] px-1.5 py-0.5">-{descuentoPct_}%</span>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <FieldLabel>Estado</FieldLabel>
              <select value={form.estado} onChange={f('estado')} className="input-base w-full">
                <option value="ACTIVO">ACTIVO</option>
                <option value="PAUSADO">PAUSADO</option>
                <option value="ELIMINADO">ELIMINADO</option>
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
          <Button variant="primary" size="md" className="flex-1" onClick={save} disabled={saving}
            iconRight={<Check size={14} strokeWidth={2.6} />}>
            {saving ? 'Guardando…' : existing ? 'Guardar' : 'Crear producto'}
          </Button>
        </footer>
      </aside>
    </>
  )
}

const ESTADO_STYLES = {
  ACTIVO:    'text-pine',
  PAUSADO:   'text-alpenglow',
  ELIMINADO: 'text-red-600',
}

export default function AdminProducts() {
  const navigate              = useNavigate()
  const { id: paramId }       = useParams()
  const { upsert, remove }    = useProducts()

  const [adminProds,   setAdminProds]   = useState([])
  const [adminLoading, setAdminLoading] = useState(true)
  const [query,        setQuery]        = useState('')
  const [drawerOpen,   setDrawerOpen]   = useState(!!paramId)
  const [editProduct,  setEditProduct]  = useState(null)
  const [deleting,     setDeleting]     = useState(null)
  const [deleteError,  setDeleteError]  = useState(null)
  const [delId,        setDelId]        = useState(null)
  const [delNombre,    setDelNombre]    = useState('')

  // Carga todos los productos (ACTIVO + PAUSADO + ELIMINADO) para el admin
  const loadAdminProds = useCallback(async () => {
    setAdminLoading(true)
    try {
      const [prods, vars, fotos] = await Promise.all([
        productService.getProductosAdmin(),
        productService.getVariantes(),
        productService.getAllFotos().catch(() => []),
      ])
      const varByProd = vars.reduce((acc, v) => {
        const pid = v.productoId
        if (pid) { acc[pid] = acc[pid] ?? []; acc[pid].push(v) }
        return acc
      }, {})
      const fotosByVariante = fotos.reduce((acc, f) => {
        if (f.varianteId) {
          acc[f.varianteId] = acc[f.varianteId] ?? []
          acc[f.varianteId].push(f)
        }
        return acc
      }, {})
      const normalized = prods.map((p) => {
        const productVars = varByProd[p.id] ?? []
        const n = productService.normalizeProducto(p, productVars)
        for (const v of productVars) {
          const fotosVar = (fotosByVariante[v.id] ?? [])
            .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
          if (fotosVar.length > 0) {
            n.imagen = productService.buildImageSrc(fotosVar[0])
            break
          }
        }
        return n
      })
      setAdminProds(normalized)
      // Sincroniza los productos ACTIVO con el contexto público
      normalized.filter(p => p.estado === 'ACTIVO').forEach((p) => upsert(p))
    } catch {
      // Si el endpoint admin falla (403 u otro), caer al público
      try {
        const [prods, vars, fotos] = await Promise.all([
          productService.getProductos(),
          productService.getVariantes(),
          productService.getAllFotos().catch(() => []),
        ])
        const varByProd = vars.reduce((acc, v) => {
          const pid = v.productoId
          if (pid) { acc[pid] = acc[pid] ?? []; acc[pid].push(v) }
          return acc
        }, {})
        const fotosByVariante = fotos.reduce((acc, f) => {
          if (f.varianteId) {
            acc[f.varianteId] = acc[f.varianteId] ?? []
            acc[f.varianteId].push(f)
          }
          return acc
        }, {})
        const normalized = prods.map((p) => {
          const productVars = varByProd[p.id] ?? []
          const n = productService.normalizeProducto(p, productVars)
          for (const v of productVars) {
            const fotosVar = (fotosByVariante[v.id] ?? [])
              .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
            if (fotosVar.length > 0) {
              n.imagen = productService.buildImageSrc(fotosVar[0])
              break
            }
          }
          return n
        })
        setAdminProds(normalized)
        normalized.forEach((p) => upsert(p))
      } catch {}
    } finally {
      setAdminLoading(false)
    }
  }, [upsert])

  useEffect(() => { loadAdminProds() }, [loadAdminProds])

  // Abre drawer con el producto pasado por parámetro de URL
  useEffect(() => {
    if (paramId && adminProds.length > 0) {
      const found = adminProds.find(p => p.id === Number(paramId))
      if (found) setEditProduct(found)
    }
  }, [paramId, adminProds])

  const products = adminProds.filter((p) =>
    !query || (p.nombre + ' ' + (p.marca ?? '')).toLowerCase().includes(query.toLowerCase())
  )

  const openDrawer = (product = null) => {
    setEditProduct(product)
    setDrawerOpen(true)
    if (product?.id) navigate(`/admin/productos/${product.id}`, { replace: true })
    else             navigate('/admin/productos', { replace: true })
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditProduct(null)
    if (paramId) navigate('/admin/productos', { replace: true })
  }

  const confirmDelete = (p) => {
    setDelId(p.id)
    setDelNombre(p.nombre)
    setDeleteError(null)
  }

  const handleDelete = async () => {
    if (!delId) return
    setDeleting(delId)
    setDeleteError(null)
    try {
      await productService.eliminarProducto(delId)
      setAdminProds(prev => prev.filter(p => p.id !== delId))
      remove(delId)
      setDelId(null)
    } catch (e) {
      setDeleteError(getErrorMessage(e))
    }
    setDeleting(null)
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

      {deleteError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 font-mono text-[11px] tracking-widest-2 uppercase flex items-center justify-between">
          {deleteError}
          <button onClick={() => setDeleteError(null)} className="ml-4 text-red-400 hover:text-red-700">
            <X size={14} />
          </button>
        </div>
      )}

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
            {adminLoading ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center font-mono text-[11px] tracking-widest-2 uppercase text-rock/40">
                  Cargando…
                </td>
              </tr>
            ) : products.map((p) => {
              const pf = (p.descuentoPct ?? 0) > 0
                ? Math.round((p.precioBase ?? p.precio ?? 0) * (1 - (p.descuentoPct ?? 0) / 100))
                : (p.precioBase ?? p.precio ?? 0)
              return (
                <tr key={p.id} className={`border-t border-rock/10 hover:bg-rock/[0.02] ${p.estado !== 'ACTIVO' ? 'opacity-60' : ''}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden shrink-0 bg-rock/10 flex items-center justify-center">
                        {p.imagen ? (
                          <img src={p.imagen} alt="" className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none' }} />
                        ) : (
                          <span className="font-mono text-[8px] text-rock/30">IMG</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-narrow font-bold uppercase tracking-tight text-sm truncate max-w-[200px]">{p.nombre}</div>
                        <div className="font-mono text-[10px] text-rock/45">#{p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-rock/75">{p.marca}</td>
                  <td className="px-5 py-3 text-xs capitalize">{p.categoria}</td>
                  <td className="px-5 py-3">
                    <span className={`font-mono text-xs font-bold ${
                      p.stock === 0 ? 'text-red-700' : p.stock <= 3 ? 'text-alpenglow' : 'text-pine'
                    }`}>{p.stock}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-bold">{fmtPrice(pf)}</span>
                      {(p.descuentoPct ?? 0) > 0 && (
                        <span className="font-mono text-[10px] text-rock/40 line-through">{fmtPrice(p.precioBase ?? p.precio ?? 0)}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {(p.descuentoPct ?? 0) > 0 ? (
                      <span className="inline-flex items-center gap-1 bg-alpenglow/15 text-alpenglow font-mono text-[10px] px-2 py-0.5 tracking-widest-2">
                        <Percent size={9} /> {p.descuentoPct}%
                      </span>
                    ) : <span className="font-mono text-[10px] text-rock/30">—</span>}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`font-mono text-[10px] tracking-widest-2 uppercase ${ESTADO_STYLES[p.estado] ?? 'text-rock/45'}`}>
                      {p.estado || 'ACTIVO'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openDrawer(p)}
                        className="h-8 w-8 grid place-items-center text-rock/55 hover:text-pine border border-rock/15 transition-colors">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => navigate(`/admin/fotos/${p.id}`)}
                        className="h-8 w-8 grid place-items-center text-rock/55 hover:text-pine border border-rock/15 transition-colors">
                        <Image size={13} />
                      </button>
                      <button onClick={() => confirmDelete(p)} disabled={deleting === p.id}
                        className="h-8 w-8 grid place-items-center text-rock/55 hover:text-red-700 border border-rock/15 transition-colors disabled:opacity-40">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!adminLoading && products.length === 0 && (
          <div className="p-10 text-center font-mono text-[11px] tracking-widest-2 uppercase text-rock/40">
            No se encontraron productos
          </div>
        )}
      </div>

      {drawerOpen && (
        <ProductDrawer product={editProduct} onClose={closeDrawer} onSaved={loadAdminProds} />
      )}

      {delId !== null && (
        <>
          <div className="fixed inset-0 bg-rock/60 z-40 fadein" onClick={() => { setDelId(null); setDeleteError(null) }} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 fadein">
            <div className="bg-ivory w-full max-w-xs border border-rock/15 shadow-2xl p-6">
              <h3 className="font-display font-black tracking-tightest uppercase text-lg">¿Eliminar producto?</h3>
              <p className="font-narrow text-sm text-rock/65 mt-1 mb-4 truncate">"{delNombre}"</p>
              <p className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/50 mb-5">
                Esta acción no se puede deshacer.
              </p>
              {deleteError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 font-mono text-[10px] tracking-widest-2 uppercase mb-4">
                  {deleteError}
                </div>
              )}
              <div className="flex gap-3">
                <Button variant="ghost-light" size="sm" className="flex-1"
                  onClick={() => { setDelId(null); setDeleteError(null) }}>
                  Cancelar
                </Button>
                <Button variant="danger" size="sm" className="flex-1"
                  onClick={handleDelete} disabled={!!deleting}>
                  {deleting ? 'Eliminando…' : 'Eliminar'}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
