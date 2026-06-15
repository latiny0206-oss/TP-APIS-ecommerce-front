import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Search, SlidersHorizontal, X, Check, ArrowRight, ArrowLeft,
} from 'lucide-react'
import { useProducts } from '../context/ProductsContext.jsx'
import { fmtPrice }    from '../utils/format.js'
import Button from '../components/ui/Button.jsx'

const CATEGORIAS_OPTS = [
  { value: 'indumentaria', label: 'Indumentaria' },
  { value: 'calzado',      label: 'Calzado' },
  { value: 'equipamiento', label: 'Equipamiento' },
]
const TEMPORADAS_OPTS = ['Invierno', 'Verano', '4 Estaciones']

function Checkbox({ label, count, checked, onChange }) {
  return (
    <label
      onClick={onChange}
      className="flex items-center justify-between gap-3 cursor-pointer group py-1.5 select-none"
    >
      <div className="flex items-center gap-2.5">
        <div className={`h-[15px] w-[15px] border flex items-center justify-center shrink-0 transition-colors ${
          checked ? 'bg-pine border-pine' : 'border-rock/30 group-hover:border-rock'
        }`}>
          {checked && <Check size={9} strokeWidth={3.5} className="text-ivory" />}
        </div>
        <span className={`font-mono text-[11px] tracking-widest-2 uppercase transition-colors ${checked ? 'text-rock' : 'text-rock/60'}`}>
          {label}
        </span>
      </div>
      <span className="font-mono text-[10px] text-rock/35 tabular-nums">{count}</span>
    </label>
  )
}

function FilterSection({ title, children }) {
  return (
    <div className="border-t border-rock/10 pt-5">
      <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/45 mb-2">{title}</div>
      <div>{children}</div>
    </div>
  )
}

function FilterContent({ state, onReset, productos }) {
  const {
    busqueda, setBusqueda, categorias, toggleCategoria,
    marcas, toggleMarca, temporadas, toggleTemporada,
    precioMin, setPrecioMin, precioMax, setPrecioMax,
    precioGlobalMax, hasActiveFilters,
  } = state

  const [inputMin, setInputMin] = useState(String(precioMin))
  const [inputMax, setInputMax] = useState(String(precioMax))

  useEffect(() => { setInputMin(String(precioMin)) }, [precioMin])
  useEffect(() => { setInputMax(String(precioMax)) }, [precioMax])

  const MARCAS_OPTS = [...new Set(productos.map((p) => p.marca))].filter(Boolean).sort()

  const countFor = (dimension, value) =>
    productos.filter((p) => {
      const cats = dimension === 'categoria' ? [value] : (categorias.length ? categorias : null)
      if (cats && !cats.includes(p.categoria)) return false
      const mrcs = dimension === 'marca' ? [value] : (marcas.length ? marcas : null)
      if (mrcs && !mrcs.includes(p.marca)) return false
      const tmps = dimension === 'temporada' ? [value] : (temporadas.length ? temporadas : null)
      if (tmps && !tmps.includes(p.temporada)) return false
      if (busqueda && !p.nombre.toLowerCase().includes(busqueda.toLowerCase())) return false
      const pf = p.precioFinal ?? p.precio
      return pf >= precioMin && pf <= precioMax
    }).length

  return (
    <div className="space-y-5">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-rock/40 pointer-events-none" />
        <input type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar productos..." className="input-base w-full pl-9 text-sm" />
      </div>

      <FilterSection title="Categoría">
        {CATEGORIAS_OPTS.map(({ value, label }) => (
          <Checkbox key={value} label={label} count={countFor('categoria', value)}
            checked={categorias.includes(value)} onChange={() => toggleCategoria(value)} />
        ))}
      </FilterSection>

      <FilterSection title="Marca">
        {MARCAS_OPTS.map((m) => (
          <Checkbox key={m} label={m} count={countFor('marca', m)}
            checked={marcas.includes(m)} onChange={() => toggleMarca(m)} />
        ))}
      </FilterSection>

      <FilterSection title="Temporada">
        {TEMPORADAS_OPTS.map((t) => (
          <Checkbox key={t} label={t} count={countFor('temporada', t)}
            checked={temporadas.includes(t)} onChange={() => toggleTemporada(t)} />
        ))}
      </FilterSection>

      <FilterSection title="Precio">
        <div className="space-y-3 mt-1">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <div className="font-mono text-[9px] tracking-widest-2 uppercase text-rock/40 mb-1">Mínimo</div>
              <input type="number" value={inputMin}
                onChange={(e) => setInputMin(e.target.value)}
                onBlur={() => {
                  const clamped = Math.min(Math.max(parseInt(inputMin) || 0, 0), precioMax)
                  setPrecioMin(clamped); setInputMin(String(clamped))
                }}
                min={0} max={precioMax} step={5000} className="input-base w-full text-sm" />
            </div>
            <span className="text-rock/30 pb-3 shrink-0">—</span>
            <div className="flex-1">
              <div className="font-mono text-[9px] tracking-widest-2 uppercase text-rock/40 mb-1">Máximo</div>
              <input type="number" value={inputMax}
                onChange={(e) => setInputMax(e.target.value)}
                onBlur={() => {
                  const clamped = Math.min(Math.max(parseInt(inputMax) || 0, precioMin), precioGlobalMax)
                  setPrecioMax(clamped); setInputMax(String(clamped))
                }}
                min={precioMin} max={precioGlobalMax} step={5000} className="input-base w-full text-sm" />
            </div>
          </div>
          <p className="font-mono text-[10px] text-rock/45">
            {fmtPrice(precioMin)} — {fmtPrice(precioMax)}
          </p>
        </div>
      </FilterSection>

      {hasActiveFilters && (
        <button onClick={onReset}
          className="w-full mt-2 py-2.5 border border-rock/20 font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 hover:border-rock hover:text-rock transition-colors flex items-center justify-center gap-2">
          <X size={11} /> Limpiar filtros
        </button>
      )}
    </div>
  )
}

