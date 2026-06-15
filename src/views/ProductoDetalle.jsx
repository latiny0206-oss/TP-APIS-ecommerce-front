import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, Minus, Plus, Check, X } from 'lucide-react'
import { useCart }         from '../context/CartContext.jsx'
import { productService }  from '../api/productService.js'
import { fmtPrice }        from '../utils/format.js'
import Button from '../components/ui/Button.jsx'

const CATEGORIA_LABELS = {
  indumentaria: 'Indumentaria',
  calzado:      'Calzado',
  equipamiento: 'Equipamiento',
}

export default function ProductoDetalle() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { id }    = useParams()
  const { addToCart } = useCart()

  const [producto, setProducto] = useState(null)
  const [fotos,    setFotos]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [talleSeleccionado, setTalleSeleccionado] = useState(null)
  const [cantidad,  setCantidad]  = useState(1)
  const [agregado,  setAgregado]  = useState(false)

  const handleVolver = () => {
    if (location.state?.from === 'catalogo') navigate(-1)
    else navigate('/catalogo')
  }

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    Promise.all([
      productService.getProducto(id),
      productService.getVariantes(),
    ]).then(async ([raw, allVariantes]) => {
      const variantes = allVariantes.filter(
        (v) => (v.idProducto ?? v.productoId) === raw.id
      )
      const p = productService.normalizeProducto(raw, variantes)
      setProducto(p)

      // Carga las fotos de la primera variante disponible
      if (variantes.length > 0) {
        try {
          const fs = await productService.getFotosByVariante(variantes[0].id)
          setFotos(fs)
        } catch { /* sin fotos */ }
      }
    }).catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center text-rock">
        <span className="spinner" />
      </div>
    )
  }

  if (notFound || !producto) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center text-rock">
        <div className="text-center">
          <p className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/55 mb-4">
            Producto no encontrado
          </p>
          <Button variant="primary" onClick={() => navigate('/')}>Volver al inicio</Button>
        </div>
      </div>
    )
  }

  const pf              = producto.precioFinal ?? producto.precio
  const hayTalles       = producto.talles && producto.talles.length > 0 && producto.talles[0] !== 'Único'
  const categoriaLabel  = CATEGORIA_LABELS[producto.categoria] || producto.categoria
  const primeraFoto     = fotos[0]
  const imagenSrc       = primeraFoto
    ? productService.buildImageSrc(primeraFoto)
    : producto.imagen

  const getStockParaTalle = (talle) => {
    if (!hayTalles) return producto.stock
    if (producto.stockPorTalle) return producto.stockPorTalle[talle] ?? 0
    const v = producto._variantes?.find((v) => (v.talla ?? v.talle) === talle)
    return v?.stock ?? 0
  }

  const stockActual = talleSeleccionado
    ? getStockParaTalle(talleSeleccionado)
    : producto.stock

  const varianteSeleccionada = talleSeleccionado
    ? producto._variantes?.find((v) => (v.talla ?? v.talle) === talleSeleccionado)
    : producto._variantes?.[0]

  const handleAgregar = () => {
    if (hayTalles && !talleSeleccionado) return
    addToCart({
      productId:  producto.id,
      varianteId: varianteSeleccionada?.id ?? null,
      nombre:     producto.nombre,
      precio:     pf,
      imagen:     imagenSrc,
      talle:      talleSeleccionado ?? (producto.talles?.[0] ?? null),
      qty:        cantidad,
    })
    setAgregado(true)
    setTimeout(() => setAgregado(false), 2000)
  }

  return (
    <div className="min-h-screen bg-ivory text-rock">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 lg:py-14">

        <nav className="flex items-center gap-2 font-mono text-[11px] tracking-widest-2 uppercase text-rock/55 mb-8">
          <Link to="/" className="hover:text-alpenglow transition-colors">Inicio</Link>
          <span className="text-rock/30">›</span>
          <button onClick={handleVolver} className="hover:text-alpenglow transition-colors">
            {categoriaLabel}
          </button>
          <span className="text-rock/30">›</span>
          <span className="text-rock truncate max-w-[200px]">{producto.nombre}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">

          {/* Imagen */}
          <div className="relative aspect-[4/5] bg-rock-700 overflow-hidden">
            {imagenSrc ? (
              <img src={imagenSrc} alt={producto.nombre}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none' }} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-[10px] text-rock/30 tracking-widest-2 uppercase">Sin foto</span>
              </div>
            )}
            {(producto.descuento ?? producto.descuentoPct ?? 0) > 0 && (
              <div className="absolute top-4 right-4 bg-rock text-ivory font-mono text-[11px] tracking-widest-2 uppercase px-3 py-1.5">
                -{producto.descuento ?? producto.descuentoPct}%
              </div>
            )}
            {/* Galería adicional */}
            {fotos.length > 1 && (
              <div className="absolute bottom-3 left-3 flex gap-1.5">
                {fotos.slice(1, 4).map((f, i) => (
                  <img key={i} src={productService.buildImageSrc(f)} alt=""
                    className="h-14 w-14 object-cover border-2 border-ivory/60 cursor-pointer hover:border-ivory"
                    onClick={() => setFotos([f, ...fotos.filter((_, j) => j !== i + 1)])} />
                ))}
              </div>
            )}
          </div>

          {/* Detalle */}
          <div className="flex flex-col">
            <div className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow mb-4">
              {categoriaLabel}
            </div>
            <h1 className="font-display font-black tracking-tightest uppercase text-4xl lg:text-5xl leading-[0.9] mb-6">
              {producto.nombre}
            </h1>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display font-black tracking-tightest text-4xl">{fmtPrice(pf)}</span>
              {(producto.descuento ?? producto.descuentoPct ?? 0) > 0 && (
                <>
                  <span className="text-xl text-rock/35 line-through">{fmtPrice(producto.precio ?? producto.precioBase)}</span>
                  <span className="font-mono text-xs text-alpenglow bg-alpenglow/15 px-2 py-0.5">
                    Ahorrás {fmtPrice((producto.precio ?? producto.precioBase) - pf)}
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
                        onClick={() => !agotado && (setTalleSeleccionado(t), setCantidad(1))}
                        disabled={agotado}
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
                <button onClick={() => setCantidad((q) => Math.min(stockActual || 99, q + 1))}
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
              <Button variant="ghost-light" size="lg" onClick={() => navigate('/carrito')}>
                Ver carrito
              </Button>
            </div>

            <div className="mt-8 pt-8 border-t border-rock/10">
              <button onClick={handleVolver}
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
