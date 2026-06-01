import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Upload, Check, Trash2, ChevronRight } from 'lucide-react'
import { navigate } from '../../store/navigationSlice.js'

export default function AdminPhotos() {
  const dispatch     = useDispatch()
  const productIds   = useSelector((s) => s.products.ids)
  const productsById = useSelector((s) => s.products.byId)
  const paramId      = useSelector((s) => s.navigation.params.productId)

  // Producto seleccionado: el del parámetro o el primero de la lista
  const product = productsById[paramId] ?? productsById[productIds[0]]

  const [photos, setPhotos] = useState(() =>
    (product?.images || []).map((src, i) => ({
      id: `ph${i}`, src, name: `${product?.id ?? 0}_foto_${i + 1}.jpg`, size: '2.4 MB',
    }))
  )

  const [queue, setQueue] = useState([
    { id: 'q1', name: 'detalle_correa.webp',  size: '2.4 MB', progress: 100, done: true },
    { id: 'q2', name: 'lifestyle_trekking.jpg', size: '5.1 MB', progress: 100, done: true },
  ])

  const [dragOver, setDragOver] = useState(false)

  const fakeUpload = (files) => {
    ;[...(files || [])].forEach((file, i) => {
      const id   = `q-${Date.now()}-${i}`
      const name = file.name || `upload_${Date.now()}.jpg`
      const sizeMb = ((file.size || 2 * 1024 * 1024) / 1024 / 1024).toFixed(1)
      setQueue((q) => [...q, { id, name, size: `${sizeMb} MB`, progress: 0, done: false }])

      let p = 0
      const iv = setInterval(() => {
        p += Math.random() * 25
        if (p >= 100) {
          clearInterval(iv)
          setQueue((q) => q.map((it) => it.id === id ? { ...it, progress: 100, done: true } : it))
          setPhotos((ph) => [
            ...ph,
            { id, src: 'https://images.unsplash.com/photo-1622260614153-03223fb72052?auto=format&fit=crop&w=600&q=70', name, size: `${sizeMb} MB` },
          ])
        } else {
          setQueue((q) => q.map((it) => it.id === id ? { ...it, progress: Math.round(p) } : it))
        }
      }, 300)
    })
  }

  if (!product) {
    return (
      <p className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/55">
        No hay productos disponibles.
      </p>
    )
  }

  return (
    <div className="space-y-6">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 font-mono text-[11px] tracking-widest-2 uppercase text-rock/55">
        <button
          onClick={() => dispatch(navigate('admin-products'))}
          className="hover:text-pine transition-colors"
        >
          Productos
        </button>
        <ChevronRight size={10} className="text-rock/30" />
        <span className="truncate max-w-[180px]">{product.name}</span>
        <ChevronRight size={10} className="text-rock/30" />
        <span className="text-rock">Imágenes</span>
      </nav>

      {/* Cabecera */}
      <div className="flex items-end justify-between">
        <div>
          <div className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow mb-2">
            Imágenes · {product.brand}
          </div>
          <h2 className="font-display font-black tracking-tightest uppercase text-3xl lg:text-4xl leading-[0.9]">
            {product.name}
          </h2>
        </div>
        <span className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/55">
          {photos.length} imagen{photos.length !== 1 ? 'es' : ''}
        </span>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Fotos actuales */}
        <section className="bg-white border border-rock/10">
          <header className="p-5 border-b border-rock/10 flex items-center justify-between">
            <h3 className="font-display font-black tracking-tightest uppercase text-lg">Fotos actuales</h3>
            <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55">
              {photos.length} imágenes
            </span>
          </header>

          <div className="p-5">
            {photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((ph, i) => (
                  <div key={ph.id} className="group relative aspect-square bg-rock-700 overflow-hidden border border-rock/10">
                    <img src={ph.src} alt={ph.name} className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none' }} />
                    <span className="absolute top-2 left-2 h-6 w-6 grid place-items-center bg-rock text-ivory font-mono text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-rock/90 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="font-mono text-[9px] text-ivory truncate">{ph.name}</div>
                    </div>
                    <button
                      onClick={() => setPhotos((ps) => ps.filter((p) => p.id !== ph.id))}
                      className="absolute top-2 right-2 h-6 w-6 grid place-items-center bg-rock/80 text-ivory hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-10 font-mono text-[11px] tracking-widest-2 uppercase text-rock/40">
                Sin imágenes aún
              </p>
            )}
          </div>
        </section>

        {/* Zona de subida */}
        <section className="bg-white border border-rock/10">
          <header className="p-5 border-b border-rock/10">
            <h3 className="font-display font-black tracking-tightest uppercase text-lg">Subir nuevas fotos</h3>
          </header>

          <div className="p-5">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); fakeUpload(e.dataTransfer.files) }}
              className={`relative border-2 border-dashed p-10 text-center transition-all cursor-pointer ${
                dragOver ? 'border-pine bg-pine/5' : 'border-rock/25 hover:border-rock/45'
              }`}
            >
              <Upload size={36} strokeWidth={1.4} className="mx-auto mb-4 text-rock/45" />
              <div className="font-narrow font-bold uppercase tracking-widest-2 text-sm mb-2">
                Arrastrá imágenes aquí o{' '}
                <label className="text-pine underline cursor-pointer">
                  seleccioná archivos
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => fakeUpload(e.target.files)}
                  />
                </label>
              </div>
              <p className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/45">
                JPG, PNG, WEBP · Máx. 10 MB por archivo
              </p>
            </div>

            {/* Cola de subida */}
            <div className="mt-5">
              <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 mb-3 flex items-center gap-2">
                <span>Cola de subida</span>
                <span className="text-pine">· {queue.filter((q) => q.done).length} completadas</span>
              </div>
              <ul className="space-y-2">
                {queue.map((q) => (
                  <li key={q.id} className="border border-rock/10 p-3 flex items-center gap-3">
                    <span className={`h-8 w-8 grid place-items-center shrink-0 ${q.done ? 'bg-pine/15 text-pine' : 'bg-alpenglow/15 text-alpenglow'}`}>
                      {q.done ? <Check size={14} strokeWidth={2.6} /> : <Upload size={14} />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-xs truncate">{q.name}</div>
                      <div className="font-mono text-[10px] text-rock/55 mt-0.5">{q.size}</div>
                      {!q.done && (
                        <div className="mt-1.5 h-1 bg-rock/10 overflow-hidden">
                          <div className="h-full bg-alpenglow transition-all" style={{ width: `${q.progress}%` }} />
                        </div>
                      )}
                    </div>
                    <span className="font-mono text-[10px] tracking-widest-2 uppercase whitespace-nowrap text-rock/55">
                      {q.done ? '✓ subida' : `${q.progress}%`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
