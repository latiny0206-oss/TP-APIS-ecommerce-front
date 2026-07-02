import { useState, useEffect } from 'react'
import { Upload, Check, Trash2, ChevronRight, ImageOff, Layers } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { productService } from '../../api/productService.js'
import { getErrorMessage } from '../../api/api.js'
import { useProducts } from '../../context/ProductsContext.jsx'

async function uploadFoto(varianteId, file, onProgress, nextOrden) {
  const formData = new FormData()
  formData.append('varianteId', varianteId)
  formData.append('orden', nextOrden)
  formData.append('archivo', file)
  const data = await productService.subirFoto(formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (e.total) onProgress(Math.round((e.loaded / e.total) * 100))
    },
  })
  return data
}

export default function AdminPhotos() {
  const navigate               = useNavigate()
  const { productId: paramId } = useParams()
  const { reload }             = useProducts()

  const [adminProds,   setAdminProds]   = useState([])
  const [prodsLoading, setProdsLoading] = useState(true)

  // Carga todos los productos (ACTIVO + PAUSADO + ELIMINADO) para gestionar fotos de cualquier estado
  useEffect(() => {
    Promise.all([
      productService.getProductosAdmin().catch(() => productService.getProductos()),
      productService.getVariantes(),
    ]).then(([prods, vars]) => {
      const varByProd = vars.reduce((acc, v) => {
        const pid = v.productoId
        if (pid) { acc[pid] = acc[pid] ?? []; acc[pid].push(v) }
        return acc
      }, {})
      setAdminProds(prods.map((p) => productService.normalizeProducto(p, varByProd[p.id] ?? [])))
    }).finally(() => setProdsLoading(false))
  }, [])

  const product   = (paramId ? adminProds.find((p) => p.id === Number(paramId)) : null) ?? adminProds[0]
  const variantes = product?._variantes ?? []

  const [selectedVar,  setSelectedVar]  = useState(null)
  const [fotos,        setFotos]        = useState([])
  const [loadingFotos, setLoadingFotos] = useState(false)
  const [queue,        setQueue]        = useState([])
  const [dragOver,     setDragOver]     = useState(false)
  const [deleteError,  setDeleteError]  = useState(null)

  // Selecciona la primera variante disponible
  useEffect(() => {
    if (variantes.length > 0 && !selectedVar) {
      setSelectedVar(variantes[0])
    }
  }, [variantes.length]) // eslint-disable-line

  // Carga fotos de la variante seleccionada
  useEffect(() => {
    if (!selectedVar) return
    setLoadingFotos(true)
    productService.getFotosByVariante(selectedVar.id)
      .then(setFotos)
      .catch(() => setFotos([]))
      .finally(() => setLoadingFotos(false))
  }, [selectedVar?.id]) // eslint-disable-line

  async function handleDelete(fotoId) {
    setDeleteError(null)
    try {
      await productService.eliminarFoto(fotoId)
      setFotos(prev => prev.filter(f => f.id !== fotoId))
      reload()
    } catch (e) {
      setDeleteError(getErrorMessage(e))
    }
  }

  function handleFiles(files) {
    if (!selectedVar) return
    ;[...(files || [])].forEach((file) => {
      const uid    = `q-${Date.now()}-${Math.random()}`
      const sizeMb = (file.size / 1024 / 1024).toFixed(1)
      setQueue(q => [...q, { uid, name: file.name, size: `${sizeMb} MB`, progress: 0, done: false, error: null }])

      const nextOrden = fotos.length + 1
      uploadFoto(selectedVar.id, file, (pct) => {
        setQueue(q => q.map(it => it.uid === uid ? { ...it, progress: pct } : it))
      }, nextOrden)
        .then((nueva) => {
          setFotos(prev => [...prev, nueva])
          setQueue(q => q.map(it => it.uid === uid ? { ...it, progress: 100, done: true } : it))
          reload()
        })
        .catch((e) => {
          setQueue(q => q.map(it => it.uid === uid ? { ...it, error: getErrorMessage(e) } : it))
        })
    })
  }

  if (prodsLoading) {
    return (
      <div className="py-16 text-center font-mono text-[11px] tracking-widest-2 uppercase text-rock/40">
        Cargando productos…
      </div>
    )
  }

  if (!product) {
    return (
      <p className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/55">
        No hay productos disponibles.
      </p>
    )
  }

  if (variantes.length === 0) {
    return (
      <div className="space-y-6">
        <nav className="flex items-center gap-2 font-mono text-[11px] tracking-widest-2 uppercase text-rock/55">
          <button onClick={() => navigate('/admin/productos')} className="hover:text-pine transition-colors">
            Productos
          </button>
          <ChevronRight size={10} className="text-rock/30" />
          <span className="truncate max-w-[180px]">{product.nombre}</span>
          <ChevronRight size={10} className="text-rock/30" />
          <span className="text-rock">Imágenes</span>
        </nav>
        <div className="bg-white border border-rock/10 p-10 flex flex-col items-center gap-4 text-center">
          <Layers size={36} strokeWidth={1.4} className="text-rock/30" />
          <div>
            <p className="font-display font-black tracking-tightest uppercase text-xl mb-1">Sin variantes</p>
            <p className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/55">
              Creá al menos una variante para poder subir fotos a este producto.
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/variantes')}
            className="mt-2 font-mono text-[10px] tracking-widest-2 uppercase px-5 py-2.5 bg-pine text-ivory hover:opacity-80 transition-opacity">
            Ir a Variantes →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      <nav className="flex items-center gap-2 font-mono text-[11px] tracking-widest-2 uppercase text-rock/55">
        <button onClick={() => navigate('/admin/productos')} className="hover:text-pine transition-colors">
          Productos
        </button>
        <ChevronRight size={10} className="text-rock/30" />
        <span className="truncate max-w-[180px]">{product.nombre}</span>
        <ChevronRight size={10} className="text-rock/30" />
        <span className="text-rock">Imágenes</span>
      </nav>

      <div className="flex items-end justify-between">
        <div>
          <div className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow mb-2">
            Imágenes · {product.marca}
          </div>
          <h2 className="font-display font-black tracking-tightest uppercase text-3xl lg:text-4xl leading-[0.9]">
            {product.nombre}
          </h2>
        </div>
        <span className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/55">
          {fotos.length} imagen{fotos.length !== 1 ? 'es' : ''}
        </span>
      </div>

      {/* Selector de variante */}
      {variantes.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 self-center mr-1">Variante:</span>
          {variantes.map(v => (
            <button key={v.id}
              onClick={() => setSelectedVar(v)}
              className={`font-mono text-[10px] tracking-widest-2 uppercase px-3 py-1.5 border transition-colors
                ${selectedVar?.id === v.id
                  ? 'bg-rock text-ivory border-rock'
                  : 'border-rock/20 text-rock/60 hover:text-rock'}`}>
              {v.color} · {v.talla} #{v.id}
            </button>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">

        <section className="bg-white border border-rock/10">
          <header className="p-5 border-b border-rock/10 flex items-center justify-between">
            <h3 className="font-display font-black tracking-tightest uppercase text-lg">Fotos actuales</h3>
            {selectedVar && (
              <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55">
                variante #{selectedVar.id}
              </span>
            )}
          </header>
          <div className="p-5">
            {deleteError && (
              <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 font-mono text-[11px] tracking-widest-2 uppercase flex items-center justify-between">
                {deleteError}
                <button onClick={() => setDeleteError(null)} className="ml-3 text-red-400 hover:text-red-700">×</button>
              </div>
            )}
            {loadingFotos ? (
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-rock/10 animate-pulse" />
                ))}
              </div>
            ) : fotos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {fotos.map((foto, i) => (
                  <div key={foto.id} className="group relative aspect-square bg-rock/5 overflow-hidden border border-rock/10">
                    <img
                      src={productService.buildImageSrc(foto)}
                      alt={`Foto ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                    <span className="absolute top-2 left-2 h-6 w-6 grid place-items-center bg-rock text-ivory font-mono text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <button
                      onClick={() => handleDelete(foto.id)}
                      className="absolute top-2 right-2 h-6 w-6 grid place-items-center bg-rock/80 text-ivory hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-10 text-rock/35">
                <ImageOff size={28} strokeWidth={1.5} />
                <p className="font-mono text-[11px] tracking-widest-2 uppercase">Sin imágenes aún</p>
              </div>
            )}
          </div>
        </section>

        <section className="bg-white border border-rock/10">
          <header className="p-5 border-b border-rock/10">
            <h3 className="font-display font-black tracking-tightest uppercase text-lg">Subir nuevas fotos</h3>
            {!selectedVar && (
              <p className="font-mono text-[10px] tracking-widest-2 uppercase text-alpenglow mt-1">
                Seleccioná una variante primero
              </p>
            )}
          </header>
          <div className="p-5">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
              className={`relative border-2 border-dashed p-10 text-center transition-all
                ${!selectedVar ? 'opacity-40 pointer-events-none' : 'cursor-pointer'}
                ${dragOver ? 'border-pine bg-pine/5' : 'border-rock/25 hover:border-rock/45'}`}>
              <Upload size={36} strokeWidth={1.4} className="mx-auto mb-4 text-rock/45" />
              <div className="font-narrow font-bold uppercase tracking-widest-2 text-sm mb-2">
                Arrastrá imágenes aquí o{' '}
                <label className="text-pine underline cursor-pointer">
                  seleccioná archivos
                  <input type="file" multiple accept="image/*" className="sr-only"
                    onChange={(e) => handleFiles(e.target.files)} />
                </label>
              </div>
              <p className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/45">
                JPG, PNG, WEBP · Máx. 10 MB por archivo
              </p>
            </div>

            {queue.length > 0 && (
              <div className="mt-5">
                <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 mb-3 flex items-center gap-2">
                  <span>Cola de subida</span>
                  <span className="text-pine">· {queue.filter(q => q.done).length} completadas</span>
                </div>
                <ul className="space-y-2">
                  {queue.map((q) => (
                    <li key={q.uid} className="border border-rock/10 p-3 flex items-center gap-3">
                      <span className={`h-8 w-8 grid place-items-center shrink-0
                        ${q.error ? 'bg-red-100 text-red-700' : q.done ? 'bg-pine/15 text-pine' : 'bg-alpenglow/15 text-alpenglow'}`}>
                        {q.done ? <Check size={14} strokeWidth={2.6} /> : <Upload size={14} />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-xs truncate">{q.name}</div>
                        <div className="font-mono text-[10px] text-rock/55 mt-0.5">{q.size}</div>
                        {!q.done && !q.error && (
                          <div className="mt-1.5 h-1 bg-rock/10 overflow-hidden">
                            <div className="h-full bg-alpenglow transition-all" style={{ width: `${q.progress}%` }} />
                          </div>
                        )}
                        {q.error && (
                          <div className="font-mono text-[10px] text-red-600 mt-0.5 truncate">{q.error}</div>
                        )}
                      </div>
                      <span className="font-mono text-[10px] tracking-widest-2 uppercase whitespace-nowrap text-rock/55">
                        {q.error ? 'error' : q.done ? '✓ subida' : `${q.progress}%`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
