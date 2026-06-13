import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Check, ArrowRight } from 'lucide-react'
import Button from '../components/ui/Button.jsx'

export default function Confirmacion() {
  const { state }    = useLocation()
  const navigate     = useNavigate()
  const orderNumber  = state?.orderNumber

  // Si se accede directamente sin un número de pedido, redirigir al home
  useEffect(() => {
    if (!orderNumber) navigate('/', { replace: true })
  }, [orderNumber, navigate])

  if (!orderNumber) return null

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
        <Button variant="primary" size="lg" onClick={() => navigate('/')} iconRight={<ArrowRight size={16} />}>
          Volver al inicio
        </Button>
      </div>
    </div>
  )
}
