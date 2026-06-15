import { useState, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from './ui/Button.jsx'
import { HERO_IMAGES } from '../data/index.js'
import { useProducts } from '../context/ProductsContext.jsx'
import { discountService } from '../api/discountService.js'

function StatCell({ label, value, mono, accent, sub }) {
  return (
    <div>
      <div className="font-mono text-[10px] tracking-widest-2 uppercase text-ivory/45 mb-1.5">{label}</div>
      <div className={`${mono ? 'font-mono' : 'font-narrow font-semibold'} ${accent ? 'text-alpenglow' : 'text-ivory'} text-base lg:text-lg`}>
        {value}
      </div>
      {sub && (
        <div className="mt-1.5 font-mono text-[9px] tracking-widest-2 uppercase text-ivory/35 flex items-center gap-1.5">
          {sub}
        </div>
      )}
    </div>
  )
}

function buildPromoText(descuento) {
  if (!descuento) return null
  const codigo = descuento.codigo
  if (descuento.tipo === 'PORCENTAJE' && codigo) {
    return { eyebrow: `${descuento.porcentaje ?? descuento.valor}% OFF · Código ${codigo}`, stat: `${codigo} · ${descuento.porcentaje ?? descuento.valor}% OFF` }
  }
  if (descuento.tipo === 'FIJO' && codigo) {
    return { eyebrow: `Descuento activo · Código ${codigo}`, stat: `${codigo} · Descuento disponible` }
  }
  if (codigo) {
    return { eyebrow: `Descuento activo · Código ${codigo}`, stat: `${codigo} · Descuento disponible` }
  }
  return null
}

export default function HeroSection() {
  const navigate      = useNavigate()
  const [variant]     = useState('midnight')
  const imgSrc        = HERO_IMAGES[variant] || HERO_IMAGES.midnight
  const { ids }       = useProducts()
  const totalStock    = ids.length

  const [promo, setPromo] = useState(null)

  useEffect(() => {
    discountService.getDescuentosActivos()
      .then((data) => {
        const list = Array.isArray(data) ? data : []
        const withCode = list.find((d) => d.codigo)
        setPromo(buildPromoText(withCode))
      })
      .catch(() => {
        // Sin descuentos disponibles — no mostramos código
      })
  }, [])

  return (
    <section className="relative grain overflow-hidden bg-rock">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={imgSrc} alt="" className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-rock via-rock/70 to-rock/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-rock via-transparent to-rock/30" />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10 pt-16 lg:pt-28 pb-24 lg:pb-36 z-10">

        {/* Eyebrow */}
        <div className="rise rise-d1 inline-flex items-center gap-3 mb-8 lg:mb-12 border border-ivory/20 bg-rock/40 backdrop-blur-sm px-4 py-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-alpenglow animate-pulse" />
          <span className="font-mono text-[11px] tracking-widest-2 uppercase text-ivory/90">
            {promo
              ? promo.eyebrow
              : 'Descubrí productos seleccionados para tu próxima aventura'}
          </span>
        </div>

        {/* Headline */}
        <h1 className="rise rise-d2 font-display font-black uppercase leading-[0.85] tracking-tightest
                       text-[14vw] sm:text-[11vw] lg:text-[9.5rem] xl:text-[11rem] max-w-[12ch]">
          <span className="block text-ivory">Equípate</span>
          <span className="block text-ivory">para la</span>
          <span className="block text-alpenglow italic font-narrow font-medium tracking-tight normal-case text-[0.92em]">cima</span>
        </h1>

        {/* Sub + CTAs */}
        <div className="rise rise-d3 mt-10 lg:mt-14 grid lg:grid-cols-[1fr_auto] gap-8 lg:gap-12 items-end max-w-6xl">
          <p className="text-ivory/75 text-lg lg:text-xl leading-relaxed max-w-xl">
            Rendimiento sin concesiones para las condiciones más extremas. Descubrí nuestra
            línea de equipamiento técnico diseñado para resistir.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
            <Button variant="primary" size="lg"
              onClick={() => navigate('/catalogo?categoria=indumentaria')}
              iconRight={<ArrowRight size={18} strokeWidth={2.2} />}>
              Ver indumentaria
            </Button>
            <Button variant="ghost-dark" size="lg"
              onClick={() => navigate('/catalogo?categoria=calzado')}
              iconRight={<ArrowRight size={16} />}>
              Ver calzado
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="rise rise-d4 mt-16 lg:mt-24 border-t border-ivory/10 pt-6 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
          {promo ? (
            <StatCell label="Código activo" value={promo.stat} mono accent />
          ) : (
            <StatCell label="Colección actual" value="Temporada 2026" />
          )}
          <StatCell label="Productos en stock" value={totalStock.toLocaleString('es-CL')} />
          <StatCell label="Garantía de por vida" value="Toda la línea Pro" />
          <StatCell label="Envío express" value="48 horas" />
        </div>
      </div>

    </section>
  )
}
