/* Shared UI primitives — Button, Input, StatusBadge, ProductCard, RoleSwitcher, etc.
 * These are the "look & feel atoms" used everywhere. */

/* ─── Button ──────────────────────────────────────────────────────────────
 * Variants: primary (pine), secondary (alpenglow/ochre), ghost-dark, ghost-light, danger
 * Sizes: sm | md | lg
 */
const Button = (props) => {
  const { variant = 'primary', size = 'md', icon, iconRight, disabled, children, className = '', ...rest } = props;
  const sizes = {
    sm: 'h-9 px-4 text-xs',
    md: 'h-11 px-5 text-[13px]',
    lg: 'h-14 px-7 text-sm',
  };
  const variants = {
    primary:    'bg-pine hover:bg-pine-700 text-ivory border-pine',
    secondary:  'bg-alpenglow hover:bg-alpenglow-700 text-ivory border-alpenglow',
    'ghost-dark':  'bg-transparent border-ivory/25 hover:border-ivory hover:bg-ivory/5 text-ivory',
    'ghost-light': 'bg-transparent border-rock/20 hover:border-rock hover:bg-rock/5 text-rock',
    danger: 'bg-status-cancelled hover:opacity-90 text-ivory border-status-cancelled',
    solid:  'bg-rock hover:bg-rock-700 text-ivory border-rock',
  };
  return (
    <button {...rest} disabled={disabled}
      className={`group inline-flex items-center justify-center gap-2.5 border font-narrow font-bold uppercase tracking-widest-2 transition-all
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50
        ${variants[variant]} ${sizes[size]} ${className}`}>
      {icon}
      <span>{children}</span>
      {iconRight && <span className="group-hover:translate-x-0.5 transition-transform">{iconRight}</span>}
    </button>
  );
};

/* ─── Input / Field labels ─────────────────────────────────────────────── */
const FieldLabel = ({ children }) => (
  <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 block mb-1.5">{children}</span>
);
const FieldLabelDark = ({ children }) => (
  <span className="font-mono text-[10px] tracking-widest-2 uppercase text-ivory/55 block mb-1.5">{children}</span>
);
const Input = ({ dark = false, className = '', ...props }) => (
  <input {...props}
    className={`input-base w-full ${dark ? 'input-dark' : ''} ${className}`} />
);

/* ─── StatusBadge ─────────────────────────────────────────────────────── */
const STATUS_STYLES = {
  PENDIENTE:  { bg: 'bg-alpenglow/15',  text: 'text-alpenglow',  border: 'border-alpenglow/30' },
  CONFIRMADA: { bg: 'bg-pine/15',       text: 'text-pine-300',   border: 'border-pine/30' },
  ENVIADA:    { bg: 'bg-blue-500/15',   text: 'text-blue-300',   border: 'border-blue-500/30' },
  ENTREGADA:  { bg: 'bg-pine/20',       text: 'text-pine-300',   border: 'border-pine/40' },
  CANCELADA:  { bg: 'bg-red-500/15',    text: 'text-red-300',    border: 'border-red-500/30' },
  AGOTADO:    { bg: 'bg-rock/80',       text: 'text-ivory',      border: 'border-ivory/10' },
  NUEVO:      { bg: 'bg-pine',          text: 'text-ivory',      border: 'border-pine' },
  INVIERNO:   { bg: 'bg-alpenglow',     text: 'text-ivory',      border: 'border-alpenglow' },
  'TODO TERRENO': { bg: 'bg-ivory',     text: 'text-rock',       border: 'border-ivory' },
  BESTSELLER: { bg: 'bg-rock',          text: 'text-ivory',      border: 'border-rock' },
  'STOCK BAJO': { bg: 'bg-alpenglow/15', text: 'text-alpenglow', border: 'border-alpenglow/40' },
};
const StatusBadge = ({ status, size = 'md', className = '' }) => {
  const s = STATUS_STYLES[status] || { bg: 'bg-rock-700', text: 'text-ivory', border: 'border-ivory/20' };
  const sz = size === 'sm' ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2.5 py-1';
  return (
    <span className={`inline-flex items-center font-mono tracking-widest-2 uppercase border ${s.bg} ${s.text} ${s.border} ${sz} ${className}`}>
      {status}
    </span>
  );
};

