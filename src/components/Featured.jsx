import { ArrowRight } from 'lucide-react'
import { useNavigation } from '../context/NavigationContext.jsx'
import SectionHeader from './ui/SectionHeader.jsx'
import ProductCard   from './ui/ProductCard.jsx'
import { MOCK_PRODUCTOS, precioFinal } from '../mocks/data.js'

const CUMBRE_PRO_PRODUCTS = MOCK_PRODUCTOS
  .filter((p) => p.marca === 'Cumbre Pro')
  .map((p) => {
    const pf = precioFinal(p)
    return {
      ...p,
      name:           p.nombre,
      brand:          p.marca,
      image:          p.imagen,
      precioBase:     pf,
      precioAnterior: p.descuento > 0 ? p.precio : null,
      descuentoPct:   0,
    }
  })

function navigateCumbrePro(navigate) {
  sessionStorage.setItem('catalogoState', JSON.stringify({
    backView: 'catalogo',
    busqueda: '',
    categorias: [],
    marcas: ['Cumbre Pro'],
    temporadas: [],
    precioMin: 0,
    precioMax: 999999,
  }))
  navigate('catalogo')
}

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
            <button onClick={() => navigateCumbrePro(navigate)}
              className="self-start lg:self-end inline-flex items-center gap-2 font-narrow font-bold uppercase tracking-widest-2 text-sm hover:text-alpenglow link-underline text-rock transition-colors">
              Ver línea Cumbre Pro
              <ArrowRight size={16} strokeWidth={2.2} />
            </button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 lg:gap-y-12 mt-12 lg:mt-16">
          {CUMBRE_PRO_PRODUCTS.map((p) => <ProductCard key={p.id} product={p} dark={false} />)}
        </div>
      </div>
    </section>
  )
}
