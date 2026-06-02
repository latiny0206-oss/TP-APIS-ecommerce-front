# Cumbre — E-commerce de Equipamiento de Expedición

Aplicación frontend de e-commerce para la tienda ficticia **Cumbre Expedition Equipment**. Permite navegar el catálogo de productos, gestionar el carrito, completar el flujo de checkout y administrar productos desde un panel de control interno.

---

## Tecnologías utilizadas

| Categoría | Tecnología |
|---|---|
| Framework UI | React 18 |
| Bundler | Vite 6 |
| Estado global | Redux Toolkit + React Redux |
| Estilos | Tailwind CSS 3 |
| Iconos | Lucide React |
| Tooling CSS | PostCSS + Autoprefixer |

---

## Requisitos previos

- **Node.js** v18 o superior (desarrollado con v24)
- **npm** v9 o superior (incluido con Node)

---

## Instalación y ejecución

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd TP-APIS-ecommerce-front

# 2. Instalar dependencias
npm install

# 3. Correr en modo desarrollo (http://localhost:5173)
npm run dev

# 4. Build para producción
npm run build

# 5. Previsualizar el build de producción localmente
npm run preview
```

---

## Credenciales de prueba

### Login — Usuario

| Campo | Valor |
|---|---|
| Email | `usuario@test.com` |
| Contraseña | `123456` |

### Login — Administrador

| Campo | Valor |
|---|---|
| Email | `admin@cumbre.com` |
| Contraseña | `admin123` |
| Rol | Administrador → accede al panel en `/admin` |

Para un login fallido ingresar cualquier mail + contraseña que no sean los de arriba.

### Cupones de descuento

| Código | Descuento |
|---|---|
| `DESCUENTO10` | 10% sobre el total |
| `INVIERNO24` | 20% sobre el total |

---

## Estructura del proyecto

```
src/
├── App.jsx                  # Router principal (navegación basada en Redux)
├── main.jsx                 # Punto de entrada, Provider de Redux
├── index.css                # Estilos globales y utilidades CSS
│
├── mocks/
│   └── data.js              # Datos de prueba: usuarios, productos y cupones
│
├── data/
│   └── index.js             # Constantes de UI (nav items, categorías, textos)
│
├── store/
│   ├── index.js             # Configuración del store y persistencia en localStorage
│   ├── authSlice.js         # Estado de autenticación (login/logout)
│   ├── cartSlice.js         # Estado del carrito con persistencia en localStorage
│   ├── navigationSlice.js   # Router por estado (vista activa y parámetros)
│   ├── landingSlice.js      # Estado de UI del home (menú mobile, variante hero)
│   ├── productsSlice.js     # Catálogo de productos para el panel admin
│   └── adminSlice.js        # Estado del drawer de alta/edición de productos
│
├── components/
│   ├── Navbar.jsx           # Barra de navegación con auth y badge de carrito
│   ├── HeroSection.jsx      # Sección hero del home con imagen de fondo
│   ├── Categories.jsx       # Grilla de categorías con navegación
│   ├── Featured.jsx         # Productos destacados con trust strip
│   ├── Footer.jsx           # Pie de página con columnas de links
│   └── ui/
│       ├── Button.jsx       # Botón reutilizable con variantes de estilo
│       ├── ProductCard.jsx  # Card de producto con quick-add al carrito
│       ├── SectionHeader.jsx# Encabezado de sección con eyebrow y título
│       ├── StatusBadge.jsx  # Badge de estado/etiqueta de producto
│       └── Toast.jsx        # Notificación de producto agregado al carrito
│
└── views/
    ├── Login.jsx            # Pantalla de inicio de sesión
    ├── Registro.jsx         # Pantalla de registro de cuenta
    ├── Catalogo.jsx         # Listado de productos por categoría
    ├── ProductoDetalle.jsx  # Detalle de producto con selector de talle
    ├── Carrito.jsx          # Carrito con cupones y resumen de compra
    ├── Checkout.jsx         # Flujo de checkout en 3 pasos (envío, pago, confirmación)
    └── admin/
        ├── AdminLayout.jsx  # Layout del panel admin con sidebar de navegación
        ├── AdminDashboard.jsx # Tablero con KPIs y alertas de stock
        ├── AdminProducts.jsx  # ABM de productos con campo de descuento
        └── AdminPhotos.jsx    # Gestión de imágenes con cola de subida simulada
```
