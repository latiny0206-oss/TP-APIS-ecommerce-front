import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { useNavigation } from '../context/NavigationContext.jsx'
import Button from './ui/Button.jsx'
import { HERO_IMAGES } from '../data/index.js'
import { MOCK_PRODUCTOS } from '../mocks/data.js'

function StatCell({ label, value, mono, accent, sub }) {
  return (
    <div>
      <div className="font-mono text-[10px] tracking-widest-2 uppercase text-ivory/45 mb-1.5">{label}</div>
      <div className={`${mono ? 'font-mono' : 'font-narrow font-semibold'} ${accent ? 'text-alpenglow' : 'text-ivory'} text-base lg:text-lg`}>
        {value}
      </div>
      {sub && (
        <div className="mt-1.5 font-mono text-[9px] tracking-widest-2 uppercase text-ivory/35 flex items-center gap-1.5">
          <Check size={10} strokeWidth={2.6} className="text-pine shrink-0" />
          {sub}
        </div>
      )}
    </div>
  )
}

export default function HeroSection() {
  const { navigate } = useNavigation()
  const [variant]    = useState('midnight')
  const imgSrc       = HERO_IMAGES[variant] || HERO_IMAGES.midnight
  const totalStock   = MOCK_PRODUCTOS.length

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
            20% OFF en colección de invierno · Código INVIERNO24
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
              onClick={() => {
                sessionStorage.setItem('catalogoState', JSON.stringify({ backView: 'catalogo', categorias: ['indumentaria'] }))
                navigate('catalogo')
              }}
              iconRight={<ArrowRight size={18} strokeWidth={2.2} />}>
              Ver indumentaria
            </Button>
            <Button variant="ghost-dark" size="lg"
              onClick={() => {
                sessionStorage.setItem('catalogoState', JSON.stringify({ backView: 'catalogo', categorias: ['calzado'] }))
                navigate('catalogo')
              }}
              iconRight={<ArrowRight size={16} />}>
              Ver calzado
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="rise rise-d4 mt-16 lg:mt-24 border-t border-ivory/10 pt-6 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
          <StatCell label="Código activo" value="INVIERNO24 · 20% OFF" mono accent sub="Aplicado en checkout" />
          <StatCell label="Productos en stock" value={totalStock.toLocaleString('es-CL')} />
          <StatCell label="Garantía de por vida" value="Toda la línea Pro" />
          <StatCell label="Envío express" value="48 horas" />
        </div>
      </div>

    </section>
  )
}
