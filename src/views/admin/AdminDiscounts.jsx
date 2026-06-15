import { useState, useEffect } from 'react'
import { Ticket, Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import { discountService } from '../../api/discountService.js'
import { getErrorMessage }  from '../../api/api.js'

function ToggleSwitch({ active, onToggle }) {
  return (
    <button onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none
        ${active ? 'bg-pine' : 'bg-rock/20'}`} aria-pressed={active}>
      <span className={`inline-block h-5 w-5 translate-y-0.5 rounded-full bg-ivory shadow-sm transition-transform duration-200
        ${active ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
    </button>
  )
}

function fmtDateShort(dateStr) {
  if (!dateStr) return '—'
  const [, m, d] = dateStr.split('-')
  return `${m}-${d}`
}

function DiscountCard({ d, onToggle, onEdit, onDelete }) {
  const active     = d.estado === 'ACTIVO'
  const valueLabel = d.tipo === 'PORCENTAJE'
    ? `${d.porcentaje}% OFF`
    : `$${Number(d.valor).toLocaleString('es-CL')} OFF`

  return (
    <article className={`bg-white border transition-opacity ${active ? 'border-pine' : 'border-rock/15 opacity-60'}`}>
      <div className="flex items-start justify-between p-5 pb-3">
        <div>
          <div className="font-mono text-[10px] tracking-widest-2 uppercase text-alpenglow">
            <span className="font-bold">{valueLabel}</span>
            <span className="text-rock/45"> · {d.tipo}</span>
          </div>
          <div className="font-display font-black tracking-tightest uppercase text-2xl mt-1 leading-none">
            {d.codigo}
          </div>
        </div>
        <ToggleSwitch active={active} onToggle={() => onToggle(d)} />
      </div>

      <div className="grid grid-cols-3 divide-x divide-rock/10 border-t border-b border-rock/10">
        <div className="px-4 py-3 text-center">
          <div className="font-display font-black tracking-tightest text-xl">{d.usos ?? 0}</div>
          <div className="font-mono text-[9px] tracking-widest-2 uppercase text-rock/45 mt-0.5">usos</div>
        </div>
        <div className="px-4 py-3 text-center">
          <div className="font-mono text-[10px] font-bold whitespace-nowrap">
            {fmtDateShort(d.fechaInicio)} → {fmtDateShort(d.fechaFin)}
          </div>
          <div className="font-mono text-[9px] tracking-widest-2 uppercase text-rock/45 mt-0.5">vigencia</div>
        </div>
        <div className="px-4 py-3 text-center">
          <div className={`font-mono text-[10px] font-bold ${active ? 'text-pine' : 'text-rock/45'}`}>{d.estado}</div>
          <div className="font-mono text-[9px] tracking-widest-2 uppercase text-rock/45 mt-0.5">estado</div>
        </div>
      </div>

      <div className="flex items-center justify-between px-5 py-3">
        <button onClick={() => onEdit(d)}
          className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest-2 uppercase text-pine hover:opacity-70 transition-opacity">
          <Pencil size={11} /> Editar
        </button>
        <button onClick={() => onDelete(d.id)}
          className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest-2 uppercase text-rock/45 hover:text-red-700 transition-colors">
          <Trash2 size={11} /> Eliminar
        </button>
      </div>
    </article>
  )
}

const EMPTY_FORM = { codigo: '', tipo: 'PORCENTAJE', porcentaje: '', valor: '', fechaInicio: '', fechaFin: '' }

export default function AdminDiscounts() {
  const [descuentos,   setDescuentos]   = useState([])
  const [loading,      setLoading]      = useState(true)
  const [showForm,     setShowForm]     = useState(false)
  const [editData,     setEditData]     = useState(null)
  const [form,         setForm]         = useState(EMPTY_FORM)
  const [deleteId,     setDeleteId]     = useState(null)
  const [saving,       setSaving]       = useState(false)
  const [formError,    setFormError]    = useState(null)
  const [toggleError,  setToggleError]  = useState(null)
  const [deleteError,  setDeleteError]  = useState(null)

  useEffect(() => {
    discountService.getDescuentos()
      .then(setDescuentos)
      .catch(() => {
        // Fallback: intenta con endpoint de activos
        discountService.getDescuentosActivos().then(setDescuentos).catch(() => {})
      })
      .finally(() => setLoading(false))
  }, [])

  const activos = descuentos.filter(d => d.estado === 'ACTIVO').length
  const setF    = field => e => setForm(prev => ({ ...prev, [field]: e.target.value }))

  function openNew()   { setEditData(null); setForm(EMPTY_FORM); setShowForm(true) }
  function openEdit(d) {
    setEditData(d)
    setForm({ codigo: d.codigo, tipo: d.tipo, porcentaje: d.porcentaje ?? '', valor: d.valor || '', fechaInicio: d.fechaInicio, fechaFin: d.fechaFin })
    setShowForm(true)
  }

  async function handleSubmit() {
    if (!form.codigo.trim()) return
    setSaving(true)
    const payload = {
      codigo:     form.codigo.trim().toUpperCase(),
      tipo:       form.tipo,
      valor:      form.tipo === 'FIJO'       ? Number(form.valor)      : 0,
      porcentaje: form.tipo === 'PORCENTAJE' ? Number(form.porcentaje) : null,
      fechaInicio: form.fechaInicio,
      fechaFin:   form.fechaFin,
      estado:     editData?.estado ?? 'ACTIVO',
    }
    setFormError(null)
    try {
      if (editData) {
        const updated = await discountService.actualizarDescuento(editData.id, payload)
        setDescuentos(prev => prev.map(d => d.id === editData.id ? { ...d, ...updated } : d))
      } else {
        const created = await discountService.crearDescuento(payload)
        setDescuentos(prev => [...prev, created])
      }
      setShowForm(false)
    } catch (e) { setFormError(getErrorMessage(e)) }
    setSaving(false)
  }

  async function handleToggle(d) {
    const newEstado = d.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'
    setToggleError(null)
    try {
      await discountService.actualizarDescuento(d.id, { ...d, estado: newEstado })
      setDescuentos(prev => prev.map(item => item.id === d.id ? { ...item, estado: newEstado } : item))
    } catch (e) { setToggleError(getErrorMessage(e)) }
  }

  async function handleDelete(id) {
    setDeleteError(null)
    try {
      await discountService.eliminarDescuento(id)
      setDescuentos(prev => prev.filter(d => d.id !== id))
      setDeleteId(null)
    } catch (e) {
      setDeleteError(getErrorMessage(e))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 bg-alpenglow/15 text-alpenglow grid place-items-center shrink-0">
            <Ticket size={18} />
          </span>
          <div>
            <h2 className="font-display font-black tracking-tightest uppercase text-2xl leading-none">Cupones</h2>
            <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 mt-0.5">
              <span className="text-pine font-bold">{activos}</span> activos · {descuentos.length} totales
            </div>
          </div>
        </div>
        <Button variant="primary"
          icon={showForm && !editData ? <X size={14} /> : <Plus size={14} strokeWidth={2.2} />}
          onClick={showForm && !editData ? () => setShowForm(false) : openNew}>
          {showForm && !editData ? 'Cancelar' : 'Nuevo cupón'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-pine/5 border border-pine/30 p-5 fadein">
          <div className="font-mono text-[10px] tracking-widest-2 uppercase text-pine mb-4">
            {editData ? `PUT /api/descuentos/${editData.id}` : 'POST /api/descuentos'}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
            <label className="block">
              <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 block mb-1.5">Código</span>
              <input value={form.codigo} onChange={e => setForm(p => ({ ...p, codigo: e.target.value.toUpperCase() }))}
                placeholder="VERANO25" className="input-base w-full h-11" />
            </label>
            <label className="block">
              <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 block mb-1.5">Tipo</span>
              <select value={form.tipo} onChange={setF('tipo')} className="input-base w-full h-11">
                <option value="PORCENTAJE">PORCENTAJE</option>
                <option value="FIJO">FIJO</option>
              </select>
            </label>
            <label className="block">
              <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 block mb-1.5">
                {form.tipo === 'PORCENTAJE' ? 'Porcentaje (%)' : 'Valor ($)'}
              </span>
              <input type="number" min="0"
                value={form.tipo === 'PORCENTAJE' ? form.porcentaje : form.valor}
                onChange={form.tipo === 'PORCENTAJE' ? setF('porcentaje') : setF('valor')}
                placeholder={form.tipo === 'PORCENTAJE' ? '20' : '5000'}
                className="input-base w-full h-11" />
            </label>
            <label className="block">
              <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 block mb-1.5">Desde</span>
              <input type="date" value={form.fechaInicio} onChange={setF('fechaInicio')} className="input-base w-full h-11" />
            </label>
            <label className="block">
              <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 block mb-1.5">Hasta</span>
              <input type="date" value={form.fechaFin} onChange={setF('fechaFin')} className="input-base w-full h-11" />
            </label>
          </div>
          {formError && (
            <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-2 font-mono text-[11px] tracking-widest-2 uppercase">
              {formError}
            </div>
          )}
          <div className="flex gap-3 mt-4">
            <Button variant="primary" size="sm" icon={<Check size={13} strokeWidth={2.6} />}
              onClick={handleSubmit} disabled={saving}>
              {saving ? 'Guardando…' : editData ? 'Actualizar cupón' : 'Crear cupón'}
            </Button>
            <Button variant="ghost-light" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 bg-rock/10 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {descuentos.map(d => (
            <DiscountCard key={d.id} d={d}
              onToggle={handleToggle}
              onEdit={openEdit}
              onDelete={id => setDeleteId(id)} />
          ))}
        </div>
      )}

      {toggleError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 font-mono text-[11px] tracking-widest-2 uppercase flex items-center justify-between">
          {toggleError}
          <button onClick={() => setToggleError(null)} className="ml-4 text-red-400 hover:text-red-700">×</button>
        </div>
      )}

      {deleteId !== null && (
        <>
          <div className="fixed inset-0 bg-rock/60 z-40 fadein" onClick={() => setDeleteId(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 fadein">
            <div className="bg-ivory w-full max-w-xs border border-rock/15 shadow-2xl p-6">
              <h3 className="font-display font-black tracking-tightest uppercase text-lg">¿Eliminar cupón?</h3>
              <p className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/50 mt-1 mb-5">Esta acción no se puede deshacer.</p>
              {deleteError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 font-mono text-[11px] tracking-widest-2 uppercase">
                  {deleteError}
                </div>
              )}
              <div className="flex gap-3">
                <Button variant="ghost-light" size="sm" className="flex-1" onClick={() => { setDeleteId(null); setDeleteError(null) }}>Cancelar</Button>
                <Button variant="danger" size="sm" className="flex-1" onClick={() => handleDelete(deleteId)}>Eliminar</Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
