import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Mountain, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { registerThunk, clearError } from '../store/authSlice.js'
import { navigate }                  from '../store/navigationSlice.js'
import Button from '../components/ui/Button.jsx'

export default function Registro() {
  const dispatch = useDispatch()
  const { status, error } = useSelector((s) => s.auth)

  const [form, setForm] = useState({ nombre: '', email: '', password: '', confirmar: '' })
  const [showPwd, setShowPwd]  = useState(false)
  const [errors, setErrors]    = useState({})

  useEffect(() => {
    if (error) dispatch(clearError())
  }, [form.email, form.password]) // eslint-disable-line

  const f = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value })
    setErrors({ ...errors, [field]: undefined })
  }

  const validate = () => {
    const e = {}
    if (!form.nombre.trim())                         e.nombre    = 'Ingresá tu nombre'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido'
    if (form.password.length < 6)                    e.password  = 'Mínimo 6 caracteres'
    if (form.password !== form.confirmar)            e.confirmar = 'Las contraseñas no coinciden'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    dispatch(registerThunk({ nombre: form.nombre, email: form.email, password: form.password }))
  }

  return (
    <div className="min-h-screen bg-rock flex flex-col">

      <div className="flex items-center justify-center pt-10 pb-8">
        <button onClick={() => dispatch(navigate('home'))} className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-alpenglow text-ivory">
            <Mountain size={16} strokeWidth={2.2} />
          </span>
          <span className="font-display font-black tracking-tightest text-xl uppercase text-ivory">
            Cumbre
          </span>
        </button>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <div className="bg-ivory text-rock p-8 lg:p-10">

            <div className="mb-8">
              <div className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow mb-2">
                Nueva cuenta
              </div>
              <h1 className="font-display font-black tracking-tightest uppercase text-4xl leading-[0.9]">
                Registrate
              </h1>
            </div>

            {/* Error del servidor */}
            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6">
                <AlertTriangle size={14} strokeWidth={2} className="shrink-0" />
                <span className="font-mono text-[11px] tracking-widest-2 uppercase">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              <Field label="Nombre completo" error={errors.nombre}>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={f('nombre')}
                  placeholder="Ana García"
                  className="input-base w-full"
                  autoComplete="name"
                />
              </Field>

              <Field label="Email" error={errors.email}>
                <input
                  type="email"
                  value={form.email}
                  onChange={f('email')}
                  placeholder="tu@correo.com"
                  className="input-base w-full"
                  autoComplete="email"
                />
              </Field>

              <Field label="Contraseña" error={errors.password}>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={form.password}
                    onChange={f('password')}
                    placeholder="Mínimo 6 caracteres"
                    className="input-base w-full pr-11"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-rock/40 hover:text-rock"
                    tabIndex={-1}
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>

              <Field label="Confirmar contraseña" error={errors.confirmar}>
                <input
                  type="password"
                  value={form.confirmar}
                  onChange={f('confirmar')}
                  placeholder="Repetí la contraseña"
                  className="input-base w-full"
                  autoComplete="new-password"
                />
              </Field>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full !mt-6"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? (
                  <span className="flex items-center gap-2">
                    <span className="spinner" /> Creando cuenta…
                  </span>
                ) : (
                  'Crear cuenta'
                )}
              </Button>
            </form>

            <p className="mt-6 text-center font-mono text-[11px] tracking-widest-2 uppercase text-rock/55">
              ¿Ya tenés cuenta?{' '}
              <button
                onClick={() => dispatch(navigate('login'))}
                className="text-pine hover:text-pine-700 font-bold transition-colors"
              >
                Iniciá sesión
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 block mb-1.5">
        {label}
      </span>
      {children}
      {error && (
        <p className="font-mono text-[10px] text-red-600 mt-1">{error}</p>
      )}
    </label>
  )
}
