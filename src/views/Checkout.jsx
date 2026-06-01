import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  ArrowLeft, ArrowRight, Check, CreditCard, Landmark, Wallet, ChevronRight,
} from 'lucide-react'
import { navigate }  from '../store/navigationSlice.js'
import { clearCart, selectCartTotals } from '../store/cartSlice.js'
import { fmtPrice }  from '../mocks/data.js'
import Button from '../components/ui/Button.jsx'

// ─── Stepper indicator ───────────────────────────────────────────────────────
function Stepper({ step }) {
  const steps = ['Envío', 'Pago', 'Confirmación']
  return (
    <div className="flex items-center gap-0 mb-10">
      {steps.map((label, i) => {
        const n = i + 1
        const active = step === n
        const done   = step > n
        return (
          <div key={label} className="flex items-center">
            <div className="flex items-center gap-2">
              <span className={`h-8 w-8 grid place-items-center font-mono font-bold text-sm transition-all ${
                done   ? 'bg-pine text-ivory'
                : active ? 'bg-rock text-ivory'
                         : 'bg-rock/15 text-rock/40'
              }`}>
                {done ? <Check size={14} strokeWidth={2.5} /> : n}
              </span>
              <span className={`font-mono text-[11px] tracking-widest-2 uppercase transition-colors ${
                active ? 'text-rock' : 'text-rock/40'
              }`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <ChevronRight size={14} className="mx-3 text-rock/20" />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Label({ children }) {
  return (
    <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 block mb-1.5">
      {children}
    </span>
  )
}

function TInput({ error, ...props }) {
  return (
    <div>
      <input {...props} className="input-base w-full" />
      {error && <p className="font-mono text-[10px] text-red-600 mt-1">{error}</p>}
    </div>
  )
}

function Section({ eyebrow, title, children }) {
  return (
    <section className="mb-8">
      <div className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow mb-2">{eyebrow}</div>
      <h2 className="font-display font-black tracking-tightest uppercase text-3xl mb-6">{title}</h2>
      {children}
    </section>
  )
}

// ─── Formatters ───────────────────────────────────────────────────────────────
const fmtCard  = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
const fmtExp   = (v) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length >= 3 ? d.slice(0,2)+'/'+d.slice(2) : d }

// ─── Validaciones ────────────────────────────────────────────────────────────
function validateShip(s) {
  const e = {}
  if (!s.nombre.trim())    e.nombre  = 'Requerido'
  if (!s.direccion.trim()) e.direccion = 'Requerido'
  if (!s.ciudad.trim())    e.ciudad  = 'Requerido'
  if (!s.provincia.trim()) e.provincia = 'Requerido'
  if (!s.cp.trim())        e.cp      = 'Requerido'
  if (!s.telefono.trim())  e.telefono = 'Requerido'
  return e
}

function validateCard(c) {
  const e = {}
  const d = c.numero.replace(/\s/g, '')
  if (!/^\d{16}$/.test(d))            e.numero    = '16 dígitos requeridos'
  if (!c.titular.trim())              e.titular   = 'Requerido'
  if (!/^\d{2}\/\d{2}$/.test(c.exp)) e.exp       = 'Formato MM/AA'
  if (!/^\d{3,4}$/.test(c.cvv))      e.cvv       = 'CVV inválido'
  return e
}

// ─── Resumen lateral ─────────────────────────────────────────────────────────
function OrderSummary({ items, totals, coupon }) {
  return (
    <aside className="lg:sticky lg:top-24 h-fit bg-rock text-ivory p-7 lg:p-9">
      <div className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow mb-2">Resumen</div>
      <h2 className="font-display font-black tracking-tightest uppercase text-3xl mb-6">
        {totals.itemCount} {totals.itemCount === 1 ? 'producto' : 'productos'}
      </h2>
      <ul className="space-y-3 mb-6 max-h-60 overflow-auto no-scrollbar">
        {items.map((line) => (
          <li key={line.lineId} className="flex gap-3 pb-3 border-b border-ivory/10">
            <div className="flex-1 min-w-0">
              <div className="font-narrow font-bold uppercase tracking-tight text-sm leading-tight">{line.nombre}</div>
              {line.talle && (
                <div className="font-mono text-[10px] text-ivory/40 mt-0.5">Talle: {line.talle} · ×{line.qty}</div>
              )}
            </div>
            <span className="font-mono text-sm whitespace-nowrap">{fmtPrice(line.precio * line.qty)}</span>
          </li>
        ))}
      </ul>
      <div className="space-y-2 mb-5 border-t border-ivory/15 pt-5 text-sm">
        <div className="flex justify-between text-ivory/75"><span>Subtotal</span><span className="font-mono">{fmtPrice(totals.subtotal)}</span></div>
        {totals.discount > 0 && (
          <div className="flex justify-between text-alpenglow"><span>Descuento {coupon?.code}</span><span className="font-mono">−{fmtPrice(totals.discount)}</span></div>
        )}
        <div className="flex justify-between text-ivory/40"><span>Envío</span><span className="font-mono">Gratis</span></div>
      </div>
      <div className="flex items-baseline justify-between border-t border-ivory/15 pt-4">
        <span className="font-narrow font-bold uppercase tracking-widest-2">Total</span>
        <span className="font-display font-black tracking-tightest text-3xl">{fmtPrice(totals.total)}</span>
      </div>
    </aside>
  )
}

// ─── Pantalla de éxito ───────────────────────────────────────────────────────
function SuccessScreen({ orderNumber, dispatch }) {
  return (
    <div className="bg-ivory text-rock min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md fadein">
        <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-pine text-ivory mb-8">
          <Check size={36} strokeWidth={2} />
        </span>
        <div className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow mb-3">
          Pedido confirmado
        </div>
        <h1 className="font-display font-black tracking-tightest uppercase text-5xl leading-[0.9] mb-4">
          ¡Gracias por<br/>tu compra!
        </h1>
        <div className="bg-rock/[0.05] border border-rock/10 px-6 py-4 mb-6 inline-block">
          <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/45 block mb-1">Número de pedido</span>
          <span className="font-mono font-bold text-xl text-rock">{orderNumber}</span>
        </div>
        <p className="text-rock/65 mb-8">
          Recibirás un email con la confirmación y el seguimiento de tu pedido.<br/>
          Entrega estimada: <strong>48 horas hábiles</strong>.
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={() => dispatch(navigate('home'))}
          iconRight={<ArrowRight size={16} />}
        >
          Volver al inicio
        </Button>
      </div>
    </div>
  )
}

// ─── Vista principal ──────────────────────────────────────────────────────────
export default function Checkout() {
  const dispatch = useDispatch()
  const items    = useSelector((s) => s.cart.items)
  const coupon   = useSelector((s) => s.cart.coupon)
  const totals   = useSelector(selectCartTotals)
  const user     = useSelector((s) => s.auth.user)

  const [step, setStep] = useState(1)
  const [orderNumber, setOrderNumber] = useState(null)

  // Paso 1: datos de envío
  const [ship, setShip] = useState({
    nombre:   user?.nombre || '',
    direccion: '',
    ciudad:   '',
    provincia: '',
    cp:       '',
    telefono: '',
  })
  const [shipErrors, setShipErrors] = useState({})

  // Paso 2: pago
  const [payMethod, setPayMethod] = useState('card')
  const [card, setCard] = useState({ numero: '', titular: '', exp: '', cvv: '' })
  const [cardErrors, setCardErrors] = useState({})
  const [processing, setProcessing] = useState(false)

  const sF = (field) => (e) => setShip({ ...ship, [field]: e.target.value })

  const goStep2 = () => {
    const e = validateShip(ship)
    if (Object.keys(e).length > 0) { setShipErrors(e); return }
    setShipErrors({})
    setStep(2)
    window.scrollTo({ top: 0 })
  }

  const goStep3 = () => {
    if (payMethod === 'card') {
      const e = validateCard(card)
      if (Object.keys(e).length > 0) { setCardErrors(e); return }
    }
    setCardErrors({})
    setStep(3)
    window.scrollTo({ top: 0 })
  }

  const confirmar = async () => {
    setProcessing(true)
    await new Promise((r) => setTimeout(r, 900))
    const n = `#ORD-${Math.floor(Math.random() * 90000 + 10000)}`
    setOrderNumber(n)
    dispatch(clearCart())
    setProcessing(false)
  }

  if (orderNumber) return <SuccessScreen orderNumber={orderNumber} dispatch={dispatch} />

  if (items.length === 0) {
    return (
      <div className="bg-ivory min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/55 mb-4">
            Tu carrito está vacío
          </p>
          <Button variant="primary" onClick={() => dispatch(navigate('carrito'))}>
            Ver carrito
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-ivory text-rock min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 lg:py-14">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 font-mono text-[11px] tracking-widest-2 uppercase text-rock/55 mb-6">
          <button onClick={() => dispatch(navigate('home'))} className="hover:text-alpenglow transition-colors">Inicio</button>
          <span className="text-rock/30">›</span>
          <button onClick={() => dispatch(navigate('carrito'))} className="hover:text-alpenglow transition-colors">Carrito</button>
          <span className="text-rock/30">›</span>
          <span className="text-rock">Checkout</span>
        </nav>

        <h1 className="font-display font-black tracking-tightest uppercase text-5xl lg:text-6xl leading-[0.9] mb-8">
          Checkout
        </h1>

        <Stepper step={step} />

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-16">

          {/* ── Formularios ── */}
          <div>

            {/* ─ Paso 1: Envío ─ */}
            {step === 1 && (
              <Section eyebrow="01 — Destino" title="Datos de envío">
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="sm:col-span-2 block">
                    <Label>Nombre completo</Label>
                    <TInput value={ship.nombre} onChange={sF('nombre')} placeholder="Ana García" error={shipErrors.nombre} />
                  </label>
                  <label className="sm:col-span-2 block">
                    <Label>Dirección</Label>
                    <TInput value={ship.direccion} onChange={sF('direccion')} placeholder="Av. Cordillera 1234, piso 2" error={shipErrors.direccion} />
                  </label>
                  <label className="block">
                    <Label>Ciudad</Label>
                    <TInput value={ship.ciudad} onChange={sF('ciudad')} placeholder="Bariloche" error={shipErrors.ciudad} />
                  </label>
                  <label className="block">
                    <Label>Provincia</Label>
                    <TInput value={ship.provincia} onChange={sF('provincia')} placeholder="Río Negro" error={shipErrors.provincia} />
                  </label>
                  <label className="block">
                    <Label>Código postal</Label>
                    <TInput value={ship.cp} onChange={sF('cp')} placeholder="8400" error={shipErrors.cp} />
                  </label>
                  <label className="block">
                    <Label>Teléfono</Label>
                    <TInput value={ship.telefono} onChange={sF('telefono')} placeholder="+54 9 11 1234-5678" error={shipErrors.telefono} />
                  </label>
                </div>
                <div className="flex gap-3 mt-8">
                  <Button variant="ghost-light" size="md" onClick={() => dispatch(navigate('carrito'))} icon={<ArrowLeft size={14} />}>
                    Volver
                  </Button>
                  <Button variant="primary" size="lg" onClick={goStep2} iconRight={<ArrowRight size={16} />}>
                    Continuar al pago
                  </Button>
                </div>
              </Section>
            )}

            {/* ─ Paso 2: Pago ─ */}
            {step === 2 && (
              <Section eyebrow="02 — Método" title="Medio de pago">

                {/* Selector */}
                <div className="grid sm:grid-cols-3 gap-3 mb-6">
                  {[
                    { id: 'card',     label: 'Tarjeta',      sub: '12 cuotas s/i', Icon: CreditCard },
                    { id: 'transfer', label: 'Transferencia', sub: 'CBU / Alias',   Icon: Landmark },
                    { id: 'wallet',   label: 'Billetera',     sub: 'MP · Modo',     Icon: Wallet },
                  ].map(({ id, label, sub, Icon }) => (
                    <button key={id} type="button" onClick={() => { setPayMethod(id); setCardErrors({}) }}
                      className={`p-4 border text-left flex flex-col gap-2 transition-all ${payMethod === id ? 'border-pine bg-pine/5' : 'border-rock/15 hover:border-rock/40'}`}>
                      <Icon size={20} strokeWidth={1.5} className={payMethod === id ? 'text-pine' : 'text-rock/45'} />
                      <div>
                        <div className="font-narrow font-bold uppercase tracking-widest-2 text-xs">{label}</div>
                        <div className="font-mono text-[10px] text-rock/50 mt-0.5">{sub}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Tarjeta */}
                {payMethod === 'card' && (
                  <div className="grid sm:grid-cols-2 gap-4 fadein">
                    <label className="sm:col-span-2 block">
                      <Label>Número de tarjeta</Label>
                      <TInput value={card.numero} onChange={(e) => setCard({ ...card, numero: fmtCard(e.target.value) })}
                        placeholder="•••• •••• •••• ••••" maxLength={19} error={cardErrors.numero} />
                    </label>
                    <label className="sm:col-span-2 block">
                      <Label>Titular de la tarjeta</Label>
                      <TInput value={card.titular} onChange={(e) => setCard({ ...card, titular: e.target.value.toUpperCase() })}
                        placeholder="NOMBRE APELLIDO" error={cardErrors.titular} />
                    </label>
                    <label className="block">
                      <Label>Vencimiento (MM/AA)</Label>
                      <TInput value={card.exp} onChange={(e) => setCard({ ...card, exp: fmtExp(e.target.value) })}
                        placeholder="MM/AA" maxLength={5} error={cardErrors.exp} />
                    </label>
                    <label className="block">
                      <Label>CVV</Label>
                      <TInput value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g,'').slice(0,4) })}
                        placeholder="•••" type="password" maxLength={4} error={cardErrors.cvv} />
                    </label>
                    <p className="sm:col-span-2 font-mono text-[10px] tracking-widest-2 uppercase text-rock/40">
                      Pago seguro · Encriptado con SSL
                    </p>
                  </div>
                )}

                {/* Transferencia */}
                {payMethod === 'transfer' && (
                  <div className="fadein bg-rock/[0.03] border border-rock/10 p-6 space-y-3">
                    {[
                      { label: 'Banco',   value: 'Banco Nación Argentina' },
                      { label: 'CBU',     value: '0110012840001228041248' },
                      { label: 'Alias',   value: 'cumbre.equip.gear' },
                      { label: 'Titular', value: 'Cumbre Expedition Equipment S.A.' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2 border-b border-rock/10">
                        <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/45 sm:w-20 shrink-0">{label}</span>
                        <span className="font-mono text-sm font-bold">{value}</span>
                      </div>
                    ))}
                    <p className="font-mono text-[10px] text-rock/50 pt-2">Enviá el comprobante a pagos@cumbre.com — confirmamos en 24-48h</p>
                  </div>
                )}

                {/* Billetera */}
                {payMethod === 'wallet' && (
                  <div className="fadein grid sm:grid-cols-2 gap-3">
                    {[{ name: 'Mercado Pago', color: 'bg-[#009ee3]', sub: 'Hasta 12 cuotas' },
                      { name: 'Modo',         color: 'bg-[#4a0080]', sub: 'Bancos adheridos' }].map(({ name, color, sub }) => (
                      <div key={name} className={`${color} text-white p-4`}>
                        <div className="font-narrow font-bold uppercase tracking-widest-2 text-sm">{name}</div>
                        <div className="font-mono text-[10px] opacity-75 mt-1">{sub}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 mt-8">
                  <Button variant="ghost-light" size="md" onClick={() => setStep(1)} icon={<ArrowLeft size={14} />}>
                    Volver
                  </Button>
                  <Button variant="primary" size="lg" onClick={goStep3} iconRight={<ArrowRight size={16} />}>
                    Revisar pedido
                  </Button>
                </div>
              </Section>
            )}

            {/* ─ Paso 3: Confirmación ─ */}
            {step === 3 && (
              <Section eyebrow="03 — Revisar" title="Confirmá tu pedido">

                {/* Resumen de envío */}
                <div className="bg-rock/[0.04] border border-rock/10 p-5 mb-4">
                  <div className="font-mono text-[10px] tracking-widest-2 uppercase text-alpenglow mb-3">Datos de envío</div>
                  <div className="text-sm space-y-1 text-rock/80">
                    <p className="font-bold">{ship.nombre}</p>
                    <p>{ship.direccion}</p>
                    <p>{ship.ciudad}, {ship.provincia} {ship.cp}</p>
                    <p>{ship.telefono}</p>
                  </div>
                  <button onClick={() => setStep(1)} className="mt-3 font-mono text-[10px] tracking-widest-2 uppercase text-pine hover:underline">
                    Editar →
                  </button>
                </div>

                {/* Resumen de pago */}
                <div className="bg-rock/[0.04] border border-rock/10 p-5 mb-8">
                  <div className="font-mono text-[10px] tracking-widest-2 uppercase text-alpenglow mb-3">Método de pago</div>
                  <div className="text-sm text-rock/80">
                    {payMethod === 'card' && <p>Tarjeta: •••• •••• •••• {card.numero.replace(/\s/g,'').slice(-4) || '••••'}</p>}
                    {payMethod === 'transfer' && <p>Transferencia bancaria</p>}
                    {payMethod === 'wallet'   && <p>Billetera virtual</p>}
                  </div>
                  <button onClick={() => setStep(2)} className="mt-3 font-mono text-[10px] tracking-widest-2 uppercase text-pine hover:underline">
                    Editar →
                  </button>
                </div>

                <div className="flex gap-3">
                  <Button variant="ghost-light" size="md" onClick={() => setStep(2)} icon={<ArrowLeft size={14} />}>
                    Volver
                  </Button>
                  <Button variant="secondary" size="lg" onClick={confirmar} disabled={processing}
                    iconRight={!processing && <Check size={16} strokeWidth={2.2} />}>
                    {processing ? <><span className="spinner" /> Procesando…</> : 'Confirmar compra'}
                  </Button>
                </div>

                <p className="mt-4 font-mono text-[10px] tracking-widest-2 uppercase text-rock/40">
                  Al confirmar aceptás los términos y condiciones
                </p>
              </Section>
            )}
          </div>

          {/* Resumen lateral */}
          <OrderSummary items={items} totals={totals} coupon={coupon} />
        </div>
      </div>
    </div>
  )
}
