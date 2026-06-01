import { useDispatch } from 'react-redux'
import { ArrowRight, Truck, Shield, Compass, Check } from 'lucide-react'
import { navigate } from '../store/navigationSlice.js'
import SectionHeader from './ui/SectionHeader.jsx'
import ProductCard   from './ui/ProductCard.jsx'
import { TRUST_ITEMS } from '../data/index.js'
import { MOCK_PRODUCTOS, precioFinal } from '../mocks/data.js'

const TRUST_ICONS = { truck: Truck, shield: Shield, compass: Compass, check: Check }

// Toma los primeros 4 del mock y normaliza los campos que ProductCard espera
const FEATURED_PRODUCTS = MOCK_PRODUCTOS.slice(0, 4).map((p) => {
  const pf = precioFinal(p)
  return {
    ...p,
    name:          p.nombre,
    brand:         p.marca,
    image:         p.imagen,
    // precioBase = precio ya descontado; precioAnterior = precio original para tachar
    precioBase:    pf,
    precioAnterior: p.descuento > 0 ? p.precio : null,
    descuentoPct:  0,           // el descuento ya está aplicado en precioBase
  }
})

export default function Featured() {
  const dispatch = useDispatch()

  return (
    <section className="relative py-20 lg:py-28 bg-ivory text-rock">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <SectionHeader
          number="02" eyebrow="Selección Pro"
          title={<>Equipamiento<br/>destacado</>}
          dark={false}
          action={
            <button onClick={() => dispatch(navigate('indumentaria'))}
              className="self-start lg:self-end inline-flex items-center gap-2 font-narrow font-bold uppercase tracking-widest-2 text-sm hover:text-alpenglow link-underline text-rock transition-colors">
              Ver todos los productos
              <ArrowRight size={16} strokeWidth={2.2} />
            </button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 lg:gap-y-12 mt-12 lg:mt-16">
          {FEATURED_PRODUCTS.map((p) => <ProductCard key={p.id} product={p} dark={false} />)}
        </div>

        {/* Trust strip */}
        <div className="mt-16 lg:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-px bg-rock/10 border border-rock/10">
          {TRUST_ITEMS.map((t, i) => {
            const Ico = TRUST_ICONS[t.iconKey] || Check
            return (
              <div key={i} className="bg-ivory p-5 lg:p-7 flex items-center gap-4">
                <span className="h-11 w-11 grid place-items-center border border-rock/15 text-rock shrink-0">
                  <Ico size={20} />
                </span>
                <div>
                  <div className="font-narrow font-bold uppercase tracking-widest-2 text-sm">{t.label}</div>
                  <div className="text-xs text-rock/55 mt-0.5">{t.sub}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
