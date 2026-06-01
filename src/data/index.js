// ─── Navigation ───────────────────────────────────────────────────────────────
export const NAV_ITEMS = [
  { label: 'Indumentaria', view: 'indumentaria' },
  { label: 'Calzado',      view: 'calzado' },
  { label: 'Accesorios',   view: 'accesorios' },
]

export const MARQUEE_ITEMS = [
  'ENVÍO GRATIS DESDE $80.000',
  'GARANTÍA DE POR VIDA',
  '12 CUOTAS SIN INTERÉS',
  'DESPACHO 48H A TODO EL PAÍS',
  'CAMBIO POR TALLA SIN COSTO',
  'PUNTOS DE RETIRO EN 14 CIUDADES',
]

// ─── Hero ─────────────────────────────────────────────────────────────────────
export const HERO_IMAGES = {
  midnight: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=2000&q=80',
  ridge:    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80',
  glacier:  'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=2000&q=80',
}

// ─── Categories ───────────────────────────────────────────────────────────────
export const CATEGORY_CHIPS = [
  { id: 'todos', label: 'Todos' },
  { id: 'invierno', label: 'Invierno' },
  { id: 'trekking', label: 'Trekking' },
  { id: 'escalada', label: 'Escalada' },
  { id: 'camping', label: 'Camping' },
]

export const CATEGORIES = [
  {
    id: 'campamento',
    title: 'Campamento',
    sub: '24 productos · Carpas, sacos, esterillas',
    img: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1400&q=70',
    iconKey: 'tent',
  },
  {
    id: 'calzado',
    title: 'Calzado Técnico',
    sub: '38 productos · Botas, crampones, aproximación',
    img: 'https://images.unsplash.com/photo-1606471191009-63994c53433b?auto=format&fit=crop&w=1400&q=70',
    iconKey: 'boot',
  },
  {
    id: 'ropa',
    title: 'Ropa Técnica',
    sub: '86 productos · Capas, hardshell, plumas',
    img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1400&q=70',
    iconKey: 'jacket',
  },
]

// ─── Taxonomías ───────────────────────────────────────────────────────────────
export const MARCAS = [
  { id: 1, nombre: 'Osprey' },
  { id: 2, nombre: 'Marmot' },
  { id: 3, nombre: 'Petzl' },
  { id: 4, nombre: 'Black Diamond' },
  { id: 5, nombre: 'Cumbre Pro' },
  { id: 6, nombre: 'Salomon' },
  { id: 7, nombre: 'MSR' },
]

export const CATEGORIAS = [
  { id: 1, nombre: 'Mochilas' },
  { id: 2, nombre: 'Carpas' },
  { id: 3, nombre: 'Sacos de Dormir' },
  { id: 4, nombre: 'Calzado Técnico' },
  { id: 5, nombre: 'Ropa Técnica' },
  { id: 6, nombre: 'Accesorios' },
  { id: 7, nombre: 'Escalada' },
]

