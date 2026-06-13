import { useState } from 'react'
import { ArrowLeft, ShoppingCart, Minus, Plus, Check, X } from 'lucide-react'
import { useNavigation } from '../context/NavigationContext.jsx'
import { useCart }       from '../context/CartContext.jsx'
import { getProductoById, fmtPrice, precioFinal } from '../mocks/data.js'
import Button from '../components/ui/Button.jsx'

const CATEGORIA_LABELS = {
  indumentaria: 'Indumentaria',
  calzado:      'Calzado',
  equipamiento: 'Equipamiento',
}

export default function ProductoDetalle() {
  const { params, navigate } = useNavigation()
  const { addToCart }        = useCart()
  const producto = getProductoById(params.id)

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
          <Button variant="primary" onClick={() => navigate('home')}>
            Volver al inicio
          </Button>
        </div>
      </div>
    )
  }

  const pf     = precioFinal(producto)
  const hayTalles = producto.talles && producto.talles.length > 0 && producto.talles[0] !== 'Único'
  const categoriaLabel = CATEGORIA_LABELS[producto.categoria] || producto.categoria

  const getStockParaTalle = (talle) => {
    if (!hayTalles) return producto.stock
    // Use explicit per-size stock data when available
    if (producto.stockPorTalle) {
      return talle ? (producto.stockPorTalle[talle] ?? 0) : producto.stock
    }
    if (!talle) return producto.stock
    const idx = producto.talles.indexOf(talle)
    const n   = producto.talles.length
    if (n <= 1) return producto.stock
    const mid  = (n - 1) / 2
    const dist = Math.abs(idx - mid)
    const pct  = Math.max(0.15, 1 - (dist / (mid + 1)) * 0.75)
    return Math.max(1, Math.round(producto.stock * pct))
  }

  const stockActual = talleSeleccionado ? getStockParaTalle(talleSeleccionado) : producto.stock

  const handleTalleSelect = (t) => {
    setTalleSeleccionado(t)
    setCantidad(1)
  }

  const handleAgregar = () => {
    if (hayTalles && !talleSeleccionado) return
    addToCart({
      productId: producto.id,
      nombre:    producto.nombre,
      precio:    pf,
      imagen:    producto.imagen,
      talle:     talleSeleccionado ?? (producto.talles?.[0] ?? null),
      qty:       cantidad,
    })
    setAgregado(true)
    setTimeout(() => setAgregado(false), 2000)
  }

  const handleBack = () => {
    const raw = sessionStorage.getItem('catalogoState')
    if (raw) {
      try {
        const saved = JSON.parse(raw)
        navigate(saved.backView || producto.categoria)
        return
      } catch { /* ignore */ }
    }
    navigate(producto.categoria)
  }

  return (
    <div className="min-h-screen bg-ivory text-rock">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 lg:py-14">

        <nav className="flex items-center gap-2 font-mono text-[11px] tracking-widest-2 uppercase text-rock/55 mb-8">
          <button onClick={() => navigate('home')} className="hover:text-alpenglow transition-colors">
            Inicio
          </button>
          <span className="text-rock/30">›</span>
          <button onClick={handleBack} className="hover:text-alpenglow transition-colors">
            {categoriaLabel}
          </button>
          <span className="text-rock/30">›</span>
          <span className="text-rock truncate max-w-[200px]">{producto.nombre}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">

          <div className="relative aspect-[4/5] bg-rock-700 overflow-hidden">
            <img src={producto.imagen} alt={producto.nombre}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none' }} />
            {producto.descuento > 0 && (
              <div className="absolute top-4 right-4 bg-rock text-ivory font-mono text-[11px] tracking-widest-2 uppercase px-3 py-1.5">
                -{producto.descuento}%
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow mb-4">
              {categoriaLabel}
            </div>
            <h1 className="font-display font-black tracking-tightest uppercase text-4xl lg:text-5xl leading-[0.9] mb-6">
              {producto.nombre}
            </h1>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display font-black tracking-tightest text-4xl">{fmtPrice(pf)}</span>
              {producto.descuento > 0 && (
                <>
                  <span className="text-xl text-rock/35 line-through">{fmtPrice(producto.precio)}</span>
                  <span className="font-mono text-xs text-alpenglow bg-alpenglow/15 px-2 py-0.5">
                    Ahorrás {fmtPrice(producto.precio - pf)}
                  </span>
                </>
              )}
            </div>

            <p className="text-rock/70 text-base leading-relaxed mb-8 max-w-prose">
              {producto.descripcion}
            </p>

            {hayTalles && (
              <div className="mb-6">
                <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 mb-3">
                  Talle {talleSeleccionado ? `— ${talleSeleccionado}` : '— Seleccioná uno'}
                </div>
                <div className="flex flex-wrap gap-2">
                  {producto.talles.map((t) => {
                    const stockT  = getStockParaTalle(t)
                    const agotado = stockT === 0
                    return (
                      <button key={t}
                        onClick={() => !agotado && handleTalleSelect(t)}
                        disabled={agotado}
                        title={agotado ? 'Sin stock' : undefined}
                        className={`relative h-10 min-w-[40px] px-3 border font-mono text-xs font-bold tracking-widest-2 transition-all overflow-hidden ${
                          agotado
                            ? 'border-rock/10 text-rock/25 cursor-not-allowed bg-rock/3 select-none'
                            : talleSeleccionado === t
                              ? 'bg-rock text-ivory border-rock'
                              : 'border-rock/20 text-rock hover:border-rock'
                        }`}>
                        <span className={agotado ? 'opacity-40' : ''}>{t}</span>
                        {agotado && (
                          <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <X size={14} strokeWidth={2} className="text-rock/40" />
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
                {!talleSeleccionado && (
                  <p className="font-mono text-[10px] text-alpenglow mt-2 tracking-widest-2 uppercase">
                    Seleccioná un talle para continuar
                  </p>
                )}
              </div>
            )}

            <div className="mb-8">
              <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 mb-3">Cantidad</div>
              <div className="inline-flex items-center border border-rock/20">
                <button onClick={() => setCantidad((q) => Math.max(1, q - 1))}
                  className="h-11 w-11 grid place-items-center text-rock hover:bg-rock/5 transition-colors">
                  <Minus size={14} strokeWidth={2} />
                </button>
                <span className="px-5 font-mono font-bold text-sm tabular-nums w-12 text-center">{cantidad}</span>
                <button onClick={() => setCantidad((q) => Math.min(stockActual, q + 1))}
                  className="h-11 w-11 grid place-items-center text-rock hover:bg-rock/5 transition-colors">
                  <Plus size={14} strokeWidth={2} />
                </button>
              </div>
              {talleSeleccionado && (
                <span className="ml-4 font-mono text-[10px] tracking-widest-2 uppercase text-rock/45">
                  {stockActual} disponibles
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="primary" size="lg" className="flex-1" onClick={handleAgregar}
                disabled={hayTalles && !talleSeleccionado}
                icon={agregado ? <Check size={18} strokeWidth={2.5} /> : <ShoppingCart size={18} strokeWidth={2} />}>
                {agregado ? '¡Agregado!' : 'Agregar al carrito'}
              </Button>
              <Button variant="ghost-light" size="lg" onClick={() => navigate('carrito')}>
                Ver carrito
              </Button>
            </div>

            <div className="mt-8 pt-8 border-t border-rock/10">
              <button onClick={handleBack}
                className="inline-flex items-center gap-2 font-mono text-[11px] tracking-widest-2 uppercase text-rock/55 hover:text-rock transition-colors">
                <ArrowLeft size={12} /> Volver a Productos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
