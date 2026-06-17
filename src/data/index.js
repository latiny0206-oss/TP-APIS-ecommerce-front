// ─── Navigation ───────────────────────────────────────────────────────────────
export const NAV_ITEMS = [
  { label: 'Indumentaria', to: '/catalogo?categoria=indumentaria', categoria: 'indumentaria' },
  { label: 'Calzado',      to: '/catalogo?categoria=calzado',      categoria: 'calzado' },
  { label: 'Equipamiento', to: '/catalogo?categoria=equipamiento', categoria: 'equipamiento' },
]

export const MARQUEE_ITEMS = [
  'ENVÍO GRATIS DESDE $80.000',
  'GARANTÍA DE POR VIDA EN LÍNEA PRO',
  '12 CUOTAS SIN INTERÉS',
  'DESPACHO 48H A TODO EL PAÍS',
  'CAMBIO POR TALLA SIN COSTO',
  'PUNTOS DE RETIRO EN 14 CIUDADES',
]

// ─── Hero ─────────────────────────────────────────────────────────────────────
export const HERO_IMAGES = {
  midnight: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2000&q=80',
  ridge:    'https://images.unsplash.com/photo-1557481457-d8e8ca4cd404?auto=format&fit=crop&w=2000&q=80',
  glacier:  'https://images.unsplash.com/photo-1577373482643-5c7ccf8f0ac9?auto=format&fit=crop&w=2000&q=80',
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
    id: 'equipamiento',
    title: 'Equipamiento',
    sub: 'Mochilas, Linternas, Bastones',
    img: 'https://images.unsplash.com/photo-1586022045497-31fcf76fa6cc?auto=format&fit=crop&w=1400&q=70',
    iconKey: 'tent',
    categoriaKey: 'equipamiento',
  },
  {
    id: 'calzado',
    title: 'Calzado',
    sub: 'Botas, Zapatillas, Sandalias',
    img: 'https://images.unsplash.com/photo-1779812773752-3d19944bf291?auto=format&fit=crop&w=1400&q=70',
    iconKey: 'boot',
    categoriaKey: 'calzado',
  },
  {
    id: 'ropa',
    title: 'Indumentaria',
    sub: 'Chaquetas, Pantalones, Remeras',
    img: 'https://images.unsplash.com/photo-1634040843188-5ca36cf26cc1?auto=format&fit=crop&w=1400&q=70',
    iconKey: 'jacket',
    categoriaKey: 'indumentaria',
  },
]

// ─── Productos seed (referencia visual, no se usa en producción) ──────────────
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
    images: ['https://images.unsplash.com/photo-1739133303086-7ef752fffc53?auto=format&fit=crop&w=900&q=80'],
    image:  'https://images.unsplash.com/photo-1739133303086-7ef752fffc53?auto=format&fit=crop&w=900&q=80',
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
    images: ['https://images.unsplash.com/photo-1602471615287-d733c59b79c4?auto=format&fit=crop&w=900&q=80'],
    image:  'https://images.unsplash.com/photo-1602471615287-d733c59b79c4?auto=format&fit=crop&w=900&q=80',
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
    images: ['https://images.unsplash.com/photo-1771733360392-6d1d8d55b03f?auto=format&fit=crop&w=900&q=80'],
    image:  'https://images.unsplash.com/photo-1771733360392-6d1d8d55b03f?auto=format&fit=crop&w=900&q=80',
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
    images: ['https://images.unsplash.com/photo-1772428278877-98333687e044?auto=format&fit=crop&w=900&q=80'],
    image:  'https://images.unsplash.com/photo-1772428278877-98333687e044?auto=format&fit=crop&w=900&q=80',
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
    images: ['https://images.unsplash.com/photo-1760465809553-ddcbe4bb4753?auto=format&fit=crop&w=900&q=80'],
    image:  'https://images.unsplash.com/photo-1760465809553-ddcbe4bb4753?auto=format&fit=crop&w=900&q=80',
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
    images: ['https://images.unsplash.com/photo-1464547323744-4edd0cd0c746?auto=format&fit=crop&w=900&q=80'],
    image:  'https://images.unsplash.com/photo-1464547323744-4edd0cd0c746?auto=format&fit=crop&w=900&q=80',
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
    images: ['https://images.unsplash.com/photo-1558477280-1bfed08ea5db?auto=format&fit=crop&w=900&q=80'],
    image:  'https://images.unsplash.com/photo-1558477280-1bfed08ea5db?auto=format&fit=crop&w=900&q=80',
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
    images: ['https://images.unsplash.com/photo-1617303484945-f7b0097604fb?auto=format&fit=crop&w=900&q=80'],
    image:  'https://images.unsplash.com/photo-1617303484945-f7b0097604fb?auto=format&fit=crop&w=900&q=80',
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
    avatar: 'https://images.unsplash.com/photo-1770034849260-2e67f8f423a0?auto=format&fit=crop&w=200&q=70',
  },
  {
    quote: 'El despacho llegó en 48h a Bariloche, con factura de comercio internacional. Cumbre es la única tienda en español que entiende cómo trabajan los guías.',
    name:  'Iván Vargas',
    role:  'Instructor de alta montaña · AAGM',
    avatar: 'https://images.unsplash.com/photo-1632130746510-922d81ad845d?auto=format&fit=crop&w=200&q=70',
  },
  {
    quote: 'La Guide Down Hoody resistió −18°C en la ruta normal del Aconcagua. La construcción box-baffle no migra, y el ajuste del hood sobre el casco es perfecto.',
    name:  'Sofía Mendieta',
    role:  'Mountaineer · 6 Sietemiles cumbreados',
    avatar: 'https://images.unsplash.com/photo-1637692513738-68ed61f6604a?auto=format&fit=crop&w=200&q=70',
  },
]

// ─── Footer ───────────────────────────────────────────────────────────────────
export const FOOTER_COLUMNS = [
  {
    title: 'Tienda',
    links: [
      { label: 'Productos',    to: '/catalogo' },
      { label: 'Indumentaria', to: '/catalogo?categoria=indumentaria' },
      { label: 'Equipamiento', to: '/catalogo?categoria=equipamiento' },
      { label: 'Calzado',      to: '/catalogo?categoria=calzado' },
    ],
  },
  {
    title: 'Soporte',
    links: [
      { label: 'Preguntas Frecuentes', to: '/faq' },
      { label: 'Guía de tallas',       to: '/guia-tallas' },
      { label: 'Estado de mi orden',   to: '/cuenta/ordenes', requiresAuth: true },
    ],
  },
]

export const FOOTER_LEGAL_LINKS = [
  { label: 'Contacto', to: '/contacto' },
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