// ─── Productos completos (con variantes para el admin) ───────────────────────
export const PRODUCTS_SEED = [
  {
    id: 101, marcaId: 1, categoriaId: 1, estado: 'ACTIVO',
    nombre: 'Mochila Atmos AG 65',
    name:   'Mochila Atmos AG 65',
    brand:  'OSPREY',
    precioBase: 89990, precioAnterior: 112000,
    price: 89990, oldPrice: 112000,
    descuentoPct: 0,
    descripcion: 'La mochila de trekking más vendida con sistema Anti-Gravity.',
    tag: 'INVIERNO', rating: 4.9, color: '#2A3B3F', stock: 14,
    images: ['https://images.unsplash.com/photo-1622260614153-03223fb72052?auto=format&fit=crop&w=900&q=80'],
    image:  'https://images.unsplash.com/photo-1622260614153-03223fb72052?auto=format&fit=crop&w=900&q=80',
    variants: [
      { id: 1101, color: 'Azul Marino', talla: 'S', stock: 3, precio: 89990 },
      { id: 1102, color: 'Azul Marino', talla: 'M', stock: 4, precio: 89990 },
      { id: 1103, color: 'Azul Marino', talla: 'L', stock: 2, precio: 89990 },
      { id: 1104, color: 'Verde Oliva', talla: 'M', stock: 5, precio: 89990 },
    ],
  },
  {
    id: 102, marcaId: 2, categoriaId: 5, estado: 'ACTIVO',
    nombre: 'Chaqueta Guide Down Hoody',
    name:   'Chaqueta Guide Down Hoody',
    brand:  'MARMOT',
    precioBase: 189990, precioAnterior: 229990,
    price: 189990, oldPrice: 229990,
    descuentoPct: 0,
    descripcion: 'Chaqueta de pluma 800 fill power para alpinismo extremo.',
    tag: 'INVIERNO', rating: 4.8, color: '#1F252B', stock: 9,
    images: ['https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=900&q=80'],
    image:  'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=900&q=80',
    variants: [
      { id: 1201, color: 'Negro', talla: 'S', stock: 3, precio: 189990 },
      { id: 1202, color: 'Negro', talla: 'M', stock: 4, precio: 189990 },
      { id: 1204, color: 'Rojo',  talla: 'M', stock: 2, precio: 189990 },
    ],
  },
  {
    id: 103, marcaId: 3, categoriaId: 7, estado: 'ACTIVO',
    nombre: 'Piolet Summit Evo',
    name:   'Piolet Summit Evo',
    brand:  'PETZL',
    precioBase: 145500, precioAnterior: null,
    price: 145500, oldPrice: null,
    descuentoPct: 0,
    descripcion: 'Piolet técnico ligero de aleación 7075 para alpinismo clásico.',
    tag: 'TODO TERRENO', rating: 4.9, color: '#1F252B', stock: 5,
    images: ['https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80'],
    image:  'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
    variants: [
      { id: 1301, color: 'Naranja', talla: '52cm', stock: 3, precio: 145500 },
      { id: 1302, color: 'Naranja', talla: '60cm', stock: 2, precio: 145500 },
    ],
  },
  {
    id: 104, marcaId: 4, categoriaId: 7, estado: 'ACTIVO',
    nombre: 'Set ATC-Guide Alpine',
    name:   'Set ATC-Guide Alpine',
    brand:  'BLACK DIAMOND',
    precioBase: 42990, precioAnterior: null,
    price: 42990, oldPrice: null,
    descuentoPct: 0,
    descripcion: 'Aseguradora multifunción para roca, hielo y rappel.',
    tag: 'NUEVO', rating: 4.7, color: '#3A4147', stock: 18,
    images: ['https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=900&q=80'],
    image:  'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=900&q=80',
    variants: [
      { id: 1401, color: 'Naranja', talla: 'Único', stock: 12, precio: 42990 },
      { id: 1402, color: 'Gris',    talla: 'Único', stock: 6,  precio: 42990 },
    ],
  },
  {
    id: 105, marcaId: 6, categoriaId: 4, estado: 'ACTIVO',
    nombre: 'Bota X Ultra 4 GTX',
    name:   'Bota X Ultra 4 GTX',
    brand:  'SALOMON',
    precioBase: 89990, precioAnterior: 109990,
    price: 89990, oldPrice: 109990,
    descuentoPct: 0,
    descripcion: 'Bota mid-cut con Gore-Tex y suela Contagrip.',
    tag: 'BESTSELLER', rating: 4.6, color: '#1F252B', stock: 1,
    images: ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80'],
    image:  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80',
    variants: [
      { id: 1503, color: 'Negro', talla: '42', stock: 1, precio: 89990 },
    ],
  },
  {
    id: 106, marcaId: 7, categoriaId: 2, estado: 'ACTIVO',
    nombre: 'Carpa Domo Polar 2P',
    name:   'Carpa Domo Polar 2P',
    brand:  'MSR',
    precioBase: 439990, precioAnterior: 549990,
    price: 439990, oldPrice: 549990,
    descuentoPct: 0,
    descripcion: 'Carpa 4 estaciones para expedición con varillas DAC.',
    tag: null, rating: 4.8, color: '#2F4538', stock: 4,
    images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=900&q=80'],
    image:  'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=900&q=80',
    variants: [
      { id: 1601, color: 'Naranja', talla: '2P', stock: 4, precio: 439990 },
    ],
  },
  {
    id: 107, marcaId: 5, categoriaId: 3, estado: 'ACTIVO',
    nombre: 'Saco Ultra Light -5°C',
    name:   'Saco Ultra Light -5°C',
    brand:  'CUMBRE PRO',
    precioBase: 129990, precioAnterior: null,
    price: 129990, oldPrice: null,
    descuentoPct: 0,
    descripcion: 'Saco de pluma 700 fill, confort hasta -5°C.',
    tag: 'AGOTADO', rating: 4.5, color: '#2A3137', stock: 0,
    images: ['https://images.unsplash.com/photo-1528123792456-128c8a51bf80?auto=format&fit=crop&w=900&q=80'],
    image:  'https://images.unsplash.com/photo-1528123792456-128c8a51bf80?auto=format&fit=crop&w=900&q=80',
    variants: [
      { id: 1701, color: 'Verde', talla: 'Regular', stock: 0, precio: 129990 },
    ],
  },
  {
    id: 108, marcaId: 1, categoriaId: 1, estado: 'ACTIVO',
    nombre: 'Mochila Talon 22',
    name:   'Mochila Talon 22',
    brand:  'OSPREY',
    precioBase: 84990, precioAnterior: null,
    price: 84990, oldPrice: null,
    descuentoPct: 0,
    descripcion: 'Mochila daypack para hiking con sistema AirScape.',
    tag: 'STOCK BAJO', rating: 4.7, color: '#A29A8E', stock: 2,
    images: ['https://images.unsplash.com/photo-1545179605-1296651e9d43?auto=format&fit=crop&w=900&q=80'],
    image:  'https://images.unsplash.com/photo-1545179605-1296651e9d43?auto=format&fit=crop&w=900&q=80',
    variants: [
      { id: 1801, color: 'Negro', talla: 'S/M', stock: 2, precio: 84990 },
    ],
  },
]

