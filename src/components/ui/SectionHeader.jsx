export default function SectionHeader({
  number,
  eyebrow,
  title,
  action,
  dark = true,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col lg:flex-row lg:items-end justify-between gap-6 ${className}`}
    >
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow">
            {number} — {eyebrow}
          </span>
          <span className={`h-px w-12 ${dark ? 'bg-ivory/20' : 'bg-rock/20'}`} />
        </div>
        <h2
          className={`font-display font-black tracking-tightest uppercase text-4xl lg:text-6xl leading-[0.9] ${
            dark ? 'text-ivory' : 'text-rock'
          }`}
        >
          {title}
        </h2>
      </div>
      {action}
    </div>
  )
}
