/* Static seed data — API-shaped (Postman contract) with display aliases.
 *
 * API field names are canonical:
 *   producto.nombre / descripcion / precioBase / marcaId / categoriaId / estado
 *   variante.color / talla / material / peso / precio / stock / estacion / productoId
 *   marca.nombre / descripcion
 *   categoria.nombre / descripcion
 *   descuento.codigo / tipo / valor / porcentaje / fechaInicio / fechaFin / estado
 *
 * Display aliases (legacy, computed by `enrichProduct`) so existing views
 * don't break: .name, .brand, .category, .price, .desc, .stock, plus
 * variant.size = variant.talla.
 */

const NAV_ITEMS = [
  { label: 'Indumentaria', view: 'catalog', params: { filter: 'indumentaria' } },
  { label: 'Equipamiento', view: 'catalog', params: { filter: 'equipamiento' } },
  { label: 'Calzado',      view: 'catalog', params: { filter: 'calzado' } },
  { label: 'Expediciones', view: 'catalog', params: { filter: 'expediciones' } },
];

const CATEGORY_CHIPS = [
  { id: 'todos',     label: 'Todos' },
  { id: 'invierno',  label: 'Invierno' },
  { id: 'trekking',  label: 'Trekking' },
  { id: 'escalada',  label: 'Escalada' },
  { id: 'camping',   label: 'Camping' },
];

const CATEGORIES_HERO = [
  { id: 'campamento', title: 'Campamento',    sub: '24 productos · Carpas, sacos, esterillas',
    img: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1400&q=70',
    iconKey: 'tent' },
  { id: 'calzado',    title: 'Calzado Técnico', sub: '38 productos · Botas, crampones, aproximación',
    img: 'https://images.unsplash.com/photo-1606471191009-63994c53433b?auto=format&fit=crop&w=1400&q=70',
    iconKey: 'boot' },
  { id: 'ropa',       title: 'Ropa Técnica',  sub: '86 productos · Capas, hardshell, plumas',
    img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1400&q=70',
    iconKey: 'jacket' },
];

/* ─── Marcas / Categorías (API shape) ──────────────────────────────────── */
const MARCAS_SEED = [
  { id: 1, nombre: 'Osprey',        descripcion: 'Mochilas técnicas — Cortez, CO',          productos: 18 },
  { id: 2, nombre: 'Marmot',        descripcion: 'Indumentaria alpine de alto rendimiento', productos: 12 },
  { id: 3, nombre: 'Petzl',         descripcion: 'Hardware de escalada y montañismo',       productos: 9  },
  { id: 4, nombre: 'Black Diamond', descripcion: 'Equipamiento de roca y hielo · Salt Lake', productos: 14 },
  { id: 5, nombre: 'Cumbre Pro',    descripcion: 'Línea propia de equipamiento técnico',    productos: 28 },
  { id: 6, nombre: 'Salomon',       descripcion: 'Calzado de trail y montaña',              productos: 11 },
  { id: 7, nombre: 'MSR',           descripcion: 'Carpas y stoves de expedición',           productos: 8  },
];

const CATEGORIAS_SEED = [
  { id: 1, nombre: 'Mochilas',         descripcion: 'Daypacks, mochilas de trekking y expedición', productos: 32 },
  { id: 2, nombre: 'Carpas',           descripcion: 'Carpas 3 y 4 estaciones',                     productos: 14 },
  { id: 3, nombre: 'Sacos de Dormir',  descripcion: 'Plumas y sintéticos de -20 a +5°C',           productos: 21 },
  { id: 4, nombre: 'Calzado Técnico',  descripcion: 'Botas, zapatillas de aproximación, crampones', productos: 38 },
  { id: 5, nombre: 'Ropa Técnica',     descripcion: 'Capas base, hardshell, plumas',               productos: 26 },
  { id: 6, nombre: 'Accesorios',       descripcion: 'Linternas, bastones, hidratación, electrónica', productos: 17 },
  { id: 7, nombre: 'Escalada',         descripcion: 'Aseguradoras, piolets, arneses, mosquetones', productos: 12 },
];

