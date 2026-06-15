export const fmtPrice = (n) =>
  '$' + Math.round(n).toLocaleString('es-CL').replaceAll(',', '.')

export const precioFinal = (producto) =>
  (producto.descuento ?? producto.descuentoPct ?? 0) > 0
    ? Math.round(producto.precio * (1 - (producto.descuento ?? producto.descuentoPct) / 100))
    : producto.precio
