/* Mock REST API — simulates the Postman collection with setTimeout-based promises.
 *
 * Endpoints implemented:
 *   POST /api/auth/login                          → { token, usuario }
 *   POST /api/auth/register                       → { usuario }
 *   GET  /api/usuarios | /usuarios/{id}
 *   POST/PUT/DELETE /api/usuarios
 *   GET  /api/categorias | /api/marcas
 *   POST/PUT/DELETE /api/categorias | /api/marcas
 *   GET  /api/productos | /api/productos/categoria/{id} | /api/productos/marca/{id}
 *   POST/PUT/DELETE /api/productos
 *   POST/PUT /api/variantes
 *   POST /api/fotos                               (multipart simulated)
 *   POST /api/descuentos
 *   POST /api/carritos/{id}/items
 *   PUT  /api/carritos/{id}/items/{itemId}?cantidad=N
 *   POST /api/carritos/{id}/checkout              → { ordenId }
 *   GET  /api/ordenes/usuario/{usuarioId}
 *   POST /api/ordenes/{id}/confirmar | /cancelar
 *
 * Every call resolves after ~250-700ms to mimic real latency. Errors are returned
 * as rejected promises with an Error containing `.status` and `.body`.
 */

const __sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const __jitter = () => 250 + Math.floor(Math.random() * 450);

class ApiError extends Error {
  constructor(status, body) {
    super(typeof body === 'string' ? body : (body?.mensaje || 'Error'));
    this.status = status;
    this.body = body;
  }
}

/* Hard-coded mock user database (mirrors Postman seed) */
const MOCK_USERS = [
  { id: 1, username: 'admin',     email: 'admin@cumbre.com', password: 'admin123',
    nombre: 'Ana', apellido: 'Quintela', rol: 'ADMIN',   estado: 'ACTIVO' },
  { id: 2, username: 'juanperez', email: 'juan@email.com',   password: 'cumbre2026',
    nombre: 'Juan', apellido: 'Pérez',   rol: 'CLIENTE', estado: 'ACTIVO' },
  { id: 3, username: 'cami.reyes', email: 'cami@guides.com', password: 'guide123',
    nombre: 'Camila', apellido: 'Reyes', rol: 'CLIENTE', estado: 'ACTIVO' },
  { id: 4, username: 'ivanv',     email: 'ivan@aagm.org',    password: 'aagm123',
    nombre: 'Iván',  apellido: 'Vargas', rol: 'CLIENTE', estado: 'INACTIVE' },
];

const api = {
  /* ─── Auth ───────────────────────────────────────────────────────────── */
  async login({ username, password }) {
    await __sleep(__jitter());
    const user = MOCK_USERS.find((u) => u.username === username);
    if (!user || user.password !== password) {
      throw new ApiError(401, { mensaje: 'Usuario o contraseña inválidos' });
    }
    if (user.estado !== 'ACTIVO') {
      throw new ApiError(403, { mensaje: 'Tu cuenta está inactiva. Contacta a soporte.' });
    }
    // Strip password before returning
    const { password: _, ...usuario } = user;
    return { token: `mock-jwt-${user.id}-${Date.now()}`, usuario };
  },

  async register({ username, email, password, nombre, apellido }) {
    await __sleep(__jitter());
    if (MOCK_USERS.some((u) => u.username === username)) {
      throw new ApiError(409, { mensaje: 'El nombre de usuario ya existe' });
    }
    const nuevo = {
      id: Math.max(...MOCK_USERS.map((u) => u.id)) + 1,
      username, email, password, nombre, apellido,
      rol: 'CLIENTE', estado: 'ACTIVO',
    };
    MOCK_USERS.push(nuevo);
    const { password: _, ...usuario } = nuevo;
    return { token: `mock-jwt-${nuevo.id}-${Date.now()}`, usuario };
  },

  /* ─── Usuarios ───────────────────────────────────────────────────────── */
  async getUsuarios() {
    await __sleep(__jitter());
    return MOCK_USERS.map(({ password, ...u }) => u);
  },
  async getUsuario(id) {
    await __sleep(__jitter());
    const u = MOCK_USERS.find((x) => x.id === id);
    if (!u) throw new ApiError(404, { mensaje: 'Usuario no encontrado' });
    const { password, ...rest } = u;
    return rest;
  },
  async createUsuario(data) {
    await __sleep(__jitter());
    const nuevo = { id: Math.max(...MOCK_USERS.map((u) => u.id)) + 1, ...data };
    MOCK_USERS.push(nuevo);
    return nuevo;
  },
  async updateUsuario(id, data) {
    await __sleep(__jitter());
    const idx = MOCK_USERS.findIndex((u) => u.id === id);
    if (idx === -1) throw new ApiError(404, { mensaje: 'Usuario no encontrado' });
    MOCK_USERS[idx] = { ...MOCK_USERS[idx], ...data };
    return MOCK_USERS[idx];
  },
  async deleteUsuario(id) {
    await __sleep(__jitter());
    const idx = MOCK_USERS.findIndex((u) => u.id === id);
    if (idx === -1) throw new ApiError(404, { mensaje: 'Usuario no encontrado' });
    MOCK_USERS.splice(idx, 1);
    return { ok: true };
  },

  /* ─── Generic CRUD for categorías / marcas / productos / variantes / etc.
   * Real network shape: these mostly just round-trip with delay since the
   * store is the source of truth for the prototype. */
  async upsertEntity(name, data) {
    await __sleep(__jitter());
    return { ...data, _serverTimestamp: Date.now() };
  },
  async deleteEntity(name, id) {
    await __sleep(__jitter());
    return { ok: true, id };
  },

  /* ─── Carritos ───────────────────────────────────────────────────────── */
  async addCartItem(carritoId, { idVariante, cantidad }) {
    await __sleep(__jitter());
    return { itemCarritoId: `it-${Date.now()}`, carritoId, idVariante, cantidad };
  },
  async updateCartItem(carritoId, itemCarritoId, cantidad) {
    await __sleep(__jitter());
    return { itemCarritoId, cantidad };
  },
  async checkout(carritoId) {
    await __sleep(__jitter() + 300);
    return { ordenId: `ORD-${2848 + Math.floor(Math.random() * 100)}`, estado: 'PENDIENTE' };
  },

  /* ─── Órdenes ────────────────────────────────────────────────────────── */
  async confirmarOrden(ordenId) {
    await __sleep(__jitter());
    return { ordenId, estado: 'CONFIRMADA' };
  },
  async cancelarOrden(ordenId) {
    await __sleep(__jitter());
    return { ordenId, estado: 'CANCELADA' };
  },

  /* ─── Fotos ──────────────────────────────────────────────────────────── */
  async uploadFoto({ varianteId, orden, archivo }) {
    // Simulate progressive upload
    await __sleep(800 + Math.random() * 600);
    return { fotoId: `f-${Date.now()}`, varianteId, orden, url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=600&q=70' };
  },

  /* ─── Descuentos ─────────────────────────────────────────────────────── */
  async createDescuento(data) {
    await __sleep(__jitter());
    return { descuentoId: Date.now(), ...data };
  },
};

Object.assign(window, { api, ApiError, MOCK_USERS });
