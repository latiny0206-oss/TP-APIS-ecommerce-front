import { useDispatch } from 'react-redux'
import { Mountain } from 'lucide-react'
import { navigate } from '../store/navigationSlice.js'
import { FOOTER_COLUMNS, FOOTER_LEGAL_LINKS } from '../data/index.js'

export default function Footer() {
  const dispatch = useDispatch()

  return (
    <footer
      id="contacto"
      className="relative bg-rock text-ivory pt-20 lg:pt-28 border-t border-ivory/10 overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">

        {/* Top: brand + nav columns */}
        <div className="grid lg:grid-cols-[1.4fr_2.6fr] gap-12 lg:gap-20 pb-16">

          {/* Brand column */}
          <div>
            <button
              onClick={() => dispatch(navigate('home'))}
              className="inline-flex items-center gap-3 mb-6"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-alpenglow text-ivory">
                <Mountain size={20} strokeWidth={2.2} />
              </span>
              <span className="font-display font-black tracking-tightest text-2xl uppercase">
                Cumbre
              </span>
            </button>
            <p className="text-ivory/65 max-w-sm text-sm lg:text-base leading-relaxed">
              Cumbre Expedition Equipment provee a guías profesionales y aventureros
              serios desde 2014. Diseñado en Bariloche. Probado en los Andes.
            </p>
          </div>

          {/* Nav columns */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-6">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <div className="font-mono text-[10px] tracking-widest-2 uppercase text-ivory/45 mb-5">
                  {col.title}
                </div>
                <ul className="space-y-3">
                  {col.links.map(({ label, view }) =>
                    view ? (
                      <li key={label}>
                        <button
                          onClick={() => dispatch(navigate(view))}
                          className="text-sm lg:text-base text-ivory/85 hover:text-alpenglow link-underline transition-colors text-left"
                        >
                          {label}
                        </button>
                      </li>
                    ) : (
                      <li key={label}>
                        <a
                          href="#"
                          onClick={(e) => e.preventDefault()}
                          className="text-sm lg:text-base text-ivory/85 hover:text-alpenglow link-underline transition-colors"
                        >
                          {label}
                        </a>
                      </li>
                    )
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom strip */}
        <div className="border-t border-ivory/10 py-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="font-mono text-[11px] tracking-widest-2 uppercase text-ivory/55">
            © 2026 Cumbre Expedition Equipment · Construido para las cumbres.
          </div>
          <div className="flex flex-wrap items-center gap-x-7 gap-y-2 font-mono text-[11px] tracking-widest-2 uppercase text-ivory/55">
            {FOOTER_LEGAL_LINKS.map(({ label, view }) => (
              <button
                key={label}
                onClick={() => dispatch(navigate(view))}
                className="hover:text-ivory transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
