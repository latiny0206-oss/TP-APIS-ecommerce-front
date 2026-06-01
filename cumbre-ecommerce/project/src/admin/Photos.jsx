/* Admin Photos — drag & drop upload zone with simulated upload queue */

const AdminPhotos = () => {
  const productIds = useSelector((s) => s.products.ids);
  const productsById = useSelector((s) => s.products.byId);
  const paramId = useSelector((s) => s.navigation.params.productId);
  const product = productsById[paramId || productIds[0]];

  // Existing photos (from product.images)
  const [photos, setPhotos] = React.useState(() => (product?.images || []).map((src, i) => ({
    id: `ph${i}`, src, name: `${product.id}_${i + 1}.jpg`, size: '2.4 MB',
  })));
  const [queue, setQueue] = React.useState([
    { id: 'q1', name: 'detail_strap.webp',   size: '2.4 MB', progress: 100, done: true },
    { id: 'q2', name: 'lifestyle_hike.jpg',  size: '5.1 MB', progress: 100, done: true },
    { id: 'q3', name: 'top_lid_open.jpg',    size: '3.8 MB', progress: 100, done: true },
  ]);
  const [dragOver, setDragOver] = React.useState(false);

  const fakeUpload = (files) => {
    [...(files || [])].forEach((file, i) => {
      const id = `q-${Date.now()}-${i}`;
      const name = file.name || `upload_${Date.now()}.jpg`;
      const sizeMb = ((file.size || (1024 * 1024 * (Math.random() * 4 + 1))) / 1024 / 1024).toFixed(1);
      setQueue((q) => [...q, { id, name, size: `${sizeMb} MB`, progress: 0, done: false }]);
      // Simulate upload
      let p = 0;
      const interval = setInterval(() => {
        p += Math.random() * 25;
        if (p >= 100) {
          p = 100;
          clearInterval(interval);
          setQueue((q) => q.map((it) => it.id === id ? { ...it, progress: 100, done: true } : it));
          setPhotos((ph) => [...ph, { id, src: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=600&q=70', name, size: `${sizeMb} MB` }]);
        } else {
          setQueue((q) => q.map((it) => it.id === id ? { ...it, progress: Math.round(p) } : it));
        }
      }, 300);
    });
  };

  if (!product) {
    return <div className="font-mono text-[11px] text-rock/55">Selecciona un producto.</div>;
  }

  return (
    <div className="space-y-6">

      {/* Breadcrumb-like header */}
      <Breadcrumb items={[
        { label: 'Productos', view: 'admin-products' },
        { label: product.name },
        { label: 'Fotos' },
      ]} />

      <div className="flex items-end justify-between">
        <div>
          <div className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow mb-2">
            Fotos · {product.brand}
          </div>
          <h2 className="font-display font-black tracking-tightest uppercase text-3xl lg:text-4xl leading-[0.9]">
            {product.name}
          </h2>
          <p className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 mt-2">
            Variante seleccionada: <span className="text-pine">Azul Marino / M</span>
          </p>
        </div>
        <div className="font-mono text-[11px] tracking-widest-2 uppercase text-rock/55">
          {photos.length} imágenes
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">

        {/* Current photos */}
        <section className="bg-white border border-rock/10">
          <header className="p-5 border-b border-rock/10 flex items-center justify-between">
            <h3 className="font-display font-black tracking-tightest uppercase text-lg">Fotos actuales</h3>
            <span className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55">{photos.length} imágenes</span>
          </header>

          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((ph, i) => (
              <div key={ph.id} className="group relative aspect-square bg-rock-700 overflow-hidden border border-rock/10">
                <img src={ph.src} alt={ph.name} className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <span className="absolute top-2 left-2 h-6 w-6 grid place-items-center bg-rock text-ivory font-mono text-[10px] font-bold">{i + 1}</span>

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-rock/90 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="font-mono text-[9px] text-ivory truncate">{ph.name}</div>
                </div>

                <button onClick={() => setPhotos((ps) => ps.filter((p) => p.id !== ph.id))}
                  className="absolute top-2 right-2 h-6 w-6 grid place-items-center bg-rock/80 text-ivory hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  <IconTrash size={11}/>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Upload zone */}
        <section className="bg-white border border-rock/10">
          <header className="p-5 border-b border-rock/10">
            <h3 className="font-display font-black tracking-tightest uppercase text-lg">Subir nuevas fotos</h3>
          </header>

          <div className="p-5">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                fakeUpload(e.dataTransfer.files);
              }}
              className={`relative border-2 border-dashed rounded-sm p-10 text-center transition-all
                ${dragOver ? 'border-pine bg-pine/5' : 'border-rock/25 hover:border-rock/45'}`}>
              <IconUpload size={36} stroke={1.4} className="mx-auto mb-4 text-rock/45"/>
              <div className="font-narrow font-bold uppercase tracking-widest-2 text-sm mb-2">
                Arrastrá imágenes aquí o
                <label className="text-pine underline cursor-pointer ml-1">
                  Seleccionar archivos
                  <input type="file" multiple accept="image/*" className="sr-only"
                    onChange={(e) => fakeUpload(e.target.files)}/>
                </label>
              </div>
              <p className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/45">
                JPG, PNG, WEBP · Máx 10MB por archivo
              </p>
            </div>

            {/* Queue */}
            <div className="mt-5">
              <div className="font-mono text-[10px] tracking-widest-2 uppercase text-rock/55 mb-3 flex items-center gap-2">
                <span>Cola de subida</span>
                <span className="text-pine">· {queue.filter((q) => q.done).length} completadas</span>
              </div>
              <ul className="space-y-2">
                {queue.map((q) => (
                  <li key={q.id} className="border border-rock/10 p-3 flex items-center gap-3">
                    <span className={`h-8 w-8 grid place-items-center ${q.done ? 'bg-pine/15 text-pine' : 'bg-alpenglow/15 text-alpenglow'}`}>
                      {q.done ? <IconCheck size={14} stroke={2.6}/> : <IconUpload size={14}/>}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-xs truncate">{q.name}</div>
                      <div className="font-mono text-[10px] text-rock/55 mt-0.5">{q.size}</div>
                      {!q.done && (
                        <div className="mt-1.5 h-1 bg-rock/10 overflow-hidden">
                          <div className="h-full bg-alpenglow transition-all" style={{ width: `${q.progress}%` }}/>
                        </div>
                      )}
                    </div>
                    <span className="font-mono text-[10px] tracking-widest-2 uppercase whitespace-nowrap text-rock/55">
                      {q.done ? '✓ subida' : `${q.progress}%`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

window.AdminPhotos = AdminPhotos;
