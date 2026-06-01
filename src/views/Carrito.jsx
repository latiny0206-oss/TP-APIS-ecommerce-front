import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Minus, Plus, Trash2, Tag, X, ArrowRight, ShoppingCart } from 'lucide-react'
import {
  updateQty, removeFromCart, applyCoupon, removeCoupon,
  clearCart, selectCartTotals,
} from '../store/cartSlice.js'
import { navigate }  from '../store/navigationSlice.js'
import { setReturnTo } from '../store/authSlice.js'
import { fmtPrice }  from '../mocks/data.js'
import Button from '../components/ui/Button.jsx'

export default function Carrito() {
  const dispatch     = useDispatch()
  const items        = useSelector((s) => s.cart.items)
  const coupon       = useSelector((s) => s.cart.coupon)
  const couponError  = useSelector((s) => s.cart.couponError)
  const totals       = useSelector(selectCartTotals)
  const isLoggedIn   = useSelector((s) => s.auth.isLoggedIn)
  const [couponInput, setCouponInput] = useState(coupon?.code || '')

  const handleCheckout = () => {
    if (!isLoggedIn) {
      dispatch(setReturnTo('checkout'))
      dispatch(navigate('login'))
      return
    }
    dispatch(navigate('checkout'))
  }

  return (
    <div className="bg-ivory text-rock min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 lg:py-14">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 font-mono text-[11px] tracking-widest-2 uppercase text-rock/55 mb-8">
          <button onClick={() => dispatch(navigate('home'))} className="hover:text-alpenglow transition-colors">
            Inicio
          </button>
          <span className="text-rock/30">›</span>
          <span className="text-rock">Mi carrito</span>
        </nav>

        {/* Header */}
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="font-display font-black tracking-tightest uppercase text-5xl lg:text-7xl leading-[0.9]">
              Mi carrito
            </h1>
            <p className="mt-3 font-mono text-[11px] tracking-widest-2 uppercase text-rock/55">
              {totals.itemCount} {totals.itemCount === 1 ? 'unidad' : 'unidades'}
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={() => dispatch(clearCart())}
              className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest-2 uppercase text-rock/45 hover:text-red-700 transition-colors"
            >
              <Trash2 size={11} /> Vaciar carrito
            </button>
          )}
        </div>

        {/* Carrito vacío */}
        {items.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-rock/20 bg-white">
            <ShoppingCart size={48} strokeWidth={1.2} className="mx-auto text-rock/25 mb-6" />
            <div className="font-display font-black uppercase text-3xl tracking-tightest mb-3">
              Tu carrito está vacío
            </div>
            <p className="text-rock/55 mb-8 max-w-md mx-auto">
              Agregá productos desde el catálogo para empezar tu expedición.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="primary" onClick={() => dispatch(navigate('indumentaria'))}
                iconRight={<ArrowRight size={16} />}>
                Ver indumentaria
              </Button>
              <Button variant="ghost-light" onClick={() => dispatch(navigate('calzado'))}>
                Ver calzado
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_420px] gap-10 lg:gap-16">

            {/* Items */}
            <div className="space-y-3">
              {items.map((line) => (
                <div
                  key={line.lineId}
                  className="flex gap-4 sm:gap-6 items-start bg-white border border-rock/10 p-4"
                >
                  {/* Imagen */}
                  <div
                    className="h-24 w-20 sm:h-32 sm:w-28 overflow-hidden bg-rock-700 shrink-0 cursor-pointer"
                    onClick={() => dispatch(navigate({ view: 'producto', params: { id: line.productId } }))}
                  >
                    {line.imagen && (
                      <img src={line.imagen} alt={line.nombre} className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none' }} />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-narrow font-bold uppercase tracking-tight text-base leading-tight cursor-pointer hover:text-pine transition-colors"
                      onClick={() => dispatch(navigate({ view: 'producto', params: { id: line.productId } }))}
                    >
                      {line.nombre}
                    </h3>
                    {line.talle && (
                      <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 mt-1">
                        Talle: {line.talle}
                      </div>
                    )}
                    <div className="font-display font-black tracking-tightest text-xl mt-2">
                      {fmtPrice(line.precio * line.qty)}
                    </div>
                    {line.qty > 1 && (
                      <div className="font-mono text-[10px] text-rock/45 mt-0.5">
                        {fmtPrice(line.precio)} c/u
                      </div>
                    )}

                    {/* Controles */}
                    <div className="flex items-center gap-4 mt-4">
                      <div className="inline-flex items-center border border-rock/20">
                        <button
                          onClick={() => dispatch(updateQty({ lineId: line.lineId, qty: line.qty - 1 }))}
                          className="h-9 w-9 grid place-items-center text-rock hover:bg-rock/5 transition-colors"
                        >
                          <Minus size={13} strokeWidth={2} />
                        </button>
                        <span className="px-4 font-mono font-bold text-sm tabular-nums">{line.qty}</span>
                        <button
                          onClick={() => dispatch(updateQty({ lineId: line.lineId, qty: line.qty + 1 }))}
                          className="h-9 w-9 grid place-items-center text-rock hover:bg-rock/5 transition-colors"
                        >
                          <Plus size={13} strokeWidth={2} />
                        </button>
                      </div>
                      <button
                        onClick={() => dispatch(removeFromCart(line.lineId))}
                        className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/45 hover:text-red-700 flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 size={11} /> Quitar
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Mobile vaciar */}
              <button
                onClick={() => dispatch(clearCart())}
                className="sm:hidden w-full mt-2 font-mono text-[10px] tracking-widest-2 uppercase text-rock/45 hover:text-red-700 flex items-center justify-center gap-2 py-3 border border-dashed border-rock/15 transition-colors"
              >
                <Trash2 size={11} /> Vaciar carrito
              </button>
            </div>

            {/* Resumen */}
            <aside className="lg:sticky lg:top-24 h-fit bg-rock text-ivory p-7 lg:p-9">
              <div className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow mb-2">
                Resumen
              </div>
              <h2 className="font-display font-black tracking-tightest uppercase text-3xl mb-6">
                Tu pedido
              </h2>

              {/* Cupón */}
              <div className="mb-6 pb-6 border-b border-ivory/15">
                <span className="font-mono text-[10px] tracking-widest-2 uppercase text-ivory/55 block mb-2">
                  Código de descuento
                </span>
                {coupon ? (
                  <div className="flex items-center gap-2 p-3 bg-pine/20 border border-pine/40">
                    <Tag size={14} className="text-pine-300" />
                    <span className="flex-1 font-mono text-xs tracking-widest-2 uppercase text-pine-300">
                      {coupon.label}
                    </span>
                    <button onClick={() => { dispatch(removeCoupon()); setCouponInput('') }}>
                      <X size={14} className="text-ivory/60 hover:text-ivory" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="DESCUENTO10"
                        className="input-base input-dark flex-1 text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && dispatch(applyCoupon(couponInput))}
                      />
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => dispatch(applyCoupon(couponInput))}
                      >
                        Aplicar
                      </Button>
                    </div>
                    {couponError && (
                      <p className="font-mono text-[10px] tracking-widest-2 uppercase text-red-300 mt-2">
                        ⚠ {couponError}
                      </p>
                    )}
                    <p className="font-mono text-[10px] tracking-widest-2 uppercase text-ivory/35 mt-2">
                      Probá: DESCUENTO10 · INVIERNO24
                    </p>
                  </>
                )}
              </div>

              {/* Totales */}
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between text-ivory/75">
                  <span>Subtotal</span>
                  <span className="font-mono">{fmtPrice(totals.subtotal)}</span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-alpenglow">
                    <span>Descuento</span>
                    <span className="font-mono">− {fmtPrice(totals.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-ivory/45">
                  <span>Envío</span>
                  <span className="font-mono">Gratis</span>
                </div>
              </div>

              <div className="flex items-baseline justify-between border-t border-ivory/15 pt-5 mb-7">
                <span className="font-narrow font-bold uppercase tracking-widest-2">Total</span>
                <span className="font-display font-black tracking-tightest text-3xl">
                  {fmtPrice(totals.total)}
                </span>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleCheckout}
                iconRight={<ArrowRight size={16} strokeWidth={2.2} />}
              >
                Ir al checkout
              </Button>
              <Button
                variant="ghost-dark"
                size="md"
                className="w-full mt-3"
                onClick={() => dispatch(navigate('indumentaria'))}
              >
                Continuar comprando
              </Button>
              <p className="mt-4 font-mono text-[10px] tracking-widest-2 uppercase text-ivory/35 text-center">
                Pago seguro · Envío en 48h
              </p>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