/* ─── Productos (API shape) ────────────────────────────────────────────── */
const PRODUCTOS_RAW = [
  {
    id: 101, marcaId: 1, categoriaId: 1, estado: 'ACTIVO',
    nombre: 'Mochila Atmos AG 65', precioBase: 89990, precioAnterior: 112000,
    descripcion: 'La Atmos AG 65 es la mochila de trekking más vendida, diseñada para viajes de mochilero con cargas pesadas. Incorpora el galardonado sistema de suspensión Anti-Gravity, que distribuye el peso de forma tan perfecta que sentirás que llevas menos de lo que realmente cargas.',
    tag: 'INVIERNO', rating: 4.9, reviews: 42, color: '#2A3B3F',
    features: ['Suspensión Anti-Gravity 3D continua', 'Arnés ajustable Fit-on-the-Fly', 'Funda para hidratación', 'Stow-on-the-Go para bastones'],
    specs: { peso: '2.11 kg', capacidad: '65 L', tela: '210D Nylon', temporada: '4 Estaciones' },
    images: [
      'https://images.unsplash.com/photo-1622260614153-03223fb72052?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1553978297-833d09932d65?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1437149007130-c8a572fdf365?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      { id: 1101, color: 'Azul Marino', talla: 'S', material: '210D Nylon', peso: 2010, stock: 3, precio: 89990, estacion: 'TODAS' },
      { id: 1102, color: 'Azul Marino', talla: 'M', material: '210D Nylon', peso: 2110, stock: 4, precio: 89990, estacion: 'TODAS' },
      { id: 1103, color: 'Azul Marino', talla: 'L', material: '210D Nylon', peso: 2230, stock: 2, precio: 89990, estacion: 'TODAS' },
      { id: 1104, color: 'Verde Oliva', talla: 'M', material: '210D Nylon', peso: 2110, stock: 5, precio: 89990, estacion: 'TODAS' },
      { id: 1105, color: 'Verde Oliva', talla: 'L', material: '210D Nylon', peso: 2230, stock: 1, precio: 89990, estacion: 'TODAS' },
      { id: 1106, color: 'Negro',       talla: 'M', material: '210D Nylon', peso: 2110, stock: 0, precio: 89990, estacion: 'TODAS' },
    ],
  },
  {
    id: 102, marcaId: 2, categoriaId: 5, estado: 'ACTIVO',
    nombre: 'Chaqueta Guide Down Hoody', precioBase: 189990, precioAnterior: 229990,
    descripcion: 'Chaqueta de pluma 800 fill power con construcción box-baffle. Diseñada para guías en condiciones extremas, desde Aconcagua hasta el Huayhuash.',
    tag: 'INVIERNO', rating: 4.8, reviews: 87, color: '#1F252B',
    features: ['Pluma 800 fill power', 'Construcción box-baffle anti-migración', 'Capucha ajustable sobre casco', 'Bolsillos térmicos para manos'],
    specs: { peso: '485 g', plumaje: '800 FP', tela: '20D Pertex Quantum', temporada: 'Alpine -25°C' },
    images: [
      'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      { id: 1201, color: 'Negro', talla: 'S', material: '20D Pertex',   peso: 460, stock: 3, precio: 189990, estacion: 'INVIERNO' },
      { id: 1202, color: 'Negro', talla: 'M', material: '20D Pertex',   peso: 485, stock: 4, precio: 189990, estacion: 'INVIERNO' },
      { id: 1203, color: 'Negro', talla: 'L', material: '20D Pertex',   peso: 510, stock: 2, precio: 189990, estacion: 'INVIERNO' },
      { id: 1204, color: 'Rojo',  talla: 'M', material: '20D Pertex',   peso: 485, stock: 3, precio: 189990, estacion: 'INVIERNO' },
      { id: 1205, color: 'Azul',  talla: 'L', material: '20D Pertex',   peso: 510, stock: 0, precio: 189990, estacion: 'INVIERNO' },
    ],
  },
  {
    id: 103, marcaId: 3, categoriaId: 7, estado: 'ACTIVO',
    nombre: 'Piolet Summit Evo', precioBase: 145500, precioAnterior: null,
    descripcion: 'Piolet técnico ligero de aleación 7075 para alpinismo clásico y travesías sobre glaciar. Cabeza forjada en una pieza.',
    tag: 'TODO TERRENO', rating: 4.9, reviews: 31, color: '#1F252B',
    features: ['Aleación 7075-T6', 'Pica anti-vibración', 'Mango con grip ergonómico', 'Certificación CE/UIAA'],
    specs: { peso: '410 g', largo: '52 cm', material: 'Aleación 7075', certif: 'CE/UIAA' },
    images: [
      'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      { id: 1301, color: 'Naranja', talla: '52cm', material: 'Aleación 7075', peso: 410, stock: 3, precio: 145500, estacion: 'TODAS' },
      { id: 1302, color: 'Naranja', talla: '60cm', material: 'Aleación 7075', peso: 470, stock: 2, precio: 145500, estacion: 'TODAS' },
      { id: 1303, color: 'Negro',   talla: '52cm', material: 'Aleación 7075', peso: 410, stock: 0, precio: 145500, estacion: 'TODAS' },
    ],
  },
  {
    id: 104, marcaId: 4, categoriaId: 7, estado: 'ACTIVO',
    nombre: 'Set ATC-Guide Alpine', precioBase: 42990, precioAnterior: null,
    descripcion: 'Aseguradora multifunción para roca, hielo y rappel. Modo guía para asegurar a un segundo.',
    tag: 'NUEVO', rating: 4.7, reviews: 54, color: '#3A4147',
    features: ['Modo asegurador clásico', 'Modo guía bloqueante', 'Compatible con cuerdas dobles', 'Disipación de calor optimizada'],
    specs: { peso: '88 g', cuerdas: '7.7 — 11 mm', material: 'Aleación 7075', certif: 'CE/UIAA' },
    images: [
      'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      { id: 1401, color: 'Naranja', talla: 'Único', material: 'Aleación 7075', peso: 88, stock: 12, precio: 42990, estacion: 'TODAS' },
      { id: 1402, color: 'Gris',    talla: 'Único', material: 'Aleación 7075', peso: 88, stock: 6,  precio: 42990, estacion: 'TODAS' },
    ],
  },
  {
    id: 105, marcaId: 6, categoriaId: 4, estado: 'ACTIVO',
    nombre: 'Bota X Ultra 4 GTX', precioBase: 89990, precioAnterior: 109990,
    descripcion: 'Bota mid-cut con Gore-Tex, suela Contagrip y Advanced Chassis para soporte lateral.',
    tag: 'BESTSELLER', rating: 4.6, reviews: 213, color: '#1F252B',
    features: ['Membrana Gore-Tex impermeable', 'Suela Contagrip MA', 'Advanced Chassis', 'Cierre Quicklace'],
    specs: { peso: '420 g', altura: 'Mid', material: 'Sintético', certif: 'GORE-TEX' },
    images: [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1606471191009-63994c53433b?auto=format&fit=crop&w=900&q=80',
    ],
    variants: [
      { id: 1501, color: 'Negro', talla: '40', material: 'GORE-TEX', peso: 410, stock: 0, precio: 89990, estacion: 'TODAS' },
      { id: 1502, color: 'Negro', talla: '41', material: 'GORE-TEX', peso: 415, stock: 0, precio: 89990, estacion: 'TODAS' },
      { id: 1503, color: 'Negro', talla: '42', material: 'GORE-TEX', peso: 420, stock: 1, precio: 89990, estacion: 'TODAS' },
      { id: 1504, color: 'Negro', talla: '43', material: 'GORE-TEX', peso: 430, stock: 0, precio: 89990, estacion: 'TODAS' },
    ],
  },
  {
    id: 106, marcaId: 7, categoriaId: 2, estado: 'ACTIVO',
    nombre: 'Carpa Domo Polar 2P', precioBase: 439990, precioAnterior: 549990,
    descripcion: 'Carpa 4 estaciones para expedición. Doble pared, varillas DAC Featherlite NSL.',
    tag: '-20%', rating: 4.8, reviews: 22, color: '#2F4538',
    features: ['4 estaciones expedición', 'Varillas DAC Featherlite NSL', 'Doble pared', 'Anclajes refuerzados'],
    specs: { peso: '3.4 kg', capacidad: '2 personas', temporada: '4 Estaciones', material: 'Ripstop 30D' },
    images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=900&q=80'],
    variants: [
      { id: 1601, color: 'Naranja', talla: '2P', material: 'Ripstop 30D', peso: 3400, stock: 4, precio: 439990, estacion: 'INVIERNO' },
    ],
  },
  {
    id: 107, marcaId: 5, categoriaId: 3, estado: 'ACTIVO',
    nombre: 'Saco Ultra Light -5°C', precioBase: 129990, precioAnterior: null,
    descripcion: 'Saco de pluma 700 fill, confort hasta -5°C. Ideal para travesías de 3 estaciones.',
    tag: 'AGOTADO', rating: 4.5, reviews: 18, color: '#2A3137',
    features: ['Pluma 700 fill', 'Confort -5°C', 'Cremallera bidireccional', 'Capucha ajustable'],
    specs: { peso: '780 g', temperatura: '-5°C', plumaje: '700 FP', talla: 'Regular' },
    images: ['https://images.unsplash.com/photo-1528123792456-128c8a51bf80?auto=format&fit=crop&w=900&q=80'],
    variants: [
      { id: 1701, color: 'Verde', talla: 'Regular', material: '20D Nylon', peso: 780, stock: 0, precio: 129990, estacion: 'INVIERNO' },
      { id: 1702, color: 'Negro', talla: 'Long',    material: '20D Nylon', peso: 820, stock: 0, precio: 129990, estacion: 'INVIERNO' },
    ],
  },
  {
    id: 108, marcaId: 1, categoriaId: 1, estado: 'ACTIVO',
    nombre: 'Mochila Talon 22', precioBase: 84990, precioAnterior: null,
    descripcion: 'Mochila daypack para hiking y bike. Sistema AirScape para ventilación.',
    tag: 'STOCK BAJO', rating: 4.7, reviews: 96, color: '#A29A8E',
    features: ['Sistema AirScape', 'Bolsillo para hidratación', 'Compartimiento para casco', 'Bastones Stow-on-the-Go'],
    specs: { peso: '0.86 kg', capacidad: '22 L', tela: '210D Nylon', temporada: '3 Estaciones' },
    images: ['https://images.unsplash.com/photo-1545179605-1296651e9d43?auto=format&fit=crop&w=900&q=80'],
    variants: [
      { id: 1801, color: 'Negro', talla: 'S/M', material: '210D Nylon', peso: 860, stock: 2, precio: 84990, estacion: 'TODAS' },
      { id: 1802, color: 'Verde', talla: 'M/L', material: '210D Nylon', peso: 880, stock: 0, precio: 84990, estacion: 'TODAS' },
    ],
  },
  {
    id: 109, marcaId: 4, categoriaId: 6, estado: 'ACTIVO',
    nombre: 'Linterna Spot 400', precioBase: 34990, precioAnterior: null,
    descripcion: 'Frontal 400 lumens con sensor de proximidad y memoria de potencia.',
    tag: null, rating: 4.6, reviews: 145, color: '#454338',
    features: ['400 lumens', 'Sensor PowerTap', 'Resistente IPX8', 'Memoria de potencia'],
    specs: { peso: '88 g', lumens: '400', bateria: '3x AAA', certif: 'IPX8' },
    images: ['https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=900&q=80'],
    variants: [
      { id: 1901, color: 'Gris',    talla: 'Único', material: 'Policarbonato', peso: 88, stock: 12, precio: 34990, estacion: 'TODAS' },
      { id: 1902, color: 'Naranja', talla: 'Único', material: 'Policarbonato', peso: 88, stock: 11, precio: 34990, estacion: 'TODAS' },
    ],
  },
];

