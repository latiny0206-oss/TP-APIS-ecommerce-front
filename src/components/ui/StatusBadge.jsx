import { TAG_STYLES } from '../../data/index.js'

export default function StatusBadge({ status, size = 'md', className = '' }) {
  const s = TAG_STYLES[status] || {
    bg: 'bg-rock-700',
    text: 'text-ivory',
    border: 'border-ivory/20',
  }
  const sz = size === 'sm' ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2.5 py-1'
  return (
    <span
      className={`inline-flex items-center font-mono tracking-widest-2 uppercase border ${s.bg} ${s.text} ${s.border} ${sz} ${className}`}
    >
      {status}
    </span>
  )
}
