/* Newsletter signup — wired to Redux landingSlice
 * States: idle | submitting | success | error  */

const Newsletter = () => {
  const { email, status, error } = useSelector((s) => s.ui.newsletter);
  const dispatch = useDispatch();

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(submitNewsletterThunk(email));
  };

  return (
    <section className="relative py-24 lg:py-32 bg-ivory text-rock overflow-hidden">
      {/* Decorative oversize CUMBRE in background */}
      <div className="absolute -bottom-10 -left-6 right-0 pointer-events-none select-none opacity-[0.06]">
        <div className="font-display font-black tracking-tightest text-[28vw] leading-none uppercase whitespace-nowrap">
          Cumbre
        </div>
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10 grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-start">

        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow">04 — Suscríbete</span>
            <span className="h-px w-12 bg-rock/20" />
          </div>
          <h2 className="font-display font-black tracking-tightest uppercase text-5xl lg:text-7xl leading-[0.9] max-w-[14ch]">
            Recibe el<br/>diario de cumbre
          </h2>
          <p className="mt-6 text-rock/70 max-w-md text-base lg:text-lg">
            Lanzamientos, pruebas de campo, partes meteorológicos para las rutas más exigentes y descuentos exclusivos para suscriptores. Una vez al mes, sin ruido.
          </p>
        </div>

        <div className="lg:pt-4">
          {status === 'success' ? (
            <SuccessPanel email={email} onReset={() => dispatch(resetNewsletter())} />
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <label className="block">
                <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55">Correo electrónico</span>
                <div className="mt-2 flex flex-col sm:flex-row gap-2 sm:gap-0 border-b-2 border-rock focus-within:border-pine transition-colors">
                  <input
                    type="email" required
                    value={email}
                    onChange={(e) => dispatch(setNewsletterEmail(e.target.value))}
                    placeholder="tu@correo.com"
                    disabled={status === 'submitting'}
                    className="flex-1 bg-transparent py-4 text-lg lg:text-xl font-narrow text-rock placeholder:text-rock/30 outline-none disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="group inline-flex items-center justify-center gap-3 px-7 py-4 bg-pine hover:bg-pine-700 text-ivory font-narrow font-bold uppercase tracking-widest-2 text-sm transition-colors disabled:opacity-70">
                    {status === 'submitting' ? (
                      <>
                        <Spinner /> Enviando
                      </>
                    ) : (
                      <>Suscribirme <IconArrowRight size={16} stroke={2.2} className="group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </button>
                </div>
              </label>

              {error && (
                <div className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow-600">
                  ⚠ {error}
                </div>
              )}

              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                {['Sin spam', 'Cancela cuando quieras', '10% en tu primera compra'].map((t) => (
                  <li key={t} className="flex items-center gap-2 font-mono text-[10px] tracking-widest-2 uppercase text-rock/65">
                    <IconCheck size={12} stroke={2.6} className="text-alpenglow" /> {t}
                  </li>
                ))}
              </ul>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

const Spinner = () => (
  <span className="inline-block h-4 w-4 border-2 border-ivory/30 border-t-ivory rounded-full animate-spin" />
);

const SuccessPanel = ({ email, onReset }) => (
  <div className="border-2 border-pine p-7 lg:p-9 bg-pine/5 rise">
    <div className="flex items-center gap-3 mb-4">
      <span className="h-9 w-9 rounded-full bg-pine text-ivory grid place-items-center">
        <IconCheck size={16} stroke={2.6} />
      </span>
      <span className="font-mono text-[11px] tracking-widest-2 uppercase text-pine">Suscripción confirmada</span>
    </div>
    <div className="font-display font-black tracking-tightest text-3xl lg:text-4xl uppercase leading-none mb-3">
      Bienvenido a la cordada.
    </div>
    <p className="text-rock/70 text-sm lg:text-base">
      Enviamos un correo de verificación a <span className="font-mono text-rock">{email}</span>. Tu cupón del 10% llegará en los próximos minutos.
    </p>
    <button onClick={onReset}
      className="mt-5 font-mono text-[10px] tracking-widest-2 uppercase text-rock/60 hover:text-pine underline">
      Suscribir otro correo →
    </button>
  </div>
);

window.Newsletter = Newsletter;
