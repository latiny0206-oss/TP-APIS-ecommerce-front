import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import SectionHeader from './ui/SectionHeader.jsx'
import ProductCard   from './ui/ProductCard.jsx'
import { useProducts } from '../context/ProductsContext.jsx'

export default function Featured() {
  const navigate      = useNavigate()
  const { ids, byId } = useProducts()

  const cumbrePro = ids
    .map(id => byId[id])
    .filter(p => p.marca?.toLowerCase() === 'cumbre pro')
    .slice(0, 3)

  // Mientras carga o si no hay productos Cumbre Pro, muestra 3 skeletons
  const showSkeletons = cumbrePro.length === 0

  return (
    <section className="relative py-20 lg:py-28 bg-ivory text-rock">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <SectionHeader
          number="02" eyebrow="Selección Pro"
          title={<>Equipamiento<br/>destacado</>}
          dark={false}
          action={
            <button onClick={() => navigate('/catalogo?marca=Cumbre+Pro')}
              className="self-start lg:self-end inline-flex items-center gap-2 font-narrow font-bold uppercase tracking-widest-2 text-sm hover:text-alpenglow link-underline text-rock transition-colors">
              Ver línea Cumbre Pro
              <ArrowRight size={16} strokeWidth={2.2} />
            </button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 lg:gap-y-12 mt-12 lg:mt-16">
          {showSkeletons
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="aspect-[4/5] bg-rock/10 animate-pulse" />
                  <div className="h-3 w-20 bg-rock/10 animate-pulse" />
                  <div className="h-4 w-40 bg-rock/10 animate-pulse" />
                  <div className="h-4 w-24 bg-rock/10 animate-pulse" />
                </div>
              ))
            : cumbrePro.map(p => (
                <ProductCard key={p.id} product={p} dark={false} />
              ))
          }
        </div>
      </div>
    </section>
  )
}
