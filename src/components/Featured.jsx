import { ArrowRight } from 'lucide-react'
import { useNavigation } from '../context/NavigationContext.jsx'
import SectionHeader from './ui/SectionHeader.jsx'
import ProductCard   from './ui/ProductCard.jsx'
import { MOCK_PRODUCTOS, precioFinal } from '../mocks/data.js'

const FEATURED_PRODUCTS = MOCK_PRODUCTOS.slice(0, 4).map((p) => {
  const pf = precioFinal(p)
  return {
    ...p,
    name:          p.nombre,
    brand:         p.marca,
    image:         p.imagen,
    precioBase:    pf,
    precioAnterior: p.descuento > 0 ? p.precio : null,
    descuentoPct:  0,
  }
})

export default function Featured() {
  const { navigate } = useNavigation()

  return (
    <section className="relative py-20 lg:py-28 bg-ivory text-rock">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <SectionHeader
          number="02" eyebrow="Selección Pro"
          title={<>Equipamiento<br/>destacado</>}
          dark={false}
          action={
            <button onClick={() => navigate('catalogo')}
              className="self-start lg:self-end inline-flex items-center gap-2 font-narrow font-bold uppercase tracking-widest-2 text-sm hover:text-alpenglow link-underline text-rock transition-colors">
              Ver todos los productos
              <ArrowRight size={16} strokeWidth={2.2} />
            </button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 lg:gap-y-12 mt-12 lg:mt-16">
          {FEATURED_PRODUCTS.map((p) => <ProductCard key={p.id} product={p} dark={false} />)}
        </div>
      </div>
    </section>
  )
}
