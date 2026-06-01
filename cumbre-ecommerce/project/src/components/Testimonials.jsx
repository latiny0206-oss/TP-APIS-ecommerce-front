/* Testimonials — 3 quote cards from guides/mountaineers */

const Testimonials = () => {
  return (
    <section className="relative py-20 lg:py-28 bg-rock text-ivory overflow-hidden">
      {/* Topographic dot pattern, dimmed */}
      <div className="absolute inset-0 topo opacity-40 pointer-events-none" />

      <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10">

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 lg:mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow">03 — Testimonios</span>
              <span className="h-px w-12 bg-ivory/20" />
            </div>
            <h2 className="font-display font-black tracking-tightest uppercase text-5xl lg:text-7xl leading-[0.9] max-w-[20ch]">
              Probado por<br/>quienes suben
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <RatingDial value={4.9} />
            <div className="text-sm text-ivory/65 max-w-[18ch]">
              Promedio de 12.480 reseñas verificadas
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3 lg:gap-4">
          {TESTIMONIALS.map((t, i) => (
            <figure key={i} className="bg-rock-800 border border-ivory/8 p-7 lg:p-9 flex flex-col justify-between min-h-[360px] hover:border-alpenglow/40 transition-colors">

              <div>
                <div className="flex gap-1 mb-6 text-alpenglow">
                  {[0,1,2,3,4].map((s) => <IconStar key={s} size={14} stroke={1} fill="currentColor" />)}
                </div>
                <blockquote className="font-narrow text-lg lg:text-xl leading-snug text-ivory">
                  <span className="text-alpenglow font-display">"</span>
                  {t.quote}
                  <span className="text-alpenglow font-display">"</span>
                </blockquote>
              </div>

              <figcaption className="flex items-center gap-4 mt-8 pt-6 border-t border-ivory/10">
                <img src={t.avatar} alt={t.name}
                     className="h-11 w-11 rounded-full object-cover bg-rock-600"
                     onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <div>
                  <div className="font-narrow font-bold uppercase tracking-widest-2 text-sm">{t.name}</div>
                  <div className="text-xs text-ivory/55 mt-0.5">{t.role}</div>
                </div>
                <span className="ml-auto font-mono text-[10px] tracking-widest-2 uppercase text-ivory/35">
                  /{String(i + 1).padStart(2, '0')}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

/* Small radial rating "dial" */
const RatingDial = ({ value = 4.9 }) => {
  const pct = value / 5;
  const circ = 2 * Math.PI * 28;
  return (
    <div className="relative h-20 w-20">
      <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
        <circle cx="32" cy="32" r="28" stroke="rgba(242,236,224,0.12)" strokeWidth="3" fill="none" />
        <circle cx="32" cy="32" r="28" stroke="#E2622B" strokeWidth="3" fill="none"
                strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 grid place-items-center font-display font-black text-xl tracking-tightest">
        {value.toFixed(1)}
      </div>
    </div>
  );
};

window.Testimonials = Testimonials;
