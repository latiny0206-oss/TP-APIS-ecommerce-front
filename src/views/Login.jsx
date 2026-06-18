import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mountain, Eye, EyeOff, AlertTriangle, X, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { authService } from '../api/authService.js'
import { getErrorMessage } from '../api/api.js'
import Button from '../components/ui/Button.jsx'

function ForgotPasswordModal({ onClose }) {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    try {
      await authService.forgotPassword(email.trim())
      setSent(true)
    } catch (err) {
      // No revelamos si el email existe o no
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-rock/70 z-50 fadein" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 fadein">
        <div className="bg-ivory text-rock w-full max-w-sm shadow-2xl">
          <div className="flex items-center justify-between p-5 border-b border-rock/10">
            <h2 className="font-display font-black tracking-tightest uppercase text-xl">
              Recuperar contraseña
            </h2>
            <button
              onClick={onClose}
              className="h-8 w-8 grid place-items-center border border-rock/15 hover:bg-rock/5 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <div className="p-5">
            {sent ? (
              <div className="text-center py-4">
                <span className="h-12 w-12 rounded-full bg-pine text-ivory grid place-items-center mx-auto mb-4">
                  <Check size={20} strokeWidth={2.5} />
                </span>
                <p className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/70 leading-relaxed">
                  Si el email existe en nuestro sistema, se enviaron instrucciones de recuperación.
                </p>
                <button
                  onClick={onClose}
                  className="mt-5 font-mono text-[11px] tracking-widest-2 uppercase text-pine hover:underline"
                >
                  Cerrar →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/55 leading-relaxed">
                  Ingresá tu email y te enviamos instrucciones para restablecer tu contraseña.
                </p>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 font-mono text-[10px] tracking-widest-2 uppercase">
                    {error}
                  </div>
                )}

                <label className="block">
                  <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 block mb-1.5">
                    Email
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    required
                    autoFocus
                    className="input-base w-full"
                    autoComplete="email"
                  />
                </label>

                <div className="flex gap-2 pt-1">
                  <Button type="button" variant="ghost-light" size="md" className="flex-1" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" size="md" className="flex-1" disabled={loading}>
                    {loading ? <span className="flex items-center gap-2"><span className="spinner" /> Enviando…</span> : 'Enviar'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default function Login() {
  const { login, status, error, clearError, isLoggedIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoggedIn) navigate('/', { replace: true })
  }, [isLoggedIn, navigate])

  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [showPwd,     setShowPwd]     = useState(false)
  const [forgotOpen,  setForgotOpen]  = useState(false)

  useEffect(() => {
    if (error) clearError()
  }, [email, password]) // eslint-disable-line

  const handleSubmit = (e) => {
    e.preventDefault()
    login(email, password)
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
                Bienvenido de vuelta
              </div>
              <h1 className="font-display font-black tracking-tightest uppercase text-4xl leading-[0.9]">
                Iniciá sesión
              </h1>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6">
                <AlertTriangle size={14} strokeWidth={2} className="shrink-0" />
                <span className="font-mono text-[11px] tracking-widest-2 uppercase">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <label className="block">
                <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 block mb-1.5">Usuario</span>
                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario" required className="input-base w-full" autoComplete="username" />
              </label>

              <label className="block">
                <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 block mb-1.5">Contraseña</span>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} value={password}
                    onChange={(e) => setPassword(e.target.value)} placeholder="••••••" required
                    className="input-base w-full pr-11" autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-rock/40 hover:text-rock" tabIndex={-1}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 hover:text-alpenglow transition-colors"
                >
                  Olvidé mi contraseña
                </button>
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={status === 'loading'}>
                {status === 'loading' ? (
                  <span className="flex items-center gap-2"><span className="spinner" /> Verificando…</span>
                ) : (
                  'Iniciar sesión'
                )}
              </Button>
            </form>

            <p className="mt-6 text-center font-mono text-[11px] tracking-widest-2 uppercase text-rock/55">
              ¿No tenés cuenta?{' '}
              <Link to="/registro"
                className="text-pine hover:text-pine-700 font-bold transition-colors">
                Registrate
              </Link>
            </p>
          </div>
        </div>
      </div>

      {forgotOpen && <ForgotPasswordModal onClose={() => setForgotOpen(false)} />}
    </div>
  )
}
