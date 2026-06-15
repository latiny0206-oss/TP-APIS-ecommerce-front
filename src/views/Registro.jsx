import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Mountain, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import Button from '../components/ui/Button.jsx'

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 block mb-1.5">
        {label}
      </span>
      {children}
      {error && <p className="font-mono text-[10px] text-red-600 mt-1">{error}</p>}
    </label>
  )
}

const PWD_RE = /^(?=.*[A-Z])(?=.*\d).{8,}$/

export default function Registro() {
  const { register, status, error, clearError } = useAuth()

  const [form, setForm] = useState({
    username: '', nombre: '', apellido: '', email: '', password: '', confirmar: '',
  })
  const [showPwd, setShowPwd] = useState(false)
  const [errors,  setErrors]  = useState({})

  useEffect(() => {
    if (error) clearError()
  }, [form.email, form.password]) // eslint-disable-line

  const f = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value })
    setErrors({ ...errors, [field]: undefined })
  }

  const validate = () => {
    const e = {}
    if (!form.username.trim())                              e.username  = 'Ingresá un nombre de usuario'
    if (!form.nombre.trim())                               e.nombre    = 'Ingresá tu nombre'
    if (!form.apellido.trim())                             e.apellido  = 'Ingresá tu apellido'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))   e.email     = 'Email inválido'
    if (!PWD_RE.test(form.password))                       e.password  = 'Mínimo 8 caracteres, una mayúscula y un número'
    if (form.password !== form.confirmar)                  e.confirmar = 'Las contraseñas no coinciden'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    register({
      username:  form.username,
      nombre:    form.nombre,
      apellido:  form.apellido,
      email:     form.email,
      password:  form.password,
    })
  }

  return (
    <div className="min-h-screen bg-rock flex flex-col">

      <div className="flex items-center justify-center pt-10 pb-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-alpenglow text-ivory">
            <Mountain size={16} strokeWidth={2.2} />
          </span>
          <span className="font-display font-black tracking-tightest text-xl uppercase text-ivory">
            Cumbre
          </span>
        </Link>
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

            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6">
                <AlertTriangle size={14} strokeWidth={2} className="shrink-0" />
                <span className="font-mono text-[11px] tracking-widest-2 uppercase">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              <Field label="Usuario" error={errors.username}>
                <input type="text" value={form.username} onChange={f('username')} placeholder="mi_usuario"
                  className="input-base w-full" autoComplete="username" />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Nombre" error={errors.nombre}>
                  <input type="text" value={form.nombre} onChange={f('nombre')} placeholder="Ana"
                    className="input-base w-full" autoComplete="given-name" />
                </Field>
                <Field label="Apellido" error={errors.apellido}>
                  <input type="text" value={form.apellido} onChange={f('apellido')} placeholder="García"
                    className="input-base w-full" autoComplete="family-name" />
                </Field>
              </div>

              <Field label="Email" error={errors.email}>
                <input type="email" value={form.email} onChange={f('email')} placeholder="tu@correo.com"
                  className="input-base w-full" autoComplete="email" />
              </Field>

              <Field label="Contraseña" error={errors.password}>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={f('password')}
                    placeholder="Mín. 8 · mayúscula · número" className="input-base w-full pr-11" autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-rock/40 hover:text-rock" tabIndex={-1}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>

              <Field label="Confirmar contraseña" error={errors.confirmar}>
                <input type="password" value={form.confirmar} onChange={f('confirmar')}
                  placeholder="Repetí la contraseña" className="input-base w-full" autoComplete="new-password" />
              </Field>

              <Button type="submit" variant="primary" size="lg" className="w-full !mt-6" disabled={status === 'loading'}>
                {status === 'loading' ? (
                  <span className="flex items-center gap-2"><span className="spinner" /> Creando cuenta…</span>
                ) : (
                  'Crear cuenta'
                )}
              </Button>
            </form>

            <p className="mt-6 text-center font-mono text-[11px] tracking-widest-2 uppercase text-rock/55">
              ¿Ya tenés cuenta?{' '}
              <Link to="/login"
                className="text-pine hover:text-pine-700 font-bold transition-colors">
                Iniciá sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
