const SIZES = {
  sm: 'h-9 px-4 text-xs',
  md: 'h-11 px-5 text-[13px]',
  lg: 'h-14 px-7 text-sm',
}

const VARIANTS = {
  primary: 'bg-pine hover:bg-pine-700 text-ivory border-pine',
  secondary: 'bg-alpenglow hover:bg-alpenglow-700 text-ivory border-alpenglow',
  'ghost-dark':
    'bg-transparent border-ivory/25 hover:border-ivory hover:bg-ivory/5 text-ivory',
  'ghost-light':
    'bg-transparent border-rock/20 hover:border-rock hover:bg-rock/5 text-rock',
  danger:
    'bg-red-700 hover:opacity-90 text-ivory border-red-700',
  solid: 'bg-rock hover:bg-rock-700 text-ivory border-rock',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  disabled,
  children,
  className = '',
  ...rest
}) {
  return (
    <button
      {...rest}
      disabled={disabled}
      className={`group inline-flex items-center justify-center gap-2.5 border font-narrow font-bold uppercase tracking-widest-2 transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {icon}
      <span>{children}</span>
      {iconRight && (
        <span className="group-hover:translate-x-0.5 transition-transform">
          {iconRight}
        </span>
      )}
    </button>
  )
}
