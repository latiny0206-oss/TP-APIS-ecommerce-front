/* Root App
 *  - Wraps in Redux <Provider>
 *  - Hydrates products from seed data on mount
 *  - Renders RoleSwitcher (floating top-center)
 *  - Routes via state.navigation.currentView
 *  - Switches between client layout (Navbar + Footer) and Admin layout (sidebar)
 */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "heroVariant": "midnight",
  "accent": "#D9701A",
  "showTestimonials": true
}/*EDITMODE-END*/;

/* Client-facing wrapper around content */
function ClientShell({ children, hideChrome = false }) {
  return (
    <div className="bg-rock min-h-screen">
      {!hideChrome && <Navbar />}
      <main>{children}</main>
      {!hideChrome && <Footer />}
    </div>
  );
}

function Router() {
  const view = useSelector((s) => s.navigation.currentView);
  const role = useSelector((s) => s.auth.role);
  const heroVariant = useTweakRef('heroVariant');
  const showTestimonials = useTweakRef('showTestimonials');

  // Admin views
  if (role === 'admin' || view.startsWith('admin-')) {
    return (
      <AdminLayout>
        {view === 'admin-dashboard'  && <AdminDashboard />}
        {view === 'admin-products'   && <AdminProducts />}
        {view === 'admin-variants'   && <AdminVariants />}
        {view === 'admin-taxonomies' && <AdminTaxonomies />}
        {view === 'admin-discounts'  && <AdminDiscounts />}
        {view === 'admin-photos'     && <AdminPhotos />}
        {view === 'admin-users'      && <AdminUsers />}
        {view === 'orders'           && <AdminPlaceholder title="Órdenes — vista admin (usa Tablero)"/>}
        {/* Fallback */}
        {!view.startsWith('admin-') && view !== 'orders' && <AdminDashboard />}
      </AdminLayout>
    );
  }

  // Client views
  switch (view) {
    case 'login':
      return <ClientShell hideChrome><Login /></ClientShell>;
    case 'catalog':
      return <ClientShell><Catalog /></ClientShell>;
    case 'detail':
      return <ClientShell><Detail /></ClientShell>;
    case 'cart':
      return <ClientShell><Cart /></ClientShell>;
    case 'checkout':
      return <ClientShell><Checkout /></ClientShell>;
    case 'confirmation':
      return <ClientShell><Confirmation /></ClientShell>;
    case 'orders':
      return <ClientShell><Orders /></ClientShell>;
    case 'order-detail':
      return <ClientShell><OrderDetail /></ClientShell>;
    case 'home':
    default:
      return <ClientShell><Home heroVariant={heroVariant} showTestimonials={showTestimonials} /></ClientShell>;
  }
}

const AdminPlaceholder = ({ title }) => (
  <div className="bg-white border border-rock/10 p-10 text-center">
    <IconCompass size={40} stroke={1.2} className="mx-auto text-rock/30 mb-4"/>
    <div className="font-display font-black tracking-tightest uppercase text-2xl mb-2">{title}</div>
    <div className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/55">Próximamente en este módulo</div>
  </div>
);

/* Tiny shim so Router can read tweak values without re-wiring everything */
let _tweaksGet = () => TWEAK_DEFAULTS;
function useTweakRef(key) {
  // Re-render through a state subscription
  const [, force] = React.useReducer((n) => n + 1, 0);
  React.useEffect(() => {
    window.__tweaksListener = force;
    return () => { window.__tweaksListener = null; };
  }, []);
  return _tweaksGet()[key];
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  _tweaksGet = () => t;
  React.useEffect(() => { window.__tweaksListener && window.__tweaksListener(); }, [t]);

  // Hydrate seed data once on mount (simulates initial GET /api/* fetches)
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(hydrateProducts(PRODUCTOS_SEED));
    dispatch(hydrateTaxonomies({ categorias: CATEGORIAS_SEED, marcas: MARCAS_SEED }));
    dispatch(hydrateDiscounts(DESCUENTOS_SEED));
    dispatch(hydrateUsers(MOCK_USERS.map(({ password, ...u }) => u)));
  }, [dispatch]);

  // Live-apply accent color
  React.useEffect(() => {
    let styleEl = document.getElementById('__accent-override');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = '__accent-override';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `
      .bg-alpenglow { background-color: ${t.accent} !important; }
      .text-alpenglow { color: ${t.accent} !important; }
      .border-alpenglow { border-color: ${t.accent} !important; }
      .bg-alpenglow\\/15 { background-color: ${t.accent}26 !important; }
      .bg-alpenglow\\/10 { background-color: ${t.accent}1A !important; }
      .border-alpenglow\\/30 { border-color: ${t.accent}4D !important; }
      .border-alpenglow\\/40 { border-color: ${t.accent}66 !important; }
      .hover\\:bg-alpenglow:hover { background-color: ${t.accent} !important; }
      .hover\\:text-alpenglow:hover { color: ${t.accent} !important; }
      .hover\\:border-alpenglow:hover { border-color: ${t.accent} !important; }
    `;
  }, [t.accent]);

  return (
    <>
      <RoleSwitcher />
      <Router />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Hero" />
        <TweakRadio
          label="Backdrop"
          value={t.heroVariant}
          options={[
            { label: 'Midnight', value: 'midnight' },
            { label: 'Ridge',    value: 'ridge'    },
            { label: 'Glacier',  value: 'glacier'  },
          ]}
          onChange={(v) => setTweak('heroVariant', v)}
        />
        <TweakSection label="Color" />
        <TweakColor
          label="Acento secundario"
          value={t.accent}
          options={['#D9701A', '#E2622B', '#2E5F3A', '#265B7C', '#9B3A3A']}
          onChange={(v) => setTweak('accent', v)}
        />
        <TweakSection label="Sections" />
        <TweakToggle label="Testimonios" value={t.showTestimonials} onChange={(v) => setTweak('showTestimonials', v)} />
      </TweaksPanel>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Provider store={store}><App /></Provider>);
