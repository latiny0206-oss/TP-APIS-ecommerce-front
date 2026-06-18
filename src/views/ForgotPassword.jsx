import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../api/authService.js'
import Button from '../components/ui/Button.jsx'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const res = await authService.forgotPassword({ email })
      setMessage(res.message || 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.')
      setEmail('')
    } catch (err) {
      setError('Ocurrió un error al procesar tu solicitud. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-rock/[0.02] border border-rock/10 p-8 rise">
        <div>
          <h2 className="text-center font-display font-black tracking-tightest uppercase text-3xl">
            Recuperar Contraseña
          </h2>
          <p className="mt-2 text-center font-mono text-[11px] tracking-widest-2 uppercase text-rock/50">
            Ingresa tu email y te enviaremos las instrucciones
          </p>
        </div>
        
        {message && (
          <div className="bg-pine/10 border border-pine/20 text-pine p-4 font-mono text-[11px] tracking-widest-2 uppercase text-center">
            {message}
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 font-mono text-[11px] tracking-widest-2 uppercase text-center">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block font-mono text-[10px] tracking-widest-2 uppercase text-rock/60 mb-2">
              Dirección de email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-base"
              placeholder="tu@email.com"
            />
          </div>

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar instrucciones'}
          </Button>
          
          <div className="text-center mt-4">
            <Link to="/login" className="font-mono text-[10px] tracking-widest-2 uppercase text-alpenglow hover:text-rock transition-colors">
              Volver al inicio de sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
