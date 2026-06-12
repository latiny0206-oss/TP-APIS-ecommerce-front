import { useState } from 'react'
import { Plus, Trash2, Check, X } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import { PRODUCTS_SEED } from '../../data/index.js'

const COLOR_SWATCH = {
  'Azul Marino': '#1f3a5f',
  'Verde Oliva': '#3d4a2a',
  'Negro':       '#1a1a1a',
  'Rojo':        '#9b1b1b',
  'Azul':        '#1d4ed8',
  'Naranja':     '#D9701A',
  'Gris':        '#6b7280',
  'Verde':       '#3d6849',
  'Marrón':      '#6b4423',
}

const ESTACIONES = ['TODAS', 'INVIERNO', 'VERANO']

const MATERIALS = ['210D Nylon', 'Ripstop Nylon', 'Cordura 500D', 'Gore-Tex', 'Fleece', 'Aluminio', 'Acero']

function buildInitialVariants() {
  const result = {}
  const materialCycle = MATERIALS
  for (const p of PRODUCTS_SEED) {
    result[p.id] = (p.variants || []).map((v, i) => ({
      id:       v.id,
      color:    v.color,
      talla:    v.talla,
      material: materialCycle[i % materialCycle.length],
      peso:     380 + i * 45,
      precio:   v.precio,
      stock:    v.stock,
      estacion: 'TODAS',
    }))
  }
  return result
}

function StockBadge({ stock }) {
  if (stock === 0) return (
    <span className="font-mono text-[9px] tracking-widest-2 uppercase px-1.5 py-0.5 bg-rock/80 text-ivory border border-ivory/10 whitespace-nowrap">
      AGOTADO
    </span>
  )
  if (stock <= 2) return (
    <span className="font-mono text-[9px] tracking-widest-2 uppercase px-1.5 py-0.5 bg-alpenglow/15 text-alpenglow border border-alpenglow/40 whitespace-nowrap">
      STOCK BAJO
    </span>
  )
  return null
}

function NumInput({ value, onChange, width }) {
  return (
    <input
      type="number"
      min={0}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="border border-rock/15 h-8 text-center font-mono text-xs bg-transparent focus:border-pine focus:outline-none transition-colors"
      style={{ width }}
    />
  )
}

const DEFAULT_NEW = {
  color: 'Negro', talla: 'M', material: '210D Nylon',
  peso: 500, stock: 0, precio: 0, estacion: 'TODAS',
}