function ProductoCard({ producto, onNavigate }) {
  const pf = producto.precioFinal ?? producto.precio
  return (
    <article className="product-card group flex flex-col cursor-pointer" onClick={() => onNavigate(producto.id)}>
      <div className="relative aspect-[4/5] overflow-hidden bg-rock-700">
        {producto.imagen ? (
          <img src={producto.imagen} alt={producto.nombre}
            className="product-img absolute inset-0 w-full h-full object-cover opacity-95"
            onError={(e) => { e.currentTarget.style.display = 'none' }} />
        ) : (
          <div className="absolute inset-0 bg-rock/10 flex items-center justify-center">
            <span className="font-mono text-[10px] text-rock/30 tracking-widest-2 uppercase">Sin foto</span>
          </div>
        )}
        {producto.tag && (
          <div className="absolute top-3 left-3 z-10">
            <span className="font-mono text-[10px] tracking-widest-2 uppercase px-2 py-1 bg-alpenglow text-ivory">
              {producto.tag}
            </span>
          </div>
        )}
        {(producto.descuento ?? producto.descuentoPct ?? 0) > 0 && (
          <div className="absolute top-3 right-3 z-10">
            <span className="font-mono text-[10px] tracking-widest-2 uppercase px-2 py-1 bg-rock text-ivory">
              -{producto.descuento ?? producto.descuentoPct}%
            </span>
          </div>
        )}
        <button onClick={(e) => { e.stopPropagation(); onNavigate(producto.id) }}
          className="absolute left-3 right-3 bottom-3 z-10 py-3 bg-ivory hover:bg-pine hover:text-ivory text-rock font-narrow font-bold uppercase tracking-widest-2 text-xs transition-all translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 flex items-center justify-center gap-2">
          <ArrowRight size={14} strokeWidth={2} /> Ver más
        </button>
      </div>

      <div className="pt-4 pb-2 flex flex-col gap-1.5 bg-ivory text-rock">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/45">{producto.marca}</span>
          {producto.talles && producto.talles[0] !== 'Único' && (
            <span className="font-mono text-[10px] text-rock/40">{producto.talles.length} talles</span>
          )}
        </div>
        <h3 className="font-narrow font-bold uppercase tracking-tight text-base leading-tight text-rock">
          {producto.nombre}
        </h3>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-display font-black tracking-tightest text-lg text-rock">{fmtPrice(pf)}</span>
          {(producto.descuento ?? producto.descuentoPct ?? 0) > 0 && (
            <span className="text-xs line-through text-rock/40">{fmtPrice(producto.precio ?? producto.precioBase)}</span>
          )}
        </div>
      </div>
    </article>
  )
}

