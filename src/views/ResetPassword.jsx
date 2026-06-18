import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { authService } from '../api/authService.js'
import Button from '../components/ui/Button.jsx'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    try {
      await authService.resetPassword({ token, newPassword })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Ocurrió un error. Es posible que el enlace haya expirado.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-red-50 border border-red-200 text-red-700 p-8 text-center font-mono text-[11px] tracking-widest-2 uppercase">
          Enlace inválido. Por favor solicita un nuevo restablecimiento de contraseña.
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-rock/[0.02] border border-rock/10 p-8 rise">
        <div>
          <h2 className="text-center font-display font-black tracking-tightest uppercase text-3xl">
            Nueva Contraseña
          </h2>
          <p className="mt-2 text-center font-mono text-[11px] tracking-widest-2 uppercase text-rock/50">
            Ingresa tu nueva contraseña
          </p>
        </div>
        
        {success ? (
          <div className="text-center space-y-4">
            <div className="bg-pine/10 border border-pine/20 text-pine p-4 font-mono text-[11px] tracking-widest-2 uppercase">
              Contraseña restablecida exitosamente. Redirigiendo al inicio de sesión...
            </div>
            <Link to="/login" className="inline-block mt-4 font-mono text-[10px] tracking-widest-2 uppercase text-alpenglow hover:underline">
              Ir a iniciar sesión
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 font-mono text-[11px] tracking-widest-2 uppercase text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] tracking-widest-2 uppercase text-rock/60 mb-2">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-base"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] tracking-widest-2 uppercase text-rock/60 mb-2">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-base"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar contraseña'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