function NewVariantRow({ precioBase, onConfirm, onCancel }) {
  const [form, setForm] = useState({ ...DEFAULT_NEW, precio: precioBase })
  const set = field => val => setForm(prev => ({ ...prev, [field]: val }))

  return (
    <tr className="bg-pine/5">
      <td className="px-3 py-2.5">
        <span className="font-mono text-[9px] tracking-widest-2 uppercase text-pine font-bold">NUEVA</span>
      </td>
      <td className="px-3 py-2.5">
        <input
          value={form.color}
          onChange={e => set('color')(e.target.value)}
          placeholder="Color"
          className="border border-rock/15 h-8 px-2 font-narrow text-xs bg-white/70 focus:border-pine focus:outline-none w-28"
        />
      </td>
      <td className="px-3 py-2.5">
        <input
          value={form.talla}
          onChange={e => set('talla')(e.target.value)}
          placeholder="Talla"
          className="border border-rock/15 h-8 px-2 font-narrow text-xs bg-white/70 focus:border-pine focus:outline-none w-16"
        />
      </td>
      <td className="px-3 py-2.5">
        <input
          value={form.material}
          onChange={e => set('material')(e.target.value)}
          placeholder="Material"
          className="border border-rock/15 h-8 px-2 font-narrow text-xs bg-white/70 focus:border-pine focus:outline-none w-28"
        />
      </td>
      <td className="px-3 py-2.5">
        <NumInput value={form.peso}   onChange={set('peso')}   width={72} />
      </td>
      <td className="px-3 py-2.5">
        <NumInput value={form.precio} onChange={set('precio')} width={88} />
      </td>
      <td className="px-3 py-2.5">
        <NumInput value={form.stock}  onChange={set('stock')}  width={60} />
      </td>
      <td className="px-3 py-2.5">
        <select
          value={form.estacion}
          onChange={e => set('estacion')(e.target.value)}
          className="border border-rock/15 h-8 px-2 font-mono text-[10px] bg-white/70 focus:border-pine focus:outline-none"
        >
          {ESTACIONES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </td>
      <td className="px-3 py-2.5">
        <div className="flex gap-1">
          <button
            onClick={() => onConfirm(form)}
            className="h-8 w-8 grid place-items-center bg-pine text-ivory hover:opacity-80 transition-opacity"
          >
            <Check size={13} strokeWidth={2.6} />
          </button>
          <button
            onClick={onCancel}
            className="h-8 w-8 grid place-items-center border border-rock/15 text-rock/55 hover:bg-rock/5"
          >
            <X size={13} />
          </button>
        </div>
      </td>
    </tr>
  )
}

function VariantRow({ variant, onUpdate, onDelete }) {
  const swatchColor = COLOR_SWATCH[variant.color] ?? '#454338'
  return (
    <tr className="border-t border-rock/10 hover:bg-rock/[0.015]">
      <td className="px-3 py-2.5 font-mono text-xs text-rock/55">#{variant.id}</td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span
            className="h-4 w-4 rounded-sm border border-rock/20 shrink-0 block"
            style={{ backgroundColor: swatchColor }}
          />
          <span className="font-narrow font-bold text-xs uppercase tracking-tight whitespace-nowrap">
            {variant.color}
          </span>
        </div>
      </td>
      <td className="px-3 py-2.5 font-narrow text-xs">{variant.talla}</td>
      <td className="px-3 py-2.5 font-narrow text-xs text-rock/60 whitespace-nowrap">{variant.material}</td>
      <td className="px-3 py-2.5">
        <NumInput value={variant.peso}   onChange={v => onUpdate('peso', v)}   width={72} />
      </td>
      <td className="px-3 py-2.5">
        <NumInput value={variant.precio} onChange={v => onUpdate('precio', v)} width={88} />
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <NumInput value={variant.stock} onChange={v => onUpdate('stock', v)} width={60} />
          <StockBadge stock={variant.stock} />
        </div>
      </td>
      <td className="px-3 py-2.5">
        <select
          value={variant.estacion}
          onChange={e => onUpdate('estacion', e.target.value)}
          className="border border-rock/15 h-8 px-2 font-mono text-[10px] bg-transparent focus:border-pine focus:outline-none"
        >
          {ESTACIONES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </td>
      <td className="px-3 py-2.5">
        <button
          onClick={onDelete}
          className="h-8 w-8 grid place-items-center text-rock/40 hover:text-red-700 border border-rock/15 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </td>
    </tr>
  )
}

export default function AdminVariants() {
  const [selectedId,  setSelectedId]  = useState(PRODUCTS_SEED[0]?.id)
  const [showNew,     setShowNew]     = useState(false)
  const [allVariants, setAllVariants] = useState(buildInitialVariants)

  const product    = PRODUCTS_SEED.find(p => p.id === selectedId)
  const variants   = allVariants[selectedId] || []
  const totalStock = variants.reduce((s, v) => s + (Number(v.stock) || 0), 0)

  function update(variantId, field, value) {
    setAllVariants(prev => ({
      ...prev,
      [selectedId]: prev[selectedId].map(v =>
        v.id === variantId ? { ...v, [field]: value } : v
      ),
    }))
  }

  function add(newVariant) {
    setAllVariants(prev => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), { id: Date.now(), ...newVariant }],
    }))
    setShowNew(false)
  }

  function remove(variantId) {
    setAllVariants(prev => ({
      ...prev,
      [selectedId]: prev[selectedId].filter(v => v.id !== variantId),
    }))
  }

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-6 items-start">

      {/* ── Product selector sidebar ── */}
      <aside className="bg-white border border-rock/10 sticky top-24">
        <div className="flex items-center justify-between px-4 py-3 border-b border-rock/10">
          <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55">Producto</span>
          <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/35">{PRODUCTS_SEED.length} items</span>
        </div>
        <ul className="max-h-[72vh] overflow-auto">
          {PRODUCTS_SEED.map(p => {
            const active  = selectedId === p.id
            const vCount  = (allVariants[p.id] || []).length
            return (
              <li key={p.id}>
                <button
                  onClick={() => { setSelectedId(p.id); setShowNew(false) }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-l-2
                    ${active
                      ? 'bg-pine/5 border-l-pine'
                      : 'border-l-transparent hover:bg-rock/[0.02]'
                    }`}
                >
                  <div
                    className="h-10 w-10 shrink-0 overflow-hidden"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.image && (
                      <img
                        src={p.image}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={e => { e.currentTarget.style.display = 'none' }}
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-narrow font-bold text-xs uppercase tracking-tight truncate">{p.nombre}</div>
                    <div className="font-mono text-[10px] text-rock/50 mt-0.5">
                      {vCount} variante{vCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </aside>

      {/* ── Variant editor ── */}
      {product && (
        <section className="bg-white border border-rock/10 flex flex-col min-w-0">

          {/* Header */}
          <div className="flex items-start justify-between px-5 py-4 border-b border-rock/10">
            <div>
              <div className="font-mono text-[10px] tracking-widest-2 uppercase text-alpenglow mb-0.5">
                {product.brand}
              </div>
              <h2 className="font-display font-black tracking-tightest uppercase text-xl leading-tight">
                {product.nombre}
              </h2>
              <div className="font-mono text-[10px] text-rock/40 mt-1">
                id · {product.id} · {variants.length} variante{variants.length !== 1 ? 's' : ''} activa{variants.length !== 1 ? 's' : ''}
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={13} strokeWidth={2.3} />}
              onClick={() => setShowNew(true)}
              disabled={showNew}
            >
              Nueva variante
            </Button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[840px]">
              <thead>
                <tr className="text-left bg-rock/[0.02]">
                  {['idVariante', 'Color', 'Talla', 'Material', 'Peso (g)', 'Precio', 'Stock', 'Estación', ''].map(h => (
                    <th key={h} className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 px-3 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {showNew && (
                  <NewVariantRow
                    precioBase={product.precioBase}
                    onConfirm={add}
                    onCancel={() => setShowNew(false)}
                  />
                )}
                {variants.map(v => (
                  <VariantRow
                    key={v.id}
                    variant={v}
                    onUpdate={(field, value) => update(v.id, field, value)}
                    onDelete={() => remove(v.id)}
                  />
                ))}
                {variants.length === 0 && !showNew && (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center font-mono text-[11px] tracking-widest-2 uppercase text-rock/35">
                      Sin variantes · Crea la primera con el botón de arriba
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-rock/10 flex items-center justify-between">
            <span className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/55">
              Stock total:{' '}
              <span className="font-bold text-pine">{totalStock}</span>{' '}
              unidades
            </span>
            <Button variant="primary" size="sm">Guardar cambios</Button>
          </div>
        </section>
      )}
    </div>
  )
}
