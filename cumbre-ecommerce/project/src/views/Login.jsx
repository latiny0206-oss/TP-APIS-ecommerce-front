/* Login / Registro — uses POST /api/auth/login (mock).
 *  "admin"/"admin123"     → rol ADMIN     → redirige a Tablero
 *  "juanperez"/"cumbre2026" → rol CLIENTE → redirige a Home
 */

const Login = () => {
  const dispatch = useDispatch();
  const authStatus = useSelector((s) => s.auth.status);
  const authError  = useSelector((s) => s.auth.error);

  const [tab, setTab] = React.useState('login'); // login | register
  const [showPwd, setShowPwd] = React.useState(false);
  const [form, setForm] = React.useState({
    username: 'juanperez', password: 'cumbre2026',
    email: '', nombre: '', apellido: '', confirm: '',
  });
  const [localError, setLocalError] = React.useState(null);

  const error = localError || authError;
  const submitting = authStatus === 'loading';

  const onSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    if (!form.username || !form.password) { setLocalError('Completa usuario y contraseña'); return; }
    if (tab === 'register' && form.password !== form.confirm) { setLocalError('Las contraseñas no coinciden'); return; }
    try {
      if (tab === 'login') {
        await dispatch(loginAsync({ username: form.username, password: form.password }));
      } else {
        await dispatch(registerAsync({
          username: form.username, email: form.email, password: form.password,
          nombre: form.nombre, apellido: form.apellido,
        }));
      }
    } catch (_) { /* error already set in store */ }
  };

  const fillDemo = (username) => {
    if (username === 'admin')     setForm({ ...form, username: 'admin',     password: 'admin123' });
    if (username === 'juanperez') setForm({ ...form, username: 'juanperez', password: 'cumbre2026' });
  };

  return (
    <div className="min-h-screen bg-rock grid lg:grid-cols-[1.1fr_1fr] -mt-[1px]">

      {/* Visual side */}
      <div className="relative hidden lg:block overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1600&q=80"
          alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-tr from-rock/95 via-rock/60 to-rock/20" />

        <div className="relative h-full flex flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-alpenglow text-ivory">
              <IconMountain size={18} stroke={2.2} />
            </span>
            <span className="font-display font-black tracking-tightest text-xl uppercase">Cumbre</span>
          </div>

          <div>
            <div className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow mb-4">
              · Coordenadas 32°S — 70°W
            </div>
            <h1 className="font-display font-black tracking-tightest uppercase leading-[0.85] text-6xl xl:text-8xl max-w-[12ch]">
              Tu próxima cumbre empieza acá.
            </h1>
            <p className="mt-6 text-ivory/70 max-w-md">
              Inicia sesión para revisar tu historial de expediciones, ofertas exclusivas para socios y tu carrito guardado.
            </p>

            {/* Demo accounts */}
            <div className="mt-10 grid sm:grid-cols-2 gap-3 max-w-md">
              {[
                { user: 'juanperez', pwd: 'cumbre2026', role: 'CLIENTE' },
                { user: 'admin',     pwd: 'admin123',   role: 'ADMIN' },
              ].map((acc) => (
                <button key={acc.user} type="button" onClick={() => fillDemo(acc.user)}
                  className="text-left p-3 border border-ivory/15 hover:border-alpenglow bg-rock/40 backdrop-blur-sm transition-colors">
                  <div className="font-mono text-[10px] tracking-widest-2 uppercase text-alpenglow">Demo · {acc.role}</div>
                  <div className="font-mono text-xs text-ivory mt-1">{acc.user}</div>
                  <div className="font-mono text-[10px] text-ivory/55">{acc.pwd}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="font-mono text-[10px] tracking-widest-2 uppercase text-ivory/50">
            © 2026 Cumbre Expedition Equipment · Built for the peaks.
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="bg-ivory text-rock flex items-center justify-center px-6 py-12 lg:py-0">
        <div className="w-full max-w-md">

          <button onClick={() => dispatch(navigate('home'))}
            className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 hover:text-pine flex items-center gap-2 mb-10">
            <IconChevronLeft size={12} /> Volver al inicio
          </button>

          {/* Tab toggle */}
          <div className="grid grid-cols-2 border border-rock/15 mb-8">
            {['login', 'register'].map((t) => (
              <button key={t} onClick={() => { setTab(t); setLocalError(null); }}
                className={`py-3 font-narrow font-bold uppercase tracking-widest-2 text-xs transition-colors
                  ${tab === t ? 'bg-rock text-ivory' : 'text-rock/60 hover:text-rock'}`}>
                {t === 'login' ? 'Ingresar' : 'Crear cuenta'}
              </button>
            ))}
          </div>

          <h2 className="font-display font-black tracking-tightest uppercase text-4xl lg:text-5xl leading-[0.9] mb-2">
            {tab === 'login' ? 'Bienvenido de vuelta.' : 'Únete a la cordada.'}
          </h2>
          <p className="text-rock/60 text-sm mb-8">
            {tab === 'login'
              ? 'Ingresa con tu nombre de usuario para acceder a tu historial y carrito.'
              : 'Crea una cuenta para acceder a descuentos y guardar tu carrito.'}
          </p>

          <form onSubmit={onSubmit} className="space-y-5">
            {tab === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <FieldLabel>Nombre</FieldLabel>
                  <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Juan" />
                </label>
                <label className="block">
                  <FieldLabel>Apellido</FieldLabel>
                  <Input value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} placeholder="Pérez" />
                </label>
              </div>
            )}

            <label className="block">
              <FieldLabel>Nombre de usuario</FieldLabel>
              <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="juanperez" autoComplete="username"/>
            </label>

            {tab === 'register' && (
              <label className="block">
                <FieldLabel>Correo electrónico</FieldLabel>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="tu@correo.com" />
              </label>
            )}

            <label className="block">
              <FieldLabel>Contraseña</FieldLabel>
              <div className="relative">
                <Input type={showPwd ? 'text' : 'password'} value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••" className="pr-12" autoComplete={tab === 'login' ? 'current-password' : 'new-password'}/>
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 grid place-items-center text-rock/55 hover:text-rock">
                  {showPwd ? <IconEyeOff size={16}/> : <IconEye size={16}/>}
                </button>
              </div>
            </label>

            {tab === 'register' && (
              <label className="block">
                <FieldLabel>Confirmar contraseña</FieldLabel>
                <Input type="password" value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  placeholder="••••••••" />
              </label>
            )}

            {error && (
              <div className="font-mono text-[11px] tracking-widest-2 uppercase text-red-700 bg-red-100/50 border border-red-300 px-3 py-2">
                ⚠ {error}
              </div>
            )}

            <Button variant="primary" size="lg" type="submit" disabled={submitting} className="w-full"
              iconRight={!submitting && <IconArrowRight size={16} stroke={2.2}/>}>
              {submitting ? 'Verificando…' : (tab === 'login' ? 'Ingresar a Cumbre' : 'Crear cuenta')}
            </Button>

            <div className="flex items-center gap-4 my-2">
              <div className="flex-1 h-px bg-rock/15"/>
              <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/40">O continúa con</span>
              <div className="flex-1 h-px bg-rock/15"/>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="ghost-light" size="md" type="button">Google</Button>
              <Button variant="ghost-light" size="md" type="button">Apple ID</Button>
            </div>
          </form>

          <div className="mt-8 text-xs text-rock/55 text-center">
            {tab === 'login' ? '¿Olvidaste tu contraseña? ' : 'Al crear tu cuenta aceptas los '}
            <a href="#" className="text-pine font-medium hover:underline">
              {tab === 'login' ? 'Recupérala acá' : 'términos y condiciones'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

window.Login = Login;
