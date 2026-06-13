import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ArrowLeft } from 'lucide-react'

const FAQ_DATA = [
  {
    categoria: 'Envíos',
    items: [
      { id: 'e1', pregunta: '¿Cuánto tarda el envío?', respuesta: 'El envío express llega en 48 horas hábiles a la mayoría de las ciudades del país. Zonas alejadas o patagónicas pueden requerir hasta 5 días hábiles. Una vez despachado tu paquete, te enviamos el número de seguimiento por email.' },
      { id: 'e2', pregunta: '¿Hacen envíos a todo el país?', respuesta: 'Sí, enviamos a todo el territorio nacional. El envío es gratuito para compras mayores a $80.000. Para montos inferiores, el costo de envío se calcula en el checkout según tu código postal.' },
      { id: 'e3', pregunta: '¿Cómo hago el seguimiento de mi pedido?', respuesta: 'Al despachar tu pedido te enviamos un email con el número de tracking y el enlace al portal del correo. También podés consultar el estado desde "Estado de mi orden" en la sección Soporte.' },
    ],
  },
  {
    categoria: 'Devoluciones',
    items: [
      { id: 'd1', pregunta: '¿Cuál es la política de devoluciones?', respuesta: 'Aceptamos devoluciones dentro de los 30 días posteriores a la recepción del producto, siempre que esté sin usar, con etiquetas originales y en su embalaje. Los productos de la línea Pro tienen garantía de por vida contra defectos de fabricación.' },
      { id: 'd2', pregunta: '¿Cómo inicio una devolución?', respuesta: 'Escribinos a contacto@cumbre.com con tu número de orden y el motivo de la devolución. Nuestro equipo te responderá en 48 hs con las instrucciones para el envío del producto. El costo de devolución es sin cargo para cambios de talle.' },
    ],
  },
  {
    categoria: 'Productos',
    items: [
      { id: 'p1', pregunta: '¿Los productos tienen garantía?', respuesta: 'Todos los productos de la línea Pro cuentan con garantía de por vida contra defectos de fabricación. El resto de la línea tiene garantía de 12 meses. La garantía no cubre el desgaste normal por uso.' },
      { id: 'p2', pregunta: '¿Cómo elijo el talle correcto?', respuesta: 'Cada producto tiene una guía de talles disponible en su página de detalle. Para indumentaria, recomendamos medir pecho, cintura y cadera y comparar con la tabla. Para calzado, medí tu pie en centímetros y consultá la equivalencia en la guía de talles del footer.' },
    ],
  },
  {
    categoria: 'Pagos',
    items: [
      { id: 'pa1', pregunta: '¿Qué medios de pago aceptan?', respuesta: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express), transferencia bancaria (CBU/alias) y billeteras virtuales (Mercado Pago y Modo). Todos los pagos son procesados de forma segura con encriptación SSL.' },
      { id: 'pa2', pregunta: '¿Puedo pagar en cuotas?', respuesta: 'Sí. Con tarjetas de crédito ofrecemos hasta 12 cuotas sin interés en toda la tienda. Las cuotas disponibles varían según el banco y el monto. El plan de cuotas se muestra en el checkout antes de confirmar la compra.' },
    ],
  },
]

function AccordionItem({ item, isOpen, onToggle }) {
  return (
    <div className="border-b border-rock/10 last:border-b-0">
      <button onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
        aria-expanded={isOpen}>
        <span className={`font-narrow font-bold uppercase tracking-tight text-base transition-colors ${isOpen ? 'text-pine' : 'text-rock group-hover:text-pine'}`}>
          {item.pregunta}
        </span>
        <ChevronDown size={18} strokeWidth={2}
          className={`shrink-0 text-rock/40 transition-transform duration-300 ${isOpen ? 'rotate-180 text-pine' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-[max-height] duration-300 ease-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
        <p className="pb-5 text-rock/70 leading-relaxed">{item.respuesta}</p>
      </div>
    </div>
  )
}

export default function FAQ() {
  const [openId, setOpenId] = useState(null)
  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id))

  return (
    <div className="bg-ivory text-rock min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 lg:py-14">

        <nav className="flex items-center gap-2 font-mono text-[11px] tracking-widest-2 uppercase text-rock/55 mb-8">
          <Link to="/" className="hover:text-alpenglow transition-colors">Inicio</Link>
          <span className="text-rock/30">›</span>
          <span className="text-rock">Preguntas frecuentes</span>
        </nav>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[11px] tracking-widest-2 uppercase text-alpenglow">Ayuda</span>
            <span className="h-px w-12 bg-rock/20" />
          </div>
          <h1 className="font-display font-black tracking-tightest uppercase text-5xl lg:text-7xl leading-[0.9] mb-4">
            Preguntas<br />frecuentes
          </h1>
          <p className="text-rock/60 max-w-xl text-base lg:text-lg">
            Si no encontrás la respuesta que buscás,{' '}
            <Link to="/contacto" className="text-pine hover:underline font-medium">
              escribinos
            </Link>.
          </p>
        </div>

        <div className="max-w-3xl space-y-10">
          {FAQ_DATA.map((cat) => (
            <section key={cat.categoria}>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-[10px] tracking-widest-2 uppercase text-alpenglow">{cat.categoria}</span>
                <span className="h-px flex-1 bg-rock/10" />
              </div>
              <div className="bg-white border border-rock/10 divide-y divide-rock/0 px-6">
                {cat.items.map((item) => (
                  <AccordionItem key={item.id} item={item} isOpen={openId === item.id} onToggle={() => toggle(item.id)} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-14 max-w-3xl bg-rock text-ivory p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="font-mono text-[10px] tracking-widest-2 uppercase text-alpenglow mb-2">¿Necesitás más ayuda?</div>
            <p className="font-narrow font-bold uppercase tracking-tight text-lg">
              Nuestro equipo responde en menos de 48 horas.
            </p>
          </div>
          <Link to="/contacto"
            className="shrink-0 h-11 px-6 bg-alpenglow hover:bg-alpenglow-700 text-ivory font-narrow font-bold uppercase tracking-widest-2 text-sm transition-colors">
            Contactarnos
          </Link>
        </div>

        <div className="mt-10">
          <Link to="/"
            className="inline-flex items-center gap-2 font-mono text-[11px] tracking-widest-2 uppercase text-rock/55 hover:text-rock transition-colors">
            <ArrowLeft size={12} /> Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
