import { useDispatch } from 'react-redux'
import { ShoppingCart, Star, ArrowLeft } from 'lucide-react'
import { addToCart }  from '../store/cartSlice.js'
import { navigate }   from '../store/navigationSlice.js'
import { getProductosByCategoria, fmtPrice, precioFinal } from '../mocks/data.js'

const TITLES = {
  indumentaria: { title: 'Indumentaria',  sub: 'Chaquetas, pantalones y capas técnicas' },
  calzado:      { title: 'Calzado',       sub: 'Botas, zapatillas y sandalia de montaña' },
  accesorios:   { title: 'Accesorios',    sub: 'Mochilas, linternas, bastones y más' },
}

function ProductoCard({ producto }) {
  const dispatch = useDispatch()
  const pf = precioFinal(producto)

  const handleAdd = (e) => {
    e.stopPropagation()
    dispatch(addToCart({
      productId: producto.id,
      nombre:    producto.nombre,
      precio:    pf,
      imagen:    producto.imagen,
      talle:     producto.talles?.[0] ?? null,
    }))
  }

  return (
    <article
      className="product-card group flex flex-col cursor-pointer"
      onClick={() => dispatch(navigate({ view: 'producto', params: { id: producto.id } }))}
    >
      {/* Imagen */}
      <div className="relative aspect-[4/5] overflow-hidden bg-rock-700">
        <img
          src={producto.imagen}
          alt={producto.nombre}
          className="product-img absolute inset-0 w-full h-full object-cover opacity-95"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />

        {producto.tag && (
          <div className="absolute top-3 left-3 z-10">
            <span className="font-mono text-[10px] tracking-widest-2 uppercase px-2 py-1 bg-alpenglow text-ivory">
              {producto.tag}
            </span>
          </div>
        )}

        {producto.descuento > 0 && (
          <div className="absolute top-3 right-3 z-10">
            <span className="font-mono text-[10px] tracking-widest-2 uppercase px-2 py-1 bg-rock text-ivory">
              -{producto.descuento}%
            </span>
          </div>
        )}

        <button
          onClick={handleAdd}
          className="absolute left-3 right-3 bottom-3 z-10 py-3 bg-ivory hover:bg-pine hover:text-ivory text-rock font-narrow font-bold uppercase tracking-widest-2 text-xs transition-all translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 flex items-center justify-center gap-2"
        >
          <ShoppingCart size={14} strokeWidth={2} />
          Agregar al carrito
        </button>
      </div>

      {/* Info */}
      <div className="pt-4 pb-2 flex flex-col gap-1.5 bg-ivory text-rock">
        <div className="flex items-center justify-between">
          {producto.talles && producto.talles[0] !== 'Único' && (
            <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/45">
              {producto.talles.length} talles
            </span>
          )}
          {producto.rating && (
            <span className="font-mono text-[10px] flex items-center gap-1 text-rock/45 ml-auto">
              <Star size={10} strokeWidth={1.5} fill="currentColor" className="text-alpenglow" />
              {producto.rating}
            </span>
          )}
        </div>
        <h3 className="font-narrow font-bold uppercase tracking-tight text-base leading-tight text-rock">
          {producto.nombre}
        </h3>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-display font-black tracking-tightest text-lg text-rock">
            {fmtPrice(pf)}
          </span>
          {producto.descuento > 0 && (
            <span className="text-xs line-through text-rock/40">
              {fmtPrice(producto.precio)}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

export default function Catalogo({ categoria }) {
  const dispatch   = useDispatch()
  const productos  = getProductosByCategoria(categoria)
  const { title, sub } = TITLES[categoria] || { title: categoria, sub: '' }

  return (
    <div className="bg-ivory text-rock min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 lg:py-14">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 font-mono text-[11px] tracking-widest-2 uppercase text-rock/55 mb-8">
          <button onClick={() => dispatch(navigate('home'))} className="hover:text-alpenglow transition-colors">
            Inicio
          </button>
          <span className="text-rock/30">›</span>
          <span className="text-rock">{title}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow">
                Catálogo
              </span>
              <span className="h-px w-12 bg-rock/20" />
            </div>
            <h1 className="font-display font-black tracking-tightest uppercase text-5xl lg:text-7xl leading-[0.9]">
              {title}
            </h1>
            <p className="mt-3 text-rock/55 font-mono text-[11px] tracking-widest-2 uppercase">
              {sub} · {productos.length} productos
            </p>
          </div>
          <button
            onClick={() => dispatch(navigate('home'))}
            className="inline-flex items-center gap-2 font-mono text-[11px] tracking-widest-2 uppercase text-rock/55 hover:text-rock transition-colors self-start"
          >
            <ArrowLeft size={12} /> Volver al inicio
          </button>
        </div>

        {/* Grid */}
        {productos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-12">
            {productos.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border border-dashed border-rock/20">
            <p className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/40">
              Sin productos disponibles
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
