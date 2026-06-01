import { useState, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import {
  Search, SlidersHorizontal, X, Check,
  ShoppingCart, Star, ArrowLeft,
} from 'lucide-react'
import { addToCart } from '../store/cartSlice.js'
import { navigate }  from '../store/navigationSlice.js'
import { MOCK_PRODUCTOS, fmtPrice, precioFinal } from '../mocks/data.js'
import Button from '../components/ui/Button.jsx'

// ─── Opciones de filtro derivadas del mock ────────────────────────────────────
const CATEGORIAS_OPTS = [
  { value: 'indumentaria', label: 'Indumentaria' },
  { value: 'calzado',      label: 'Calzado' },
  { value: 'accesorios',   label: 'Accesorios' },
]
const MARCAS_OPTS     = [...new Set(MOCK_PRODUCTOS.map((p) => p.marca))].sort()
const TEMPORADAS_OPTS = ['Invierno', 'Verano', '4 Estaciones']
const PRECIO_GLOBAL_MAX = Math.max(...MOCK_PRODUCTOS.map((p) => precioFinal(p)))

const TITLES = {
  indumentaria: { title: 'Indumentaria', sub: 'Chaquetas, pantalones y capas técnicas' },
  calzado:      { title: 'Calzado',      sub: 'Botas, zapatillas y sandalia de montaña' },
  accesorios:   { title: 'Accesorios',   sub: 'Mochilas, linternas, bastones y más' },
}

// ─── Checkbox con estilo del sitio ────────────────────────────────────────────
function Checkbox({ label, count, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer group py-1.5 select-none">
      <div className="flex items-center gap-2.5">
        <div
          onClick={onChange}
          className={`h-[15px] w-[15px] border flex items-center justify-center shrink-0 transition-colors ${
            checked
              ? 'bg-pine border-pine'
              : 'border-rock/30 group-hover:border-rock'
          }`}
        >
          {checked && <Check size={9} strokeWidth={3.5} className="text-ivory" />}
        </div>
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
        <span
          className={`font-mono text-[11px] tracking-widest-2 uppercase transition-colors ${
            checked ? 'text-rock' : 'text-rock/60'
          }`}
        >
          {label}
        </span>
      </div>
      <span className="font-mono text-[10px] text-rock/35 tabular-nums">{count}</span>
    </label>
  )
}

// ─── Encabezado de sección de filtro ─────────────────────────────────────────
function FilterSection({ title, children }) {
  return (
    <div className="border-t border-rock/10 pt-5">
      <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/45 mb-2">
        {title}
      </div>
      <div>{children}</div>
    </div>
  )
}

// ─── Contenido de filtros (reutilizado en desktop y mobile) ──────────────────
function FilterContent({ state, onReset }) {
  const {
    busqueda, setBusqueda,
    categorias, toggleCategoria,
    marcas,     toggleMarca,
    temporadas, toggleTemporada,
    precioMin,  setPrecioMin,
    precioMax,  setPrecioMax,
    hasActiveFilters,
  } = state

  // Cuenta productos que coincidirían si se activa esa opción,
  // aplicando todos los demás filtros vigentes.
  const countFor = (dimension, value) =>
    MOCK_PRODUCTOS.filter((p) => {
      const cats = dimension === 'categoria'
        ? [value]
        : (categorias.length ? categorias : null)
      if (cats && !cats.includes(p.categoria)) return false

      const mrcs = dimension === 'marca'
        ? [value]
        : (marcas.length ? marcas : null)
      if (mrcs && !mrcs.includes(p.marca)) return false

      const tmps = dimension === 'temporada'
        ? [value]
        : (temporadas.length ? temporadas : null)
      if (tmps && !tmps.includes(p.temporada)) return false

      if (busqueda && !p.nombre.toLowerCase().includes(busqueda.toLowerCase())) return false
      const pf = precioFinal(p)
      return pf >= precioMin && pf <= precioMax
    }).length

  return (
    <div className="space-y-5">

      {/* Buscador */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-rock/40 pointer-events-none"
        />
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar productos..."
          className="input-base w-full pl-9 text-sm"
        />
      </div>

      {/* Categoría */}
      <FilterSection title="Categoría">
        {CATEGORIAS_OPTS.map(({ value, label }) => (
          <Checkbox
            key={value}
            label={label}
            count={countFor('categoria', value)}
            checked={categorias.includes(value)}
            onChange={() => toggleCategoria(value)}
          />
        ))}
      </FilterSection>

      {/* Marca */}
      <FilterSection title="Marca">
        {MARCAS_OPTS.map((m) => (
          <Checkbox
            key={m}
            label={m}
            count={countFor('marca', m)}
            checked={marcas.includes(m)}
            onChange={() => toggleMarca(m)}
          />
        ))}
      </FilterSection>

      {/* Temporada */}
      <FilterSection title="Temporada">
        {TEMPORADAS_OPTS.map((t) => (
          <Checkbox
            key={t}
            label={t}
            count={countFor('temporada', t)}
            checked={temporadas.includes(t)}
            onChange={() => toggleTemporada(t)}
          />
        ))}
      </FilterSection>

      {/* Precio */}
      <FilterSection title="Precio">
        <div className="space-y-3 mt-1">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <div className="font-mono text-[9px] tracking-widest-2 uppercase text-rock/40 mb-1">
                Mínimo
              </div>
              <input
                type="number"
                value={precioMin}
                onChange={(e) =>
                  setPrecioMin(Math.min(Number(e.target.value), precioMax))
                }
                min={0}
                max={precioMax}
                step={5000}
                className="input-base w-full text-sm"
              />
            </div>
            <span className="text-rock/30 pb-3 shrink-0">—</span>
            <div className="flex-1">
              <div className="font-mono text-[9px] tracking-widest-2 uppercase text-rock/40 mb-1">
                Máximo
              </div>
              <input
                type="number"
                value={precioMax}
                onChange={(e) =>
                  setPrecioMax(Math.min(PRECIO_GLOBAL_MAX, Math.max(Number(e.target.value), precioMin)))
                }
                min={precioMin}
                max={PRECIO_GLOBAL_MAX}
                step={5000}
                className="input-base w-full text-sm"
              />
            </div>
          </div>
          <p className="font-mono text-[10px] text-rock/45">
            {fmtPrice(precioMin)} — {fmtPrice(precioMax)}
          </p>
        </div>
      </FilterSection>

      {/* Limpiar filtros */}
      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="w-full mt-2 py-2.5 border border-rock/20 font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 hover:border-rock hover:text-rock transition-colors flex items-center justify-center gap-2"
        >
          <X size={11} /> Limpiar filtros
        </button>
      )}
    </div>
  )
}

