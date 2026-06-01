import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeft, ShoppingCart, Minus, Plus, Check } from 'lucide-react'
import { navigate }   from '../store/navigationSlice.js'
import { addToCart }  from '../store/cartSlice.js'
import { getProductoById, fmtPrice, precioFinal } from '../mocks/data.js'
import Button from '../components/ui/Button.jsx'

const CATEGORIA_LABELS = {
  indumentaria: 'Indumentaria',
  calzado:      'Calzado',
  accesorios:   'Accesorios',
}

export default function ProductoDetalle() {
  const dispatch   = useDispatch()
  const params     = useSelector((s) => s.navigation.params)
  const producto   = getProductoById(params.id)

  const [talleSeleccionado, setTalleSeleccionado] = useState(null)
  const [cantidad, setCantidad] = useState(1)
  const [agregado, setAgregado] = useState(false)

  if (!producto) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center text-rock">
        <div className="text-center">
          <p className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/55 mb-4">
            Producto no encontrado
          </p>
          <Button variant="primary" onClick={() => dispatch(navigate('home'))}>
            Volver al inicio
          </Button>
        </div>
      </div>
    )
  }

  const pf     = precioFinal(producto)
  const hayTalles = producto.talles && producto.talles.length > 0 && producto.talles[0] !== 'Único'
  const categoriaLabel = CATEGORIA_LABELS[producto.categoria] || producto.categoria

  const handleAgregar = () => {
    if (hayTalles && !talleSeleccionado) return
    dispatch(
      addToCart({
        productId: producto.id,
        nombre:    producto.nombre,
        precio:    pf,
        imagen:    producto.imagen,
        talle:     talleSeleccionado ?? (producto.talles?.[0] ?? null),
      })
    )
    setAgregado(true)
    setTimeout(() => setAgregado(false), 2000)
  }

  return (
    <div className="min-h-screen bg-ivory text-rock">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 lg:py-14">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 font-mono text-[11px] tracking-widest-2 uppercase text-rock/55 mb-8">
          <button onClick={() => dispatch(navigate('home'))} className="hover:text-alpenglow transition-colors">
            Inicio
          </button>
          <span className="text-rock/30">›</span>
          <button
            onClick={() => dispatch(navigate(producto.categoria))}
            className="hover:text-alpenglow transition-colors"
          >
            {categoriaLabel}
          </button>
          <span className="text-rock/30">›</span>
          <span className="text-rock truncate max-w-[200px]">{producto.nombre}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">

          {/* ── Imagen ── */}
          <div className="relative aspect-[4/5] bg-rock-700 overflow-hidden">
            <img
              src={producto.imagen}
              alt={producto.nombre}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
            {producto.descuento > 0 && (
              <div className="absolute top-4 right-4 bg-rock text-ivory font-mono text-[11px] tracking-widest-2 uppercase px-3 py-1.5">
                -{producto.descuento}%
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div className="flex flex-col">

            {/* Categoría */}
            <div className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow mb-4">
              {categoriaLabel}
            </div>

            {/* Nombre */}
            <h1 className="font-display font-black tracking-tightest uppercase text-4xl lg:text-5xl leading-[0.9] mb-6">
              {producto.nombre}
            </h1>

            {/* Precio */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display font-black tracking-tightest text-4xl">
                {fmtPrice(pf)}
              </span>
              {producto.descuento > 0 && (
                <>
                  <span className="text-xl text-rock/35 line-through">{fmtPrice(producto.precio)}</span>
                  <span className="font-mono text-xs text-alpenglow bg-alpenglow/15 px-2 py-0.5">
                    Ahorrás {fmtPrice(producto.precio - pf)}
                  </span>
                </>
              )}
            </div>

            {/* Descripción */}
            <p className="text-rock/70 text-base leading-relaxed mb-8 max-w-prose">
              {producto.descripcion}
            </p>

            {/* Selector de talle */}
            {hayTalles && (
              <div className="mb-6">
                <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 mb-3">
                  Talle {talleSeleccionado ? `— ${talleSeleccionado}` : '— Seleccioná uno'}
                </div>
                <div className="flex flex-wrap gap-2">
                  {producto.talles.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTalleSeleccionado(t)}
                      className={`h-10 min-w-[40px] px-3 border font-mono text-xs font-bold tracking-widest-2 transition-all ${
                        talleSeleccionado === t
                          ? 'bg-rock text-ivory border-rock'
                          : 'border-rock/20 text-rock hover:border-rock'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {hayTalles && !talleSeleccionado && (
                  <p className="font-mono text-[10px] text-alpenglow mt-2 tracking-widest-2 uppercase">
                    Seleccioná un talle para continuar
                  </p>
                )}
              </div>
            )}

            {/* Cantidad */}
            <div className="mb-8">
              <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 mb-3">
                Cantidad
              </div>
              <div className="inline-flex items-center border border-rock/20">
                <button
                  onClick={() => setCantidad((q) => Math.max(1, q - 1))}
                  className="h-11 w-11 grid place-items-center text-rock hover:bg-rock/5 transition-colors"
                >
                  <Minus size={14} strokeWidth={2} />
                </button>
                <span className="px-5 font-mono font-bold text-sm tabular-nums w-12 text-center">
                  {cantidad}
                </span>
                <button
                  onClick={() => setCantidad((q) => Math.min(producto.stock, q + 1))}
                  className="h-11 w-11 grid place-items-center text-rock hover:bg-rock/5 transition-colors"
                >
                  <Plus size={14} strokeWidth={2} />
                </button>
              </div>
              <span className="ml-4 font-mono text-[10px] tracking-widest-2 uppercase text-rock/45">
                {producto.stock} disponibles
              </span>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={handleAgregar}
                disabled={hayTalles && !talleSeleccionado}
                icon={
                  agregado
                    ? <Check size={18} strokeWidth={2.5} />
                    : <ShoppingCart size={18} strokeWidth={2} />
                }
              >
                {agregado ? '¡Agregado!' : 'Agregar al carrito'}
              </Button>
              <Button
                variant="ghost-light"
                size="lg"
                onClick={() => dispatch(navigate('carrito'))}
              >
                Ver carrito
              </Button>
            </div>

            {/* Separator */}
            <div className="mt-8 pt-8 border-t border-rock/10">
              <button
                onClick={() => dispatch(navigate(producto.categoria))}
                className="inline-flex items-center gap-2 font-mono text-[11px] tracking-widest-2 uppercase text-rock/55 hover:text-rock transition-colors"
              >
                <ArrowLeft size={12} /> Volver a {categoriaLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