/* ─── ProductCard ─────────────────────────────────────────────────────── */
const ProductCard = ({ product, dark = false, onAdd, hideAdd = false }) => {
  const dispatch = useDispatch();
  const out = product.stock === 0;
  return (
    <article className="product-card group flex flex-col relative cursor-pointer"
             onClick={() => dispatch(navigate({ view: 'detail', params: { productId: product.id } }))}>
      <div className="relative aspect-[4/5] overflow-hidden bg-rock-700" style={{ backgroundColor: product.color }}>
        {product.images?.[0] && (
          <img src={product.images[0]} alt={product.name}
               className="product-img absolute inset-0 w-full h-full object-cover opacity-95"
               onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        )}
        {/* Badge */}
        {product.tag && (
          <div className="absolute top-3 left-3">
            <StatusBadge status={product.tag} />
          </div>
        )}
        {/* Out-of-stock veil */}
        {out && (
          <div className="absolute inset-0 bg-rock/70 grid place-items-center">
            <StatusBadge status="AGOTADO" />
          </div>
        )}
        {/* Quick add */}
        {!hideAdd && !out && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              const v = product.variants?.find((vv) => vv.stock > 0) || product.variants?.[0];
              if (!v) return;
              dispatch(addCartItemAsync({
                idVariante: v.id,
                cantidad: 1,
                productoId: product.id,
                variant: { color: v.color, size: v.talla || v.size, talla: v.talla || v.size },
                unitPrice: v.precio || product.price,
                name: product.nombre || product.name,
              }));
              onAdd && onAdd(product);
            }}
            className="absolute left-3 right-3 bottom-3 py-3 bg-ivory hover:bg-pine hover:text-ivory text-rock font-narrow font-bold uppercase tracking-widest-2 text-xs transition-all translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
            Agregar al carrito
          </button>
        )}
      </div>
      <div className={`pt-4 pb-2 flex flex-col gap-1.5 ${dark ? 'text-ivory' : 'text-rock'}`}>
        <div className="flex items-center justify-between">
          <span className={`font-mono text-[10px] tracking-widest-2 uppercase ${dark ? 'text-ivory/50' : 'text-rock/55'}`}>{product.brand}</span>
          {product.rating && (
            <span className={`font-mono text-[10px] ${dark ? 'text-ivory/45' : 'text-rock/45'} flex items-center gap-1`}>
              <IconStar size={10} stroke={1.5} fill="currentColor" className="text-alpenglow"/> {product.rating}
            </span>
          )}
        </div>
        <h3 className="font-narrow font-bold uppercase tracking-tight text-base leading-tight">{product.name}</h3>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-display font-black tracking-tightest text-lg">{fmt(product.price)}</span>
          {product.oldPrice && <span className={`text-xs ${dark ? 'text-ivory/40' : 'text-rock/40'} line-through`}>{fmt(product.oldPrice)}</span>}
        </div>
      </div>
    </article>
  );
};

/* ─── RoleSwitcher ────────────────────────────────────────────────────── */
const RoleSwitcher = () => {
  const role = useSelector((s) => s.auth.role);
  const isLoggedIn = useSelector((s) => s.auth.isLoggedIn);
  const dispatch = useDispatch();

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 p-1.5 bg-rock/90 backdrop-blur-md border border-ivory/15 rounded-full shadow-2xl">
      <span className="font-mono text-[10px] tracking-widest-2 uppercase text-ivory/45 pl-3 pr-1">Modo</span>
      {[
        { id: 'cliente', label: 'Cliente', Icon: IconUser },
        { id: 'admin',   label: 'Admin',   Icon: IconSliders },
      ].map((r) => (
        <button key={r.id}
          onClick={() => {
            dispatch(setRole(r.id));
            // Auto-navigate when switching role
            if (r.id === 'admin') dispatch(navigate('admin-dashboard'));
            else dispatch(navigate('home'));
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-narrow font-bold tracking-widest-2 uppercase transition-all
            ${role === r.id ? 'bg-alpenglow text-ivory' : 'text-ivory/70 hover:text-ivory'}`}>
          <r.Icon size={12} stroke={2.2} />
          {r.label}
        </button>
      ))}
    </div>
  );
};

/* ─── Breadcrumb ─────────────────────────────────────────────────────── */
const Breadcrumb = ({ items, dark = false }) => {
  const dispatch = useDispatch();
  return (
    <nav className={`flex items-center gap-2 font-mono text-[11px] tracking-widest-2 uppercase ${dark ? 'text-ivory/55' : 'text-rock/55'}`}>
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {it.view ? (
            <button onClick={() => dispatch(navigate({ view: it.view, params: it.params || {} }))}
              className="hover:text-alpenglow transition-colors">{it.label}</button>
          ) : (
            <span className={dark ? 'text-ivory' : 'text-rock'}>{it.label}</span>
          )}
          {i < items.length - 1 && <IconChevronRight size={10} className={dark ? 'text-ivory/30' : 'text-rock/30'} />}
        </React.Fragment>
      ))}
    </nav>
  );
};

/* ─── SectionHeader ──────────────────────────────────────────────────── */
const SectionHeader = ({ number, eyebrow, title, action, dark = true, className = '' }) => (
  <div className={`flex flex-col lg:flex-row lg:items-end justify-between gap-6 ${className}`}>
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className={`font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow`}>
          {number} — {eyebrow}
        </span>
        <span className={`h-px w-12 ${dark ? 'bg-ivory/20' : 'bg-rock/20'}`} />
      </div>
      <h2 className={`font-display font-black tracking-tightest uppercase text-4xl lg:text-6xl leading-[0.9] ${dark ? 'text-ivory' : 'text-rock'}`}>
        {title}
      </h2>
    </div>
    {action}
  </div>
);

/* ─── QtyStepper ─────────────────────────────────────────────────────── */
const QtyStepper = ({ value, onChange, dark = false, max = 99 }) => (
  <div className={`inline-flex items-center border ${dark ? 'border-ivory/20' : 'border-rock/20'}`}>
    <button onClick={() => onChange(Math.max(1, value - 1))}
      className={`h-10 w-10 grid place-items-center ${dark ? 'text-ivory hover:bg-ivory/5' : 'text-rock hover:bg-rock/5'}`}>
      <IconMinus size={14} stroke={2}/>
    </button>
    <span className={`px-4 font-mono text-sm font-bold tabular-nums ${dark ? 'text-ivory' : 'text-rock'}`}>{value}</span>
    <button onClick={() => onChange(Math.min(max, value + 1))}
      className={`h-10 w-10 grid place-items-center ${dark ? 'text-ivory hover:bg-ivory/5' : 'text-rock hover:bg-rock/5'}`}>
      <IconPlus size={14} stroke={2}/>
    </button>
  </div>
);

Object.assign(window, {
  Button, FieldLabel, FieldLabelDark, Input,
  StatusBadge, ProductCard, RoleSwitcher,
  Breadcrumb, SectionHeader, QtyStepper,
});
