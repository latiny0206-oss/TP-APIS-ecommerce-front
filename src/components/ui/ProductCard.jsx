import { ArrowRight, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge.jsx'
import { fmt, computePrice } from '../../data/index.js'

export default function ProductCard({ product, dark = false }) {
  const navigate            = useNavigate()
  const { price, oldPrice } = computePrice(product)

  const outOfStock = product.stock === 0

  return (
    <article
      className="product-card group flex flex-col relative cursor-pointer"
      onClick={() => navigate(`/producto/${product.id}`)}
    >
      <div
        className="relative aspect-[4/5] overflow-hidden"
        style={{ backgroundColor: product.color || '#1F252B' }}
      >
        {(product.imagen || product.image || product.images?.[0]) && (
          <img
            src={product.imagen || product.image || product.images?.[0]}
            alt={product.name || product.nombre}
            className="product-img absolute inset-0 w-full h-full object-cover opacity-95"
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        )}

        {product.tag && !outOfStock && (
          <div className="absolute top-3 left-3 z-10">
            <StatusBadge status={product.tag} />
          </div>
        )}

        {outOfStock && (
          <div className="absolute inset-0 bg-rock/70 grid place-items-center z-10">
            <StatusBadge status="AGOTADO" />
          </div>
        )}

        {!outOfStock && (
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/producto/${product.id}`) }}
            className="absolute left-3 right-3 bottom-3 z-10 py-3 bg-ivory hover:bg-pine hover:text-ivory text-rock font-narrow font-bold uppercase tracking-widest-2 text-xs transition-all translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 flex items-center justify-center gap-2"
          >
            <ArrowRight size={14} strokeWidth={2} />
            Ver más
          </button>
        )}
      </div>

      <div className={`pt-4 pb-2 flex flex-col gap-1.5 ${dark ? 'text-ivory' : 'text-rock'}`}>
        <div className="flex items-center justify-between">
          <span className={`font-mono text-[10px] tracking-widest-2 uppercase ${dark ? 'text-ivory/50' : 'text-rock/55'}`}>
            {product.brand || product.marca}
          </span>
          {product.rating && (
            <span className={`font-mono text-[10px] flex items-center gap-1 ${dark ? 'text-ivory/45' : 'text-rock/45'}`}>
              <Star size={10} strokeWidth={1.5} fill="currentColor" className="text-alpenglow" />
              {product.rating}
            </span>
          )}
        </div>
        <h3 className="font-narrow font-bold uppercase tracking-tight text-base leading-tight">
          {product.name || product.nombre}
        </h3>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-display font-black tracking-tightest text-lg">{fmt(price)}</span>
          {oldPrice && (
            <span className={`text-xs line-through ${dark ? 'text-ivory/40' : 'text-rock/40'}`}>
              {fmt(oldPrice)}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
