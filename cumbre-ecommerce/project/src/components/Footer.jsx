/* Footer — oversize wordmark, nav columns, copyright strip */

const Footer = () => (
  <footer id="contacto" className="relative bg-rock text-ivory pt-20 lg:pt-28 border-t border-ivory/10 overflow-hidden">
    <div className="max-w-[1400px] mx-auto px-6 lg:px-10">

      {/* Top: brand + columns */}
      <div className="grid lg:grid-cols-[1.4fr_2.6fr] gap-12 lg:gap-20 pb-16">
        <div>
          <a href="#" className="flex items-center gap-3 mb-6">
            <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-alpenglow text-rock">
              <IconMountain size={20} stroke={2.2} />
            </span>
            <span className="font-display font-black tracking-tightest text-2xl uppercase">Cumbre</span>
          </a>
          <p className="text-ivory/65 max-w-sm text-sm lg:text-base leading-relaxed">
            Cumbre Expedition Equipment provee a guías profesionales y aventureros serios desde 2014. Diseñado en Bariloche. Probado en los Andes.
          </p>

          {/* Socials */}
          <div className="flex items-center gap-2 mt-8">
            {[
              { Icon: IconInstagram, label: '@cumbreoutdoor', href: '#' },
              { Icon: IconYoutube,   label: '/cumbre',         href: '#' },
              { Icon: IconStrava,    label: 'Club Cumbre',     href: '#' },
            ].map((s, i) => (
              <a key={i} href={s.href}
                 className="group inline-flex items-center gap-2 px-3 h-10 border border-ivory/15 hover:border-alpenglow hover:text-alpenglow transition-colors">
                <s.Icon size={16} />
                <span className="font-mono text-[10px] tracking-widest-2 uppercase">{s.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-6">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="font-mono text-[10px] tracking-widest-2 uppercase text-ivory/45 mb-5">{col.title}</div>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm lg:text-base text-ivory/85 hover:text-alpenglow link-underline">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Oversize wordmark */}
      <div className="relative -mx-6 lg:-mx-10 border-t border-ivory/10 overflow-hidden">
        <div className="font-display font-black tracking-tightest uppercase leading-none text-[24vw] text-center select-none py-[4vw]"
             style={{ WebkitTextStroke: '1px rgba(242,236,224,0.18)', color: 'transparent' }}>
          CUMBRE
        </div>
      </div>

      {/* Bottom strip */}
      <div className="border-t border-ivory/10 py-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="font-mono text-[11px] tracking-widest-2 uppercase text-ivory/55">
          © 2026 Cumbre Expedition Equipment · Built for the peaks.
        </div>
        <div className="flex flex-wrap items-center gap-x-7 gap-y-2 font-mono text-[11px] tracking-widest-2 uppercase text-ivory/55">
          {['Privacy Policy', 'Terms of Service', 'Shipping Info', 'Contact Us'].map((l) => (
            <a key={l} href="#" className="hover:text-ivory">{l}</a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

window.Footer = Footer;