// ─── Card de producto ─────────────────────────────────────────────────────────
function ProductoCard({ producto }) {
  const dispatch = useDispatch()
  const pf = precioFinal(producto)

  const handleAdd = (e) => {
    e.stopPropagation()
    dispatch(
      addToCart({
        productId: producto.id,
        nombre:    producto.nombre,
        precio:    pf,
        imagen:    producto.imagen,
        talle:     producto.talles?.[0] ?? null,
      })
    )
  }

  return (
    <article
      className="product-card group flex flex-col cursor-pointer"
      onClick={() =>
        dispatch(navigate({ view: 'producto', params: { id: producto.id } }))
      }
    >
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

      <div className="pt-4 pb-2 flex flex-col gap-1.5 bg-ivory text-rock">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/45">
            {producto.marca}
          </span>
          {producto.talles && producto.talles[0] !== 'Único' && (
            <span className="font-mono text-[10px] text-rock/40">
              {producto.talles.length} talles
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

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Catalogo({ categoria }) {
  const dispatch = useDispatch()
  const { title, sub } = TITLES[categoria] || { title: categoria, sub: '' }

  // ── Estado de filtros ────────────────────────────────────────────────────
  const [busqueda,   setBusqueda]   = useState('')
  const [categorias, setCategorias] = useState([categoria])
  const [marcas,     setMarcas]     = useState([])
  const [temporadas, setTemporadas] = useState([])
  const [precioMin,  setPrecioMin]  = useState(0)
  const [precioMax,  setPrecioMax]  = useState(PRECIO_GLOBAL_MAX)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Toggle genérico (usa updater funcional para evitar closures obsoletos)
  const toggle = (setter) => (value) =>
    setter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )

  const toggleCategoria = toggle(setCategorias)
  const toggleMarca     = toggle(setMarcas)
  const toggleTemporada = toggle(setTemporadas)

  const hasActiveFilters =
    busqueda !== '' ||
    marcas.length > 0 ||
    temporadas.length > 0 ||
    precioMin > 0 ||
    precioMax < PRECIO_GLOBAL_MAX ||
    categorias.length !== 1 ||
    !categorias.includes(categoria)

  const resetFilters = () => {
    setBusqueda('')
    setCategorias([categoria])
    setMarcas([])
    setTemporadas([])
    setPrecioMin(0)
    setPrecioMax(PRECIO_GLOBAL_MAX)
  }

  const filterState = {
    busqueda, setBusqueda,
    categorias, toggleCategoria,
    marcas,     toggleMarca,
    temporadas, toggleTemporada,
    precioMin,  setPrecioMin,
    precioMax,  setPrecioMax,
    hasActiveFilters,
  }

  // ── Productos filtrados ──────────────────────────────────────────────────
  const filtrados = useMemo(
    () =>
      MOCK_PRODUCTOS.filter((p) => {
        if (categorias.length && !categorias.includes(p.categoria)) return false
        if (marcas.length     && !marcas.includes(p.marca))         return false
        if (temporadas.length && !temporadas.includes(p.temporada)) return false
        const pf = precioFinal(p)
        if (pf < precioMin || pf > precioMax) return false
        if (busqueda && !p.nombre.toLowerCase().includes(busqueda.toLowerCase())) return false
        return true
      }),
    [busqueda, categorias, marcas, temporadas, precioMin, precioMax]
  )

  return (
    <div className="bg-ivory text-rock min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 lg:py-14">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 font-mono text-[11px] tracking-widest-2 uppercase text-rock/55 mb-8">
          <button
            onClick={() => dispatch(navigate('home'))}
            className="hover:text-alpenglow transition-colors"
          >
            Inicio
          </button>
          <span className="text-rock/30">›</span>
          <span className="text-rock">{title}</span>
        </nav>

        {/* Header de página */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
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
              {sub}
            </p>
          </div>
          <button
            onClick={() => dispatch(navigate('home'))}
            className="inline-flex items-center gap-2 font-mono text-[11px] tracking-widest-2 uppercase text-rock/55 hover:text-rock transition-colors self-start"
          >
            <ArrowLeft size={12} /> Volver al inicio
          </button>
        </div>

        {/* Layout: sidebar + grid */}
        <div className="flex gap-10 lg:gap-14 items-start">

          {/* ── Sidebar desktop ── */}
          <aside className="hidden lg:block w-56 xl:w-64 shrink-0 sticky top-28">
            <FilterContent state={filterState} onReset={resetFilters} />
          </aside>

          {/* ── Área de resultados ── */}
          <div className="flex-1 min-w-0">

            {/* Barra: conteo + botón filtros mobile */}
            <div className="flex items-center justify-between gap-4 mb-6 pb-5 border-b border-rock/10">
              <p className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/55">
                <span className="font-bold text-rock">{filtrados.length}</span>{' '}
                {filtrados.length === 1 ? 'producto encontrado' : 'productos encontrados'}
              </p>

              {/* Botón filtros — solo mobile */}
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 border border-rock/20 px-4 h-9 font-mono text-[10px] tracking-widest-2 uppercase hover:border-rock transition-colors"
              >
                <SlidersHorizontal size={13} />
                Filtros
                {hasActiveFilters && (
                  <span className="h-4 w-4 rounded-full bg-pine text-ivory text-[9px] grid place-items-center font-bold leading-none">
                    ✓
                  </span>
                )}
              </button>
            </div>

            {/* Grid de productos */}
            {filtrados.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-12">
                {filtrados.map((p) => (
                  <ProductoCard key={p.id} producto={p} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 border border-dashed border-rock/20">
                <p className="font-display font-black tracking-tightest uppercase text-2xl mb-3">
                  Sin resultados
                </p>
                <p className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/45 mb-6">
                  No se encontraron productos con esos filtros
                </p>
                <button
                  onClick={resetFilters}
                  className="font-mono text-[11px] tracking-widest-2 uppercase text-pine hover:underline"
                >
                  Limpiar filtros →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Panel de filtros mobile (bottom sheet) ── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-rock/50 z-40 lg:hidden fadein"
            onClick={() => setMobileOpen(false)}
          />

          {/* Panel */}
          <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-ivory text-rock max-h-[88vh] flex flex-col shadow-2xl fadein">
            {/* Cabecera del panel */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-rock/10 shrink-0">
              <span className="font-display font-black tracking-tightest uppercase text-2xl">
                Filtros
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="h-9 w-9 grid place-items-center border border-rock/15 hover:bg-rock/5 transition-colors"
                aria-label="Cerrar filtros"
              >
                <X size={16} />
              </button>
            </div>

            {/* Contenido scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <FilterContent state={filterState} onReset={resetFilters} />
            </div>

            {/* Botón de aplicar */}
            <div className="px-6 py-4 border-t border-rock/10 shrink-0">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => setMobileOpen(false)}
              >
                Ver {filtrados.length}{' '}
                {filtrados.length === 1 ? 'producto' : 'productos'}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
