import { useState, useEffect } from 'react'
import { Mail, RefreshCw } from 'lucide-react'
import { contactService } from '../../api/contactService.js'
import { getErrorMessage } from '../../api/api.js'
import Button from '../../components/ui/Button.jsx'

function fmtFecha(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function MensajeDetail({ msg, onClose }) {
  return (
    <div className="bg-rock/[0.03] border border-rock/10 p-5 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-narrow font-bold uppercase tracking-tight text-sm">{msg.nombre}</div>
          <div className="font-mono text-[10px] text-rock/55 mt-0.5">{msg.email}</div>
        </div>
        <button
          onClick={onClose}
          className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/45 hover:text-rock transition-colors shrink-0"
        >
          Cerrar ×
        </button>
      </div>
      <div className="font-mono text-[10px] tracking-widest-2 uppercase text-alpenglow">{msg.asunto}</div>
      <p className="text-sm text-rock/80 leading-relaxed whitespace-pre-wrap">{msg.mensaje}</p>
      <div className="font-mono text-[10px] text-rock/35">{fmtFecha(msg.fechaEnvio ?? msg.fecha ?? msg.fechaCreacion ?? msg.createdAt)}</div>
    </div>
  )
}

export default function AdminContacto() {
  const [mensajes, setMensajes] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [selected, setSelected] = useState(null)

  const load = () => {
    setLoading(true)
    setError(null)
    contactService.getMensajes()
      .then((data) => setMensajes(Array.isArray(data) ? data : []))
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const selectedMsg = mensajes.find((m) => m.id === selected) ?? null

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/55">
          {!loading && !error && (
            <><span className="font-bold text-rock">{mensajes.length}</span> mensajes recibidos</>
          )}
        </div>
        <Button variant="ghost-light" size="sm" icon={<RefreshCw size={13} />} onClick={load}>
          Actualizar
        </Button>
      </div>

      {loading ? (
        <div className="bg-white border border-rock/10 py-16 text-center">
          <span className="spinner" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 flex items-center justify-between">
          <span className="font-mono text-[11px] tracking-widest-2 uppercase">{error}</span>
          <Button variant="ghost-light" size="sm" icon={<RefreshCw size={13} />} onClick={load}>
            Reintentar
          </Button>
        </div>
      ) : mensajes.length === 0 ? (
        <div className="bg-white border border-rock/10 py-16 text-center">
          <Mail size={32} strokeWidth={1.5} className="mx-auto mb-3 text-rock/25" />
          <p className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/40">
            Sin mensajes de contacto
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_420px] gap-6 items-start">

          <div className="bg-white border border-rock/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left bg-rock/[0.02]">
                  {['Nombre', 'Email', 'Asunto', 'Fecha', ''].map((h) => (
                    <th key={h} className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mensajes.map((m) => {
                  const isActive = selected === m.id
                  return (
                    <tr
                      key={m.id}
                      onClick={() => setSelected(isActive ? null : m.id)}
                      className={`border-t border-rock/10 cursor-pointer transition-colors ${
                        isActive ? 'bg-alpenglow/[0.06]' : 'hover:bg-rock/[0.025]'
                      }`}
                    >
                      <td className={`px-5 py-3 font-narrow font-bold text-xs uppercase tracking-tight relative ${
                        isActive ? 'pl-4 border-l-2 border-l-alpenglow' : ''
                      }`}>
                        {m.nombre}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-rock/65 truncate max-w-[160px]">{m.email}</td>
                      <td className="px-5 py-3 font-mono text-xs text-rock/70 truncate max-w-[140px]">{m.asunto}</td>
                      <td className="px-5 py-3 font-mono text-xs text-rock/50 whitespace-nowrap">
                        {fmtFecha(m.fechaEnvio ?? m.fecha ?? m.fechaCreacion ?? m.createdAt)}
                      </td>
                      <td className="px-5 py-3 font-mono text-[10px] tracking-widest-2 uppercase text-alpenglow">
                        {isActive ? '▲' : 'Ver'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {selectedMsg && (
            <div className="lg:sticky lg:top-24">
              <MensajeDetail msg={selectedMsg} onClose={() => setSelected(null)} />
            </div>
          )}

        </div>
      )}
    </div>
  )
}
