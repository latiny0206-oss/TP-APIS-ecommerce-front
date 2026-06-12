# Cumbre — E-commerce de Equipamiento de Expedición

Aplicación frontend de e-commerce para la tienda ficticia **Cumbre Expedition Equipment**. Permite navegar el catálogo de productos, gestionar el carrito, completar el flujo de checkout y administrar el negocio desde un panel de control interno.

---

## Tecnologías utilizadas

| Categoría | Tecnología |
|---|---|
| Framework UI | React 18 |
| Bundler | Vite 6 |
| Estado global | Context API + useReducer (sin dependencias externas) |
| Estilos | Tailwind CSS 3 |
| Iconos | Lucide React |
| Tooling CSS | PostCSS + Autoprefixer |

---

## Requisitos previos

- **Node.js** v18 o superior
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
| Rol | Administrador → redirige al panel de administración |

Para un login fallido ingresá cualquier combinación que no coincida con las anteriores.

### Cupones de descuento

| Código | Descuento |
|---|---|
| `DESCUENTO10` | 10% sobre el total |
| `INVIERNO24` | 20% sobre el total |

---

## Estructura del proyecto

```
src/
├── App.jsx                    # Router principal (navegación basada en estado)
├── main.jsx                   # Punto de entrada, árbol de Providers
├── index.css                  # Estilos globales y utilidades CSS
│
├── mocks/
│   └── data.js                # Datos de prueba: usuarios, productos, pedidos y cupones
│
├── data/
│   └── index.js               # Constantes de UI (nav items, categorías, footer, etc.)
│
├── context/
│   ├── NavigationContext.jsx  # Router por estado (vista activa + parámetros)
│   ├── AuthContext.jsx        # Autenticación: login, logout, registro
│   ├── CartContext.jsx        # Carrito con persistencia en localStorage
│   └── ProductsContext.jsx    # Catálogo de productos para el panel admin
│
├── components/
│   ├── Navbar.jsx             # Barra de navegación con auth y badge de carrito
│   ├── HeroSection.jsx        # Sección hero del home con imagen de fondo
│   ├── Categories.jsx         # Grilla de categorías con conteo dinámico
│   ├── Featured.jsx           # Productos destacados
│   ├── Footer.jsx             # Pie de página con columnas de links
│   └── ui/
│       ├── Button.jsx         # Botón reutilizable con variantes de estilo
│       ├── ProductCard.jsx    # Card de producto con quick-add al carrito
│       ├── SectionHeader.jsx  # Encabezado de sección con eyebrow y título
│       ├── StatusBadge.jsx    # Badge de estado/etiqueta de producto
│       └── Toast.jsx          # Notificación de producto agregado al carrito
│
└── views/
    ├── Login.jsx              # Pantalla de inicio de sesión
    ├── Registro.jsx           # Pantalla de registro de cuenta
    ├── Catalogo.jsx           # Listado de productos con filtros y persistencia
    ├── ProductoDetalle.jsx    # Detalle de producto con selector de talle y stock dinámico
    ├── Carrito.jsx            # Carrito con cupones y resumen de compra
    ├── Checkout.jsx           # Flujo de checkout en 3 pasos (envío, pago, confirmación)
    ├── Perfil.jsx             # Cuenta del usuario e historial de pedidos
    ├── FAQ.jsx                # Preguntas frecuentes
    ├── Contacto.jsx           # Formulario de contacto
    ├── GuiaTallas.jsx         # Guía de talles
    └── admin/
        ├── AdminLayout.jsx    # Layout del panel admin con sidebar de navegación
        ├── AdminDashboard.jsx # Tablero con KPIs, órdenes recientes y alertas de stock
        ├── AdminProducts.jsx  # ABM de productos con drawer de edición
        ├── AdminVariants.jsx  # Gestión de variantes de producto (color + talle)
        ├── AdminCatalog.jsx   # Catálogo visual de productos activos
        ├── AdminDiscounts.jsx # Alta y gestión de cupones de descuento
        ├── AdminOrders.jsx    # Listado y gestión de órdenes
        ├── AdminUsers.jsx     # Gestión de usuarios y roles
        └── AdminPhotos.jsx    # Gestión de imágenes con cola de subida simulada
```

---

## Arquitectura de estado

El proyecto usa **Context API + useReducer** como capa de estado global, sin dependencias externas (no Redux):

| Contexto | Responsabilidad |
|---|---|
| `NavigationContext` | Vista activa y parámetros de ruta (reemplaza React Router) |
| `AuthContext` | Usuario autenticado, login/logout/registro |
| `CartContext` | Ítems del carrito, cupones, totales — persistido en `localStorage` |
| `ProductsContext` | Estado mutable de productos para el panel admin |

---

## Navegación

La app usa un **router por estado** propio (sin React Router DOM). La función `navigate(view)` actualiza el contexto y sincroniza `window.history`. Las vistas se registran en `KNOWN_VIEWS` dentro de `NavigationContext.jsx`.

---

## Nota sobre la carpeta `cumbre-ecommerce/`

Esta carpeta contiene el **prototipo de diseño HTML/CSS/JS** exportado desde la herramienta de diseño (Claude Design) que sirvió como referencia visual durante el desarrollo. No es código productivo ni forma parte del build de Vite — está listada en `.gitignore`.