/* Compute display-aliased products that views already expect:
 *   .name = .nombre · .desc = .descripcion · .price = .precioBase
 *   .brand = marca.nombre · .category = categoria.nombre
 *   .stock = sum of variant stock · variant.size = variant.talla
 */
function enrichProduct(p, marcas, categorias) {
  const marca = marcas.find((m) => m.id === p.marcaId);
  const cat   = categorias.find((c) => c.id === p.categoriaId);
  const totalStock = p.variants.reduce((s, v) => s + v.stock, 0);
  return {
    ...p,
    // legacy aliases for existing views
    name:     p.nombre,
    desc:     p.descripcion,
    price:    p.precioBase,
    oldPrice: p.precioAnterior,
    brand:    (marca?.nombre || '').toUpperCase(),
    category: cat?.nombre || '',
    season:   p.variants[0]?.estacion === 'INVIERNO' ? 'Invierno' : p.variants[0]?.estacion === 'VERANO' ? 'Verano' : '4 Estaciones',
    stock:    totalStock,
    variants: p.variants.map((v) => ({ ...v, size: v.talla })),
  };
}

const PRODUCTOS_SEED = PRODUCTOS_RAW.map((p) => enrichProduct(p, MARCAS_SEED, CATEGORIAS_SEED));

/* Legacy export for backward compat (Featured.jsx, etc. read this) */
const PRODUCTS_SEED = PRODUCTOS_SEED;

