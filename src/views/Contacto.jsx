import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Check, ArrowLeft } from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import { contactService } from '../api/contactService.js'
import { getErrorMessage } from '../api/api.js'

const ASUNTOS  = ['Consulta general', 'Pedidos', 'Devoluciones', 'Otro']
const NAME_RE  = /^[A-Za-záéíóúüñÁÉÍÓÚÜÑàèìòùÀÈÌÒÙ'\- ]{2,}$/

const CONTACT_INFO = [
  { Icon: Mail,   label: 'Email',     value: 'contacto@cumbre.com' },
  { Icon: Phone,  label: 'Teléfono',  value: '+54 294 448-0123' },
  { Icon: MapPin, label: 'Dirección', value: 'Bariloche, Río Negro, Argentina' },
]

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 block mb-1.5">{label}</span>
      {children}
      {error && <p className="font-mono text-[10px] text-red-600 mt-1">{error}</p>}
    </label>
  )
}

export default function Contacto() {

  const [form, setForm]     = useState({ nombre: '', email: '', asunto: '', mensaje: '' })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const f = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value })
    setErrors({ ...errors, [field]: undefined })
  }

  const validate = () => {
    const e = {}
    if (!NAME_RE.test(form.nombre.trim()))                 e.nombre  = form.nombre.trim().length < 2 ? 'Ingresá tu nombre' : 'El nombre solo puede contener letras'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))   e.email   = 'Email inválido'
    if (!form.asunto)                                      e.asunto  = 'Seleccioná un asunto'
    if (form.mensaje.trim().length < 10)                   e.mensaje = 'El mensaje debe tener al menos 10 caracteres'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    setSubmitError(null)
    try {
      await contactService.enviarContacto(form)
      setSuccess(true)
    } catch (err) {
      setSubmitError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-ivory text-rock min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 lg:py-14">

        <nav className="flex items-center gap-2 font-mono text-[11px] tracking-widest-2 uppercase text-rock/55 mb-8">
          <Link to="/" className="hover:text-alpenglow transition-colors">Inicio</Link>
          <span className="text-rock/30">›</span>
          <span className="text-rock">Contacto</span>
        </nav>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow">Escribinos</span>
            <span className="h-px w-12 bg-rock/20" />
          </div>
          <h1 className="font-display font-black tracking-tightest uppercase text-5xl lg:text-7xl leading-[0.9] mb-4">
            Contacto
          </h1>
          <p className="text-rock/60 max-w-xl text-base lg:text-lg">
            Respondemos todas las consultas en menos de 48 horas hábiles.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-12 lg:gap-16 items-start">

          <div>
            {success ? (
              <div className="border-2 border-pine bg-pine/5 p-8 fadein">
                <div className="flex items-center gap-3 mb-4">
                  <span className="h-10 w-10 rounded-full bg-pine text-ivory grid place-items-center shrink-0">
                    <Check size={18} strokeWidth={2.5} />
                  </span>
                  <span className="font-mono text-[11px] tracking-widest-2 uppercase text-pine">Consulta recibida</span>
                </div>
                <h2 className="font-display font-black tracking-tightest uppercase text-3xl mb-3">
                  ¡Gracias, {form.nombre.split(' ')[0]}!
                </h2>
                <p className="text-rock/70">
                  Tu consulta fue registrada correctamente. Te responderemos en 48 horas hábiles
                  a <span className="font-mono font-bold">{form.email}</span>.
                </p>
                <button
                  onClick={() => { setSuccess(false); setSubmitError(null); setForm({ nombre: '', email: '', asunto: '', mensaje: '' }) }}
                  className="mt-6 font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 hover:text-pine underline"
                >
                  Enviar otro mensaje →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {submitError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 font-mono text-[11px] tracking-widest-2 uppercase">
                    {submitError}
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Nombre completo" error={errors.nombre}>
                    <input type="text" value={form.nombre} onChange={f('nombre')} placeholder="Ana García"
                      className="input-base w-full" autoComplete="name" />
                  </Field>
                  <Field label="Email" error={errors.email}>
                    <input type="email" value={form.email} onChange={f('email')} placeholder="tu@correo.com"
                      className="input-base w-full" autoComplete="email" />
                  </Field>
                </div>

                <Field label="Asunto" error={errors.asunto}>
                  <select value={form.asunto} onChange={f('asunto')} className="input-base w-full">
                    <option value="">Seleccioná un asunto…</option>
                    {ASUNTOS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </Field>

                <Field label="Mensaje" error={errors.mensaje}>
                  <textarea value={form.mensaje} onChange={f('mensaje')} rows={6}
                    placeholder="Contanos en qué podemos ayudarte…" className="input-base w-full resize-none" />
                </Field>

                <Button type="submit" variant="primary" size="lg" disabled={loading}>
                  {loading
                    ? <span className="flex items-center gap-2"><span className="spinner" /> Enviando…</span>
                    : 'Enviar mensaje'
                  }
                </Button>
              </form>
            )}
          </div>

          <aside className="lg:pt-2">
            <div className="bg-rock text-ivory p-8 space-y-6">
              <div className="font-mono text-[10px] tracking-widest-2 uppercase text-alpenglow mb-2">
                Datos de contacto
              </div>
              {CONTACT_INFO.map(({ Icon, label, value }) => (
                <div key={label} className="flex items-start gap-4">
                  <span className="h-10 w-10 grid place-items-center bg-ivory/10 shrink-0 mt-0.5">
                    <Icon size={16} className="text-alpenglow" />
                  </span>
                  <div>
                    <div className="font-mono text-[10px] tracking-widest-2 uppercase text-ivory/45 mb-1">{label}</div>
                    <div className="font-narrow font-semibold text-base text-ivory">{value}</div>
                  </div>
                </div>
              ))}
              <div className="border-t border-ivory/15 pt-5">
                <div className="font-mono text-[10px] tracking-widest-2 uppercase text-ivory/45 mb-2">
                  Horario de atención
                </div>
                <p className="text-sm text-ivory/75 leading-relaxed">
                  Lunes a viernes de 9:00 a 18:00 hs.<br />
                  Sábados de 10:00 a 14:00 hs.
                </p>
              </div>
            </div>
            <Link to="/faq"
              className="mt-4 w-full py-3 border border-rock/20 font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 hover:border-rock hover:text-rock transition-colors flex items-center justify-center gap-2">
              Ver preguntas frecuentes →
            </Link>
          </aside>
        </div>

        <div className="mt-12 pt-10 border-t border-rock/10">
          <Link to="/"
            className="inline-flex items-center gap-2 font-mono text-[11px] tracking-widest-2 uppercase text-rock/55 hover:text-rock transition-colors">
            <ArrowLeft size={12} /> Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
