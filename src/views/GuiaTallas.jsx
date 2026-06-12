export default function GuiaTallas() {
  const TABLAS = [
    {
      categoria: 'Ropa técnica',
      columnas: ['Talla', 'Pecho (cm)', 'Cintura (cm)', 'Cadera (cm)'],
      filas: [
        ['XS', '82–86',  '66–70',  '88–92'],
        ['S',  '86–90',  '70–74',  '92–96'],
        ['M',  '90–94',  '74–78',  '96–100'],
        ['L',  '94–98',  '78–82',  '100–104'],
        ['XL', '98–104', '82–88',  '104–110'],
        ['XXL','104–110','88–94',  '110–116'],
      ],
    },
    {
      categoria: 'Calzado técnico',
      columnas: ['Talla EU', 'Talla US H', 'Talla US M', 'CM'],
      filas: [
        ['38', '6',  '7',  '24'],
        ['39', '7',  '8',  '24.5'],
        ['40', '7.5','8.5','25.5'],
        ['41', '8',  '9',  '26'],
        ['42', '9',  '10', '26.5'],
        ['43', '9.5','10.5','27.5'],
        ['44', '10', '11', '28'],
        ['45', '11', '12', '28.5'],
        ['46', '12', '13', '29.5'],
      ],
    },
    {
      categoria: 'Mochilas',
      columnas: ['Talla', 'Torso (cm)', 'Peso recomendado (kg)'],
      filas: [
        ['XS/S', '40–46', 'hasta 18'],
        ['S/M',  '44–50', 'hasta 22'],
        ['M/L',  '48–56', 'hasta 28'],
        ['L/XL', '54–62', 'hasta 35'],
      ],
    },
  ]

  return (
    <div className="min-h-[60vh] bg-rock text-ivory px-6 lg:px-10 py-20 max-w-[1400px] mx-auto">
      <div className="mb-12">
        <div className="font-mono text-[10px] tracking-widest-2 uppercase text-ivory/45 mb-3">
          Soporte
        </div>
        <h1 className="font-display font-black tracking-tightest uppercase text-4xl lg:text-5xl mb-4">
          Guía de Tallas
        </h1>
        <p className="text-ivory/65 max-w-2xl text-sm lg:text-base leading-relaxed">
          Para una experiencia óptima en montaña, el ajuste correcto es tan importante como el equipo.
          Tomá tus medidas con cinta métrica flexible y compará con nuestras tablas.
        </p>
      </div>

      <div className="space-y-14">
        {TABLAS.map((tabla) => (
          <section key={tabla.categoria}>
            <h2 className="font-display font-black tracking-tightest uppercase text-xl mb-5">
              {tabla.categoria}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-ivory/20">
                    {tabla.columnas.map((col) => (
                      <th
                        key={col}
                        className="font-mono text-[10px] tracking-widest-2 uppercase text-ivory/45 text-left py-3 pr-8"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tabla.filas.map((fila, i) => (
                    <tr
                      key={i}
                      className="border-b border-ivory/10 hover:bg-ivory/5 transition-colors"
                    >
                      {fila.map((celda, j) => (
                        <td
                          key={j}
                          className={`py-3 pr-8 ${j === 0 ? 'font-bold text-ivory' : 'text-ivory/75'}`}
                        >
                          {celda}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      <div className="mt-14 p-6 border border-ivory/15 rounded-sm">
        <div className="font-mono text-[10px] tracking-widest-2 uppercase text-ivory/45 mb-2">
          Consejo
        </div>
        <p className="text-ivory/65 text-sm leading-relaxed">
          Si estás entre dos tallas, optá por la más grande en ropa de capas base y la más pequeña
          en botas. Ante cualquier duda, nuestro equipo de guías certificados está disponible para
          asesorarte.
        </p>
      </div>
    </div>
  )
}