/* ─── Descuentos (API shape) ──────────────────────────────────────────── */
const DESCUENTOS_SEED = [
  { id: 1, codigo: 'INVIERNO24', tipo: 'PORCENTAJE', valor: 0,    porcentaje: 20.0, fechaInicio: '2026-05-01', fechaFin: '2026-05-31', estado: 'ACTIVO',   usos: 124 },
  { id: 2, codigo: 'NUEVOSOCIO', tipo: 'PORCENTAJE', valor: 0,    porcentaje: 10.0, fechaInicio: '2026-01-01', fechaFin: '2026-12-31', estado: 'ACTIVO',   usos: 412 },
  { id: 3, codigo: 'ENVIOPRO',   tipo: 'FIJO',       valor: 5990, porcentaje: null, fechaInicio: '2026-04-01', fechaFin: '2026-06-30', estado: 'ACTIVO',   usos: 68  },
  { id: 4, codigo: 'PRIMAVERA',  tipo: 'PORCENTAJE', valor: 0,    porcentaje: 15.0, fechaInicio: '2026-09-01', fechaFin: '2026-11-30', estado: 'INACTIVO', usos: 0   },
];

const TESTIMONIALS = [
  { quote: 'Llevé la Atmos 65 al circuito del Huayhuash. Once días, ocho pasos sobre 4.700m. La suspensión Anti-Gravity hace que el equipo se sienta 5 kilos más liviano.',
    name: 'Camila Reyes', role: 'Guía UIAGM · Cordillera Blanca, Perú',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=70' },
  { quote: 'El despacho llegó en 48h a Bariloche, con factura de comercio internacional. Cumbre es la única tienda en español que entiende cómo trabajan los guías.',
    name: 'Iván Vargas', role: 'Instructor de alta montaña · AAGM',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=70' },
  { quote: 'La Guide Down Hoody resistió −18°C en la ruta normal del Aconcagua. La construcción box-baffle no migra, y el ajuste del hood sobre el casco es perfecto.',
    name: 'Sofía Mendieta', role: 'Mountaineer · 6 Sietemiles cumbreados',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=70' },
];

const FOOTER_COLUMNS = [
  { title: 'Tienda',  links: ['Indumentaria', 'Equipamiento', 'Calzado', 'Outlet · 40% OFF', 'Tarjetas de regalo'] },
  { title: 'Soporte', links: ['Envíos & devoluciones', 'Guía de tallas', 'Garantía de por vida', 'Estado de mi orden', 'Contacto'] },
  { title: 'Cumbre',  links: ['Nuestra historia', 'Embajadores', 'Expediciones patrocinadas', 'Trabaja con nosotros', 'Prensa'] },
];

const MARQUEE_ITEMS = [
  'ENVÍO GRATIS DESDE $80.000', 'GARANTÍA DE POR VIDA',
  '12 CUOTAS SIN INTERÉS', 'DESPACHO 48H A TODO EL PAÍS',
  'CAMBIO POR TALLA SIN COSTO', 'PUNTOS DE RETIRO EN 14 CIUDADES',
];

const fmt = (n) => '$' + Math.round(n).toLocaleString('es-CL').replaceAll(',', '.');

/* Backward-compat exports — Categorías/Marcas as data.jsx originally provided
 * them. Hero page also uses CATEGORIES (image tiles), kept separately. */
const CATEGORIES = CATEGORIES_HERO;

Object.assign(window, {
  NAV_ITEMS, CATEGORY_CHIPS, CATEGORIES, CATEGORIES_HERO,
  MARCAS_SEED, CATEGORIAS_SEED, PRODUCTOS_RAW, PRODUCTOS_SEED, PRODUCTS_SEED,
  DESCUENTOS_SEED,
  TESTIMONIALS, FOOTER_COLUMNS, MARQUEE_ITEMS, fmt, enrichProduct,
});