export default function Catalogo() {
  const navigate                        = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const { ids, byId, loading: loadingData, error: loadError, reload } = useProducts()
  const productos = ids.map(id => byId[id])

  const precioGlobalMax = useMemo(
    () => Math.max(0, ...productos.map((p) => p.precioFinal ?? p.precio)),
    [productos]
  )

  // Filtros en URL
  const categorias = searchParams.getAll('categoria')
  const marcas     = searchParams.getAll('marca')
  const temporadas = searchParams.getAll('temporada')
  const busqueda   = searchParams.get('q') ?? ''
  const [precioMin, setPrecioMin] = useState(0)
  const [precioMax, setPrecioMax] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Sincroniza precioMax con el máximo real
  useEffect(() => {
    if (precioGlobalMax > 0 && precioMax === 0) setPrecioMax(precioGlobalMax)
  }, [precioGlobalMax]) // eslint-disable-line

  const toggleItem = (key, value) => {
    const current = searchParams.getAll(key)
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    const params = new URLSearchParams(searchParams)
    params.delete(key)
    next.forEach((v) => params.append(key, v))
    setSearchParams(params, { replace: true })
  }

  const setBusqueda = (value) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set('q', value); else params.delete('q')
    setSearchParams(params, { replace: true })
  }

  const hasActiveFilters =
    busqueda !== '' || categorias.length > 0 || marcas.length > 0 ||
    temporadas.length > 0 || precioMin > 0 || precioMax < precioGlobalMax

  const resetFilters = () => {
    setSearchParams({}, { replace: true })
    setPrecioMin(0)
    setPrecioMax(precioGlobalMax)
  }

  const filterState = {
    busqueda, setBusqueda,
    categorias, toggleCategoria: (v) => toggleItem('categoria', v),
    marcas,     toggleMarca:     (v) => toggleItem('marca', v),
    temporadas, toggleTemporada: (v) => toggleItem('temporada', v),
    precioMin, setPrecioMin, precioMax, setPrecioMax,
    precioGlobalMax, hasActiveFilters,
  }

  const filtrados = useMemo(
    () => productos.filter((p) => {
      if (categorias.length && !categorias.includes(p.categoria)) return false
      if (marcas.length     && !marcas.includes(p.marca))         return false
      if (temporadas.length && !temporadas.includes(p.temporada)) return false
      const pf = p.precioFinal ?? p.precio
      if (pf < precioMin || (precioMax > 0 && pf > precioMax)) return false
      if (busqueda && !p.nombre.toLowerCase().includes(busqueda.toLowerCase())) return false
      return true
    }),
    [busqueda, categorias, marcas, temporadas, precioMin, precioMax, productos]
  )

  const breadcrumbLabel =
    categorias.length === 1
      ? ({ indumentaria: 'Indumentaria', calzado: 'Calzado', equipamiento: 'Equipamiento' }[categorias[0]] || 'Catálogo')
      : 'Catálogo'

  return (
    <div className="bg-ivory text-rock min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 lg:py-14">

        <nav className="flex items-center gap-2 font-mono text-[11px] tracking-widest-2 uppercase text-rock/55 mb-8">
          <Link to="/" className="hover:text-alpenglow transition-colors">Inicio</Link>
          <span className="text-rock/30">›</span>
          <span className="text-rock">{breadcrumbLabel}</span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow">Catálogo</span>
              <span className="h-px w-12 bg-rock/20" />
            </div>
            <h1 className="font-display font-black tracking-tightest uppercase text-5xl lg:text-7xl leading-[0.9]">
              PRODUCTOS
            </h1>
          </div>
          <Link to="/"
            className="inline-flex items-center gap-2 font-mono text-[11px] tracking-widest-2 uppercase text-rock/55 hover:text-rock transition-colors self-start">
            <ArrowLeft size={12} /> Volver al inicio
          </Link>
        </div>

        <div className="flex gap-10 lg:gap-14 items-start">

          <aside className="hidden lg:block w-56 xl:w-64 shrink-0 sticky top-28">
            <FilterContent state={filterState} onReset={resetFilters} productos={productos} />
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4 mb-6 pb-5 border-b border-rock/10">
              <p className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/55">
                {loadingData ? (
                  'Cargando…'
                ) : (
                  <><span className="font-bold text-rock">{filtrados.length}</span>{' '}
                  {filtrados.length === 1 ? 'producto encontrado' : 'productos encontrados'}</>
                )}
              </p>
              <button onClick={() => setMobileOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 border border-rock/20 px-4 h-9 font-mono text-[10px] tracking-widest-2 uppercase hover:border-rock transition-colors">
                <SlidersHorizontal size={13} /> Filtros
                {hasActiveFilters && (
                  <span className="h-4 w-4 rounded-full bg-pine text-ivory text-[9px] grid place-items-center font-bold leading-none">✓</span>
                )}
              </button>
            </div>

            {loadingData ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-12">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[4/5] bg-rock/10 animate-pulse" />
                ))}
              </div>
            ) : loadError ? (
              <div className="border border-red-200 bg-red-50 p-10 text-center">
                <p className="font-mono text-[11px] tracking-widest-2 uppercase text-red-700 mb-4">
                  {loadError}
                </p>
                <button
                  onClick={reload}
                  className="font-mono text-[11px] tracking-widest-2 uppercase text-pine hover:underline"
                >
                  Reintentar →
                </button>
              </div>
            ) : filtrados.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-12">
                {filtrados.map((p) => (
                  <ProductoCard key={p.id} producto={p}
                    onNavigate={(id) => navigate(`/producto/${id}`, { state: { from: 'catalogo' } })} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 border border-dashed border-rock/20">
                <p className="font-display font-black tracking-tightest uppercase text-2xl mb-3">Sin resultados</p>
                <p className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/45 mb-6">
                  No se encontraron productos con esos filtros
                </p>
                <button onClick={resetFilters}
                  className="font-mono text-[11px] tracking-widest-2 uppercase text-pine hover:underline">
                  Limpiar filtros →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-rock/50 z-40 lg:hidden fadein" onClick={() => setMobileOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-ivory text-rock max-h-[88vh] flex flex-col shadow-2xl fadein">
            <div className="flex items-center justify-between px-6 py-4 border-b border-rock/10 shrink-0">
              <span className="font-display font-black tracking-tightest uppercase text-2xl">Filtros</span>
              <button onClick={() => setMobileOpen(false)}
                className="h-9 w-9 grid place-items-center border border-rock/15 hover:bg-rock/5 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <FilterContent state={filterState} onReset={resetFilters} productos={productos} />
            </div>
            <div className="px-6 py-4 border-t border-rock/10 shrink-0">
              <Button variant="primary" size="lg" className="w-full" onClick={() => setMobileOpen(false)}>
                Ver {filtrados.length}{' '}{filtrados.length === 1 ? 'producto' : 'productos'}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
