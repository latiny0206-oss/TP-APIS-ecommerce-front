import { useDispatch } from 'react-redux'
import { ArrowRight, Tent, Footprints, Shirt, Box } from 'lucide-react'
import { navigate } from '../store/navigationSlice.js'
import { CATEGORIES } from '../data/index.js'
import SectionHeader from './ui/SectionHeader.jsx'

const ICON_MAP     = { tent: Tent, boot: Footprints, jacket: Shirt }
// Mapeo de id de categoría al view name del router
const VIEW_MAP     = { campamento: 'accesorios', calzado: 'calzado', ropa: 'indumentaria' }

export default function Categories() {
  const dispatch = useDispatch()

  return (
    <section id="catalogo" className="relative bg-rock py-20 lg:py-28">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <SectionHeader
          number="01" eyebrow="Catálogo"
          title={<>Explorá por<br/>categoría</>}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4 mt-12 lg:mt-16">
          {CATEGORIES.map((cat, i) => {
            const Ico = ICON_MAP[cat.iconKey] || Box
            const view = VIEW_MAP[cat.id] || 'indumentaria'
            return (
              <button key={cat.id} onClick={() => dispatch(navigate(view))}
                className="group relative overflow-hidden aspect-[4/5] md:aspect-[3/5] lg:aspect-[3/4] bg-rock-700 text-left">
                <img src={cat.img} alt={cat.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  onError={(e) => { e.currentTarget.style.display = 'none' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-rock via-rock/50 to-transparent" />

                <div className="absolute top-5 left-5 font-mono text-[11px] tracking-widest-2 uppercase text-ivory/80">
                  /{String(i + 1).padStart(2, '0')}
                </div>
                <div className="absolute top-5 right-5 h-10 w-10 grid place-items-center bg-rock/60 backdrop-blur-sm border border-ivory/20 text-ivory">
                  <Ico size={22} />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                  <h3 className="font-display font-black tracking-tightest uppercase text-3xl lg:text-4xl mb-2 leading-none text-ivory">
                    {cat.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-xs lg:text-sm text-ivory/60">{cat.sub}</p>
                    <span className="h-9 w-9 grid place-items-center rounded-full bg-ivory text-rock group-hover:bg-pine group-hover:text-ivory group-hover:rotate-45 transition-all duration-300">
                      <ArrowRight size={16} strokeWidth={2.2} />
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