export const FEATURED_PRODUCTS = PRODUCTS_SEED.slice(0, 4)

// ─── Testimonials ─────────────────────────────────────────────────────────────
export const TESTIMONIALS = [
  {
    quote: 'Llevé la Atmos 65 al circuito del Huayhuash. Once días, ocho pasos sobre 4.700m. La suspensión Anti-Gravity hace que el equipo se sienta 5 kilos más liviano.',
    name:  'Camila Reyes',
    role:  'Guía UIAGM · Cordillera Blanca, Perú',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=70',
  },
  {
    quote: 'El despacho llegó en 48h a Bariloche, con factura de comercio internacional. Cumbre es la única tienda en español que entiende cómo trabajan los guías.',
    name:  'Iván Vargas',
    role:  'Instructor de alta montaña · AAGM',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=70',
  },
  {
    quote: 'La Guide Down Hoody resistió −18°C en la ruta normal del Aconcagua. La construcción box-baffle no migra, y el ajuste del hood sobre el casco es perfecto.',
    name:  'Sofía Mendieta',
    role:  'Mountaineer · 6 Sietemiles cumbreados',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=70',
  },
]

// ─── Footer ───────────────────────────────────────────────────────────────────
export const FOOTER_COLUMNS = [
  {
    title: 'Tienda',
    links: ['Indumentaria', 'Equipamiento', 'Calzado', 'Outlet · 40% OFF', 'Tarjetas de regalo'],
  },
  {
    title: 'Soporte',
    links: ['Envíos & devoluciones', 'Guía de tallas', 'Garantía de por vida', 'Estado de mi orden', 'Contacto'],
  },
  {
    title: 'Cumbre',
    links: ['Nuestra historia', 'Embajadores', 'Expediciones patrocinadas', 'Trabaja con nosotros', 'Prensa'],
  },
]

export const FOOTER_LEGAL_LINKS = [
  'Política de privacidad',
  'Términos de servicio',
  'Información de envío',
  'Contacto',
]

// ─── Trust strip ──────────────────────────────────────────────────────────────
export const TRUST_ITEMS = [
  { iconKey: 'truck',   label: 'Envío express',  sub: '48h a todo el país' },
  { iconKey: 'shield',  label: 'Garantía Pro',   sub: 'De por vida' },
  { iconKey: 'compass', label: 'Asesoría 1:1',   sub: 'Guías certificados' },
  { iconKey: 'check',   label: 'Cambios fáciles', sub: 'Hasta 30 días' },
]

// ─── Tag styles ───────────────────────────────────────────────────────────────
export const TAG_STYLES = {
  INVIERNO:       { bg: 'bg-alpenglow',    text: 'text-ivory',    border: 'border-alpenglow' },
  'TODO TERRENO': { bg: 'bg-ivory',        text: 'text-rock',     border: 'border-ivory' },
  NUEVO:          { bg: 'bg-pine',         text: 'text-ivory',    border: 'border-pine' },
  BESTSELLER:     { bg: 'bg-rock',         text: 'text-ivory',    border: 'border-rock' },
  AGOTADO:        { bg: 'bg-rock/80',      text: 'text-ivory',    border: 'border-ivory/10' },
  'STOCK BAJO':   { bg: 'bg-alpenglow/15', text: 'text-alpenglow', border: 'border-alpenglow/40' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const fmt = (n) =>
  '$' + Math.round(n).toLocaleString('es-CL').replaceAll(',', '.')

export const computePrice = (product) => ({
  price:    product.descuentoPct > 0
    ? Math.round(product.precioBase * (1 - product.descuentoPct / 100))
    : product.precioBase,
  oldPrice: product.descuentoPct > 0 ? product.precioBase : product.precioAnterior,
})
