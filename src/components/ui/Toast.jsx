import { useEffect } from 'react'
import { ShoppingCart, X } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { hideToast } from '../../store/toastSlice.js'

export default function Toast() {
  const { visible, productName } = useSelector((state) => state.toast)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!visible) return
    const t = setTimeout(() => dispatch(hideToast()), 3000)
    return () => clearTimeout(t)
  }, [visible]) // eslint-disable-line

  if (!visible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 fadein max-w-sm w-full sm:w-auto">
      <div className="flex items-start gap-3 bg-pine border border-pine-600 text-ivory px-5 py-4 shadow-2xl">
        <span className="h-9 w-9 grid place-items-center bg-pine-700 shrink-0 mt-0.5">
          <ShoppingCart size={16} strokeWidth={2} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[10px] tracking-widest-2 uppercase text-pine-300 mb-1">
            Agregado al carrito
          </div>
          <div className="font-narrow font-bold uppercase tracking-tight text-sm leading-snug line-clamp-1">
            {productName}
          </div>
        </div>
        <button
          onClick={() => dispatch(hideToast())}
          className="text-ivory/60 hover:text-ivory mt-0.5 shrink-0"
          aria-label="Cerrar notificación"
        >
          <X size={14} />
        </button>
      </div>
      <div className="h-0.5 bg-pine-700">
        <div className="h-full bg-alpenglow animate-[shrink_3s_linear_forwards]" />
      </div>
    </div>
  )
}
