import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, ChevronRight, Tag, X } from 'lucide-react'
import { useCart }           from '../context/CartContext.jsx'
import { useAuth }           from '../context/AuthContext.jsx'
import { cartService }       from '../api/cartService.js'
import { discountService }   from '../api/discountService.js'
import { getErrorMessage }   from '../api/api.js'
import { fmtPrice }          from '../utils/format.js'
import Button from '../components/ui/Button.jsx'

// ─── Stepper ───────────────────────────────────────────────────────────────
function Stepper({ step }) {
  const steps = ['Envío', 'Pago / Cupón', 'Confirmar']
  return (
    <div className="flex items-center gap-0 mb-10">
      {steps.map((label, i) => {
        const n = i + 1; const active = step === n; const done = step > n
        return (
          <div key={label} className="flex items-center">
            <div className="flex items-center gap-2">
              <span className={`h-8 w-8 grid place-items-center font-mono font-bold text-sm transition-all ${
                done ? 'bg-pine text-ivory' : active ? 'bg-rock text-ivory' : 'bg-rock/15 text-rock/40'
              }`}>
                {done ? <Check size={14} strokeWidth={2.5} /> : n}
              </span>
              <span className={`font-mono text-[11px] tracking-widest-2 uppercase transition-colors ${active ? 'text-rock' : 'text-rock/40'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && <ChevronRight size={14} className="mx-3 text-rock/20" />}
          </div>
        )
      })}
    </div>
  )
}

// ─── Campo de formulario ────────────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 block mb-1.5">{label}</span>
      {children}
      {error && <p className="font-mono text-[10px] text-red-600 mt-1">{error}</p>}
    </label>
  )
}

// ─── Resumen del pedido (sidebar) ───────────────────────────────────────────
function OrderSummary({ items, totals, cuponCodigo }) {
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
        <div className="flex justify-between text-ivory/75">
          <span>Subtotal</span>
          <span className="font-mono">{fmtPrice(totals.subtotal)}</span>
        </div>
        {cuponCodigo && (
          <div className="flex items-center gap-2 text-alpenglow">
            <Tag size={12} />
            <span className="flex-1 font-mono text-[10px] tracking-widest-2 uppercase truncate">
              {cuponCodigo}
            </span>
          </div>
        )}
        <div className="flex justify-between text-ivory/45">
          <span>Envío</span>
          <span className="font-mono">Gratis</span>
        </div>
      </div>

      <div className="flex items-baseline justify-between border-t border-ivory/15 pt-4">
        <span className="font-narrow font-bold uppercase tracking-widest-2">Total</span>
        <span className="font-display font-black tracking-tightest text-3xl">{fmtPrice(totals.subtotal)}</span>
      </div>
      {cuponCodigo && (
        <p className="font-mono text-[9px] tracking-widest-2 uppercase text-ivory/35 mt-2">
          Descuento aplicado al confirmar
        </p>
      )}
    </aside>
  )
}

// ─── Helper: obtener o crear carrito backend ────────────────────────────────
async function obtenerOCrearCarrito() {
  const carritos = await cartService.getCarritos()
  const existente = Array.isArray(carritos)
    ? carritos.find((c) => c.estado === 'ACTIVO' || c.estado === 'VACIO')
    : null

  if (existente) return existente

  try {
    return await cartService.crearCarrito()
  } catch (createErr) {
    if (createErr.response?.status === 400) {
      const retry = await cartService.getCarritos()
      const found = Array.isArray(retry)
        ? retry.find((c) => c.estado === 'ACTIVO' || c.estado === 'VACIO')
        : null
      if (found) return found
    }
    throw createErr
  }
}

const METODOS_PAGO = [
  { value: 'EFECTIVO',         label: 'Efectivo' },
  { value: 'TRANSFERENCIA',    label: 'Transferencia bancaria' },
  { value: 'TARJETA_DEBITO',   label: 'Tarjeta de débito' },
  { value: 'TARJETA_CREDITO',  label: 'Tarjeta de crédito' },
]

const EMPTY_ENVIO = {
  nombreDestinatario: '',
  direccion:          '',
  ciudad:             '',
  provincia:          '',
  codigoPostal:       '',
  telefono:           '',
}

// ─── Checkout principal ─────────────────────────────────────────────────────
export default function Checkout() {
  const navigate                    = useNavigate()
  const { items, totals, clearCart } = useCart()
  const { user }                    = useAuth()

  const [step, setStep] = useState(1)

  // Paso 1 — Envío
  const [envio,       setEnvio]       = useState(EMPTY_ENVIO)
  const [envioErrors, setEnvioErrors] = useState({})

  // Paso 2 — Pago / Cupón
  const [metodoPago,      setMetodoPago]      = useState('')
  const [cuponCodigo,     setCuponCodigo]      = useState('')
  const [cuponInput,      setCuponInput]       = useState('')
  const [cuponInfo,       setCuponInfo]        = useState(null)  // objeto del backend
  const [cuponError,      setCuponError]       = useState(null)
  const [cuponLoading,    setCuponLoading]     = useState(false)
  const [pagoError,       setPagoError]        = useState(null)

  // Submit final
  const [submitting,   setSubmitting]   = useState(false)
  const [processError, setProcessError] = useState(null)

  // Items sin varianteId
  const itemsSinVariante = items.filter((i) => !i.varianteId)

  // ── Validación envío ──────────────────────────────────────────────────────
  function validateEnvio() {
    const errs = {}
    if (!envio.nombreDestinatario.trim()) errs.nombreDestinatario = 'Requerido'
    if (!envio.direccion.trim())          errs.direccion          = 'Requerido'
    if (!envio.ciudad.trim())             errs.ciudad             = 'Requerido'
    if (!envio.provincia.trim())          errs.provincia          = 'Requerido'
    if (!envio.codigoPostal.trim())       errs.codigoPostal       = 'Requerido'
    if (!envio.telefono.trim())           errs.telefono           = 'Requerido'
    return errs
  }

  const setEnvioField = (field) => (e) => {
    setEnvio((prev) => ({ ...prev, [field]: e.target.value }))
    setEnvioErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const goStep2 = () => {
    if (itemsSinVariante.length > 0) {
      setProcessError(
        `No se puede continuar: ${itemsSinVariante.map((i) => i.nombre).join(', ')} no ${
          itemsSinVariante.length === 1 ? 'tiene variante asignada' : 'tienen variante asignada'
        }.`
      )
      return
    }
    const errs = validateEnvio()
    if (Object.keys(errs).length) { setEnvioErrors(errs); return }
    setProcessError(null)
    setStep(2)
    window.scrollTo({ top: 0 })
  }

  // ── Validar cupón ─────────────────────────────────────────────────────────
  const aplicarCupon = async () => {
    const codigo = cuponInput.trim().toUpperCase()
    if (!codigo) return
    setCuponLoading(true)
    setCuponError(null)
    setCuponInfo(null)
    try {
      const descuento = await discountService.buscarPorCodigo(codigo)
      setCuponInfo(descuento)
      setCuponCodigo(codigo)
      setCuponInput('')
    } catch (e) {
      const msg = getErrorMessage(e)
      setCuponError(e.response?.status === 404 ? 'Código no encontrado' : msg)
    } finally {
      setCuponLoading(false)
    }
  }

  const quitarCupon = () => {
    setCuponCodigo('')
    setCuponInfo(null)
    setCuponError(null)
    setCuponInput('')
  }

  function descuentoLabel(d) {
    if (!d) return ''
    if (d.tipo === 'PORCENTAJE') return `${d.codigo ?? d.nombre ?? 'Descuento'} — ${d.porcentaje ?? d.valor}% OFF`
    if (d.tipo === 'FIJO')       return `${d.codigo ?? d.nombre ?? 'Descuento'} — -${fmtPrice(d.valor ?? d.monto)}`
    return d.codigo ?? d.nombre ?? 'Descuento'
  }

  const goStep3 = () => {
    if (!metodoPago) { setPagoError('Seleccioná un método de pago'); return }
    setPagoError(null)
    setStep(3)
    window.scrollTo({ top: 0 })
  }

  // ── Confirmar pedido ──────────────────────────────────────────────────────
  const confirmar = async () => {
    if (submitting) return
    setSubmitting(true)
    setProcessError(null)

    try {
      // 1. Obtener o crear carrito backend
      const carrito = await obtenerOCrearCarrito()
      const carritoId = carrito.id

      // 2. Vaciar el carrito para evitar mezcla con items viejos
      await cartService.vaciar(carritoId)

      // 3. Agregar items del carrito local
      for (const item of items) {
        try {
          await cartService.addItem(carritoId, { idVariante: item.varianteId, cantidad: item.qty })
        } catch (itemErr) {
          await cartService.vaciar(carritoId).catch(() => {})
          throw new Error(`Sin stock suficiente para "${item.nombre}": ${getErrorMessage(itemErr)}`)
        }
      }

      // 4. Aplicar cupón o limpiar descuento previo
      if (cuponCodigo) {
        try {
          await cartService.aplicarCupon(carritoId, cuponCodigo)
        } catch {
          await cartService.vaciar(carritoId).catch(() => {})
          throw new Error('No se pudo aplicar el cupón. Verificá el código o retiralo para continuar sin descuento.')
        }
      } else {
        await cartService.actualizarCarrito(carritoId, { descuentoId: null }).catch(() => {})
      }

      // 5. Checkout con datos de envío y pago
      const orden = await cartService.checkout(carritoId, {
        nombreDestinatario: envio.nombreDestinatario,
        direccion:          envio.direccion,
        ciudad:             envio.ciudad,
        provincia:          envio.provincia,
        codigoPostal:       envio.codigoPostal,
        telefono:           envio.telefono,
        metodoPago,
      })

      clearCart()
      navigate('/confirmacion', {
        state: { orderNumber: `#ORD-${orden.id}`, ordenId: orden.id },
      })
    } catch (e) {
      setProcessError(getErrorMessage(e))
      setSubmitting(false)
    }
  }

  // ── Carrito vacío ──────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="bg-ivory min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/55 mb-4">
            Tu carrito está vacío
          </p>
          <Button variant="primary" onClick={() => navigate('/carrito')}>Ver carrito</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-ivory text-rock min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 lg:py-14">

        <nav className="flex items-center gap-2 font-mono text-[11px] tracking-widest-2 uppercase text-rock/55 mb-6">
          <Link to="/" className="hover:text-alpenglow transition-colors">Inicio</Link>
          <span className="text-rock/30">›</span>
          <Link to="/carrito" className="hover:text-alpenglow transition-colors">Carrito</Link>
          <span className="text-rock/30">›</span>
          <span className="text-rock">Checkout</span>
        </nav>

        <h1 className="font-display font-black tracking-tightest uppercase text-5xl lg:text-6xl leading-[0.9] mb-8">
          Checkout
        </h1>

        <Stepper step={step} />

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-16">
          <div>

            {/* ── Paso 1: Datos de envío ──────────────────────────────────── */}
            {step === 1 && (
              <section className="mb-8">
                <div className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow mb-2">
                  01 — Envío
                </div>
                <h2 className="font-display font-black tracking-tightest uppercase text-3xl mb-6">
                  Datos de entrega
                </h2>

                <div className="space-y-4">
                  <Field label="Nombre del destinatario" error={envioErrors.nombreDestinatario}>
                    <input
                      type="text"
                      value={envio.nombreDestinatario}
                      onChange={setEnvioField('nombreDestinatario')}
                      placeholder="Ana García"
                      className="input-base w-full"
                      autoComplete="name"
                    />
                  </Field>

                  <Field label="Dirección" error={envioErrors.direccion}>
                    <input
                      type="text"
                      value={envio.direccion}
                      onChange={setEnvioField('direccion')}
                      placeholder="Av. San Martín 1234, piso 3"
                      className="input-base w-full"
                      autoComplete="street-address"
                    />
                  </Field>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Ciudad" error={envioErrors.ciudad}>
                      <input
                        type="text"
                        value={envio.ciudad}
                        onChange={setEnvioField('ciudad')}
                        placeholder="Bariloche"
                        className="input-base w-full"
                        autoComplete="address-level2"
                      />
                    </Field>
                    <Field label="Provincia" error={envioErrors.provincia}>
                      <input
                        type="text"
                        value={envio.provincia}
                        onChange={setEnvioField('provincia')}
                        placeholder="Río Negro"
                        className="input-base w-full"
                        autoComplete="address-level1"
                      />
                    </Field>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Código postal" error={envioErrors.codigoPostal}>
                      <input
                        type="text"
                        value={envio.codigoPostal}
                        onChange={setEnvioField('codigoPostal')}
                        placeholder="8400"
                        className="input-base w-full"
                        autoComplete="postal-code"
                      />
                    </Field>
                    <Field label="Teléfono" error={envioErrors.telefono}>
                      <input
                        type="tel"
                        value={envio.telefono}
                        onChange={setEnvioField('telefono')}
                        placeholder="+54 294 448-0000"
                        className="input-base w-full"
                        autoComplete="tel"
                      />
                    </Field>
                  </div>
                </div>

                {processError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mt-4 font-mono text-[11px] tracking-widest-2 uppercase">
                    {processError}
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="ghost-light"
                    size="md"
                    onClick={() => navigate('/carrito')}
                    icon={<ArrowLeft size={14} />}
                  >
                    Volver al carrito
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={goStep2}
                    iconRight={<ArrowRight size={16} />}
                  >
                    Continuar al pago
                  </Button>
                </div>
              </section>
            )}

            {/* ── Paso 2: Pago y cupón ─────────────────────────────────────── */}
            {step === 2 && (
              <section className="mb-8">
                <div className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow mb-2">
                  02 — Pago / Cupón
                </div>
                <h2 className="font-display font-black tracking-tightest uppercase text-3xl mb-6">
                  Método de pago
                </h2>

                {/* Método de pago */}
                <div className="space-y-2 mb-8">
                  {METODOS_PAGO.map((m) => (
                    <label key={m.value} className={`flex items-center gap-3 p-4 border cursor-pointer transition-all ${
                      metodoPago === m.value ? 'border-rock bg-rock/[0.04]' : 'border-rock/15 hover:border-rock/35'
                    }`}>
                      <input
                        type="radio"
                        name="metodoPago"
                        value={m.value}
                        checked={metodoPago === m.value}
                        onChange={() => { setMetodoPago(m.value); setPagoError(null) }}
                        className="accent-rock"
                      />
                      <span className="font-mono text-[11px] tracking-widest-2 uppercase">
                        {m.label}
                      </span>
                      {metodoPago === m.value && (
                        <Check size={14} className="text-pine ml-auto shrink-0" strokeWidth={2.5} />
                      )}
                    </label>
                  ))}
                  {pagoError && (
                    <p className="font-mono text-[10px] text-red-600 mt-1">{pagoError}</p>
                  )}
                </div>

                {/* Cupón por código */}
                <div className="border-t border-rock/10 pt-6">
                  <div className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow mb-2">
                    ¿Tenés un cupón?
                  </div>
                  <h3 className="font-display font-black tracking-tightest uppercase text-xl mb-4">
                    Código de descuento
                  </h3>

                  {cuponInfo ? (
                    <div className="flex items-center gap-3 p-4 border border-pine bg-pine/[0.04]">
                      <Tag size={16} className="text-pine shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-narrow font-bold uppercase tracking-tight text-sm">
                          {descuentoLabel(cuponInfo)}
                        </div>
                        <div className="font-mono text-[10px] text-rock/50 mt-0.5">
                          Código: {cuponCodigo}
                        </div>
                      </div>
                      <button
                        onClick={quitarCupon}
                        className="h-7 w-7 grid place-items-center text-rock/40 hover:text-red-700 transition-colors shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={cuponInput}
                        onChange={(e) => { setCuponInput(e.target.value.toUpperCase()); setCuponError(null) }}
                        onKeyDown={(e) => { if (e.key === 'Enter') aplicarCupon() }}
                        placeholder="OTONO2026"
                        className="input-base flex-1 font-mono tracking-widest uppercase"
                      />
                      <Button
                        variant="ghost-light"
                        size="md"
                        onClick={aplicarCupon}
                        disabled={cuponLoading || !cuponInput.trim()}
                      >
                        {cuponLoading ? <span className="spinner" /> : 'Aplicar'}
                      </Button>
                    </div>
                  )}

                  {cuponError && (
                    <p className="font-mono text-[10px] text-red-600 mt-2">{cuponError}</p>
                  )}
                  <p className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/35 mt-3">
                    Opcional · El descuento se aplica al confirmar el pedido
                  </p>
                </div>

                <div className="flex gap-3 mt-8">
                  <Button
                    variant="ghost-light"
                    size="md"
                    onClick={() => { setStep(1); setProcessError(null) }}
                    icon={<ArrowLeft size={14} />}
                  >
                    Volver
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={goStep3}
                    iconRight={<ArrowRight size={16} />}
                  >
                    Revisar pedido
                  </Button>
                </div>
              </section>
            )}

            {/* ── Paso 3: Confirmación ──────────────────────────────────────── */}
            {step === 3 && (
              <section className="mb-8">
                <div className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow mb-2">
                  03 — Confirmar
                </div>
                <h2 className="font-display font-black tracking-tightest uppercase text-3xl mb-6">
                  Revisá tu pedido
                </h2>

                {/* Resumen envío */}
                <div className="bg-rock/[0.03] border border-rock/10 p-5 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-mono text-[10px] tracking-widest-2 uppercase text-alpenglow">Envío</div>
                    <button
                      onClick={() => { setStep(1); setProcessError(null) }}
                      className="font-mono text-[10px] tracking-widest-2 uppercase text-pine hover:underline"
                    >
                      Cambiar →
                    </button>
                  </div>
                  <div className="space-y-0.5 text-sm text-rock/80">
                    <p className="font-narrow font-bold uppercase tracking-tight">{envio.nombreDestinatario}</p>
                    <p>{envio.direccion}</p>
                    <p>{envio.ciudad}, {envio.provincia} {envio.codigoPostal}</p>
                    <p>{envio.telefono}</p>
                  </div>
                </div>

                {/* Resumen pago y cupón */}
                <div className="bg-rock/[0.03] border border-rock/10 p-5 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-mono text-[10px] tracking-widest-2 uppercase text-alpenglow">Pago</div>
                    <button
                      onClick={() => { setStep(2); setProcessError(null) }}
                      className="font-mono text-[10px] tracking-widest-2 uppercase text-pine hover:underline"
                    >
                      Cambiar →
                    </button>
                  </div>
                  <p className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/80">
                    {METODOS_PAGO.find((m) => m.value === metodoPago)?.label ?? metodoPago}
                  </p>
                  {cuponInfo && (
                    <div className="flex items-center gap-2 mt-3 text-pine">
                      <Tag size={13} />
                      <span className="font-mono text-[10px] tracking-widest-2 uppercase">
                        {descuentoLabel(cuponInfo)}
                      </span>
                    </div>
                  )}
                </div>

                {processError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-4 font-mono text-[11px] tracking-widest-2 uppercase">
                    {processError}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="ghost-light"
                    size="md"
                    onClick={() => { setStep(2); setProcessError(null) }}
                    icon={<ArrowLeft size={14} />}
                  >
                    Volver
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={confirmar}
                    disabled={submitting}
                    iconRight={!submitting ? <Check size={16} strokeWidth={2.2} /> : undefined}
                  >
                    {submitting
                      ? <><span className="spinner" /> Confirmando…</>
                      : 'Confirmar compra'}
                  </Button>
                </div>

                <p className="mt-4 font-mono text-[10px] tracking-widest-2 uppercase text-rock/40">
                  Al confirmar aceptás los términos y condiciones
                </p>
              </section>
            )}

          </div>

          <OrderSummary
            items={items}
            totals={totals}
            cuponCodigo={cuponCodigo || null}
          />
        </div>
      </div>
    </div>
  )
}
