// Ejemplo: cómo mostrar fotos Base64 de una variante
import { useFotosVariante } from '../hooks/useProductsFetch.js'
import { productService }   from '../api/productService.js'

export function VarianteFotos({ varianteId }) {
  const { data: fotos, loading, error } = useFotosVariante(varianteId)

  if (loading) return <p>Cargando fotos…</p>
  if (error)   return <p>Error: {error}</p>
  if (!fotos?.length) return <p>Sin fotos</p>

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {fotos.map((foto, i) => (
        <img
          key={i}
          src={productService.buildImageSrc(foto)}
          // equivalente a: src={`data:${foto.tipoContenido};base64,${foto.datos}`}
          alt={`Foto ${i + 1}`}
          style={{ width: 200, height: 200, objectFit: 'cover' }}
        />
      ))}
    </div>
  )
}
