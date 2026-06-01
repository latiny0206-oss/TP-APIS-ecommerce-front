/* Redux Toolkit store — API-contract shape with async thunks.
 *
 * Slices: navigation · auth · ui · cart · products · orders · discounts · taxonomies · users
 * All slices keep their previous structural roles; this revision adds:
 *   - API-shape fields (nombre, precioBase, marcaId, idVariante, etc.)
 *   - Async thunks (loginAsync, addCartItemAsync, checkoutAsync, etc.)
 *   - A `users` slice with full CRUD
 *   - Loading/error state on auth and other async paths
 */

const { configureStore, createSlice } = window.RTK;
const { Provider, useDispatch, useSelector, shallowEqual } = window.ReactRedux;

/* ─── 1. NAVIGATION ──────────────────────────────────────────────────── */
const navigationSlice = createSlice({
  name: 'navigation',
  initialState: { currentView: 'home', params: {}, history: ['home'] },
  reducers: {
    navigate(state, { payload }) {
      const view = typeof payload === 'string' ? payload : payload.view;
      const params = typeof payload === 'string' ? {} : (payload.params || {});
      state.currentView = view;
      state.params = params;
      state.history.push(view);
      if (typeof window !== 'undefined') setTimeout(() => window.scrollTo({ top: 0 }), 10);
    },
    goBack(state) {
      if (state.history.length > 1) {
        state.history.pop();
        state.currentView = state.history[state.history.length - 1];
      }
    },
  },
});
const { navigate, goBack } = navigationSlice.actions;

/* ─── 2. AUTH (with API user shape) ─────────────────────────────────── */
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isLoggedIn: true,
    /* API shape — matches /api/usuarios object */
    user: { id: 2, username: 'juanperez', email: 'juan@email.com', nombre: 'Juan', apellido: 'Pérez', rol: 'CLIENTE', estado: 'ACTIVO' },
    token: 'mock-jwt-2-bootstrap',
    role: 'cliente',  // mirrors user.rol but lowercased for the switcher
    status: 'idle',   // idle | loading | error
    error: null,
  },
  reducers: {
    loginStart(state) { state.status = 'loading'; state.error = null; },
    loginSuccess(state, { payload }) {
      state.status = 'idle';
      state.isLoggedIn = true;
      state.user = payload.usuario;
      state.token = payload.token;
      state.role  = payload.usuario.rol === 'ADMIN' ? 'admin' : 'cliente';
    },
    loginFailure(state, { payload }) { state.status = 'error'; state.error = payload; },
    logout(state) {
      state.isLoggedIn = false; state.user = null; state.token = null; state.role = 'cliente';
    },
    setRole(state, { payload }) { state.role = payload; if (state.user) state.user.rol = payload === 'admin' ? 'ADMIN' : 'CLIENTE'; },
  },
});
const { loginStart, loginSuccess, loginFailure, logout, setRole } = authSlice.actions;

/* ─── 3. UI ──────────────────────────────────────────────────────────── */
const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    mobileMenuOpen: false,
    newProductDrawerOpen: false,
    editProductId: null,
    newsletter: { email: '', status: 'idle', error: null },
  },
  reducers: {
    toggleMobileMenu(state) { state.mobileMenuOpen = !state.mobileMenuOpen; },
    closeMobileMenu(state) { state.mobileMenuOpen = false; },
    openProductDrawer(state, { payload }) {
      state.newProductDrawerOpen = true;
      state.editProductId = payload || null;
    },
    closeProductDrawer(state) {
      state.newProductDrawerOpen = false;
      state.editProductId = null;
    },
    setNewsletterEmail(state, action) {
      state.newsletter.email = action.payload;
      if (state.newsletter.status === 'error') state.newsletter.status = 'idle';
    },
    submitNewsletterStart(state) { state.newsletter.status = 'submitting'; state.newsletter.error = null; },
    submitNewsletterSuccess(state) { state.newsletter.status = 'success'; },
    submitNewsletterError(state, { payload }) { state.newsletter.status = 'error'; state.newsletter.error = payload; },
    resetNewsletter(state) { state.newsletter = { email: '', status: 'idle', error: null }; },
  },
});
const {
  toggleMobileMenu, closeMobileMenu, openProductDrawer, closeProductDrawer,
  setNewsletterEmail, submitNewsletterStart, submitNewsletterSuccess, submitNewsletterError, resetNewsletter,
} = uiSlice.actions;

/* ─── 4. CART (with API idVariante/cantidad alongside legacy fields) ── */
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    carritoId: 'c-001',
    items: [
      /* Each line: API fields (itemCarritoId, idVariante, cantidad) + display fields (snapshot). */
      { lineId: 'l1', itemCarritoId: 'it-1', idVariante: 1102, productoId: 101, cantidad: 1,
        productId: 101, qty: 1, variant: { color: 'Azul Marino', size: 'M', talla: 'M' }, unitPrice: 89990, name: 'Mochila Atmos AG 65' },
      { lineId: 'l2', itemCarritoId: 'it-2', idVariante: 1503, productoId: 105, cantidad: 2,
        productId: 105, qty: 2, variant: { color: 'Negro', size: '42', talla: '42' }, unitPrice: 89990, name: 'Bota X Ultra 4 GTX' },
    ],
    coupon: null,
    couponError: null,
    status: 'idle',  // idle | adding | updating
  },
  reducers: {
    addToCart(state, { payload }) {
      const idVariante = payload.idVariante;
      const lineId = `v${idVariante}`;
      const existing = state.items.find((i) => i.lineId === lineId);
      if (existing) {
        existing.qty += payload.qty || payload.cantidad || 1;
        existing.cantidad = existing.qty;
      } else {
        const qty = payload.qty || payload.cantidad || 1;
        state.items.push({
          lineId,
          itemCarritoId: `it-${Date.now()}`,
          idVariante,
          productoId: payload.productoId || payload.productId,
          productId:  payload.productoId || payload.productId,
          cantidad: qty, qty,
          variant: payload.variant || { color: '-', size: '-', talla: '-' },
          unitPrice: payload.unitPrice,
          name: payload.name,
        });
      }
    },
    updateQty(state, { payload }) {
      const item = state.items.find((i) => i.lineId === payload.lineId);
      if (!item) return;
      const q = Math.max(1, payload.qty);
      item.qty = q; item.cantidad = q;
    },
    removeItem(state, { payload }) {
      state.items = state.items.filter((i) => i.lineId !== payload);
    },
    applyCoupon(state, { payload }) {
      const codigo = (payload || '').trim().toUpperCase();
      const descuento = LIVE_DESCUENTOS.find((d) => d.codigo === codigo && d.estado === 'ACTIVO');
      if (!descuento) { state.couponError = `Código "${codigo}" inválido o vencido`; return; }
      state.coupon = {
        code: descuento.codigo, codigo: descuento.codigo,
        tipo: descuento.tipo,
        valor: descuento.valor,
        porcentaje: descuento.porcentaje,
        // Legacy fields for old views
        type:  descuento.tipo === 'PORCENTAJE' ? 'percent' : 'fixed',
        value: descuento.tipo === 'PORCENTAJE' ? descuento.porcentaje / 100 : descuento.valor,
        label: descuento.tipo === 'PORCENTAJE'
                 ? `${descuento.codigo} · ${descuento.porcentaje}% OFF`
                 : `${descuento.codigo} · -$${descuento.valor.toLocaleString('es-CL')}`,
      };
      state.couponError = null;
    },
    removeCoupon(state) { state.coupon = null; state.couponError = null; },
    clearCart(state) { state.items = []; state.coupon = null; },
  },
});
const { addToCart, updateQty, removeItem, applyCoupon, removeCoupon, clearCart } = cartSlice.actions;

/* Snapshot of discounts used by the cart reducer (avoid circular getState in pure reducers).
 * Kept in sync by `LIVE_DESCUENTOS = [...state.discounts]` after each discounts update. */
let LIVE_DESCUENTOS = [];

/* Cart totals selector */
function selectCartTotals(state) {
  const subtotal = state.cart.items.reduce((s, i) => s + i.unitPrice * (i.cantidad || i.qty), 0);
  const c = state.cart.coupon;
  let discount = 0;
  if (c) {
    if (c.tipo === 'PORCENTAJE') discount = Math.round(subtotal * (c.porcentaje / 100));
    else if (c.tipo === 'FIJO')  discount = c.valor;
    else if (c.type === 'percent') discount = Math.round(subtotal * c.value);   // legacy fallback
    else if (c.type === 'fixed')   discount = c.value;
  }
  const total = Math.max(0, subtotal - discount);
  return { subtotal, discount, total, itemCount: state.cart.items.reduce((n, i) => n + (i.cantidad || i.qty), 0) };
}

/* ─── 5. PRODUCTS ────────────────────────────────────────────────────── */
const productsSlice = createSlice({
  name: 'products',
  initialState: { byId: {}, ids: [], status: 'idle' },
  reducers: {
    fetchStart(state) { state.status = 'loading'; },
    hydrateProducts(state, { payload }) {
      state.byId = Object.fromEntries(payload.map((p) => [p.id, p]));
      state.ids = payload.map((p) => p.id);
      state.status = 'idle';
    },
    upsertProduct(state, { payload }) {
      const isNew = !state.byId[payload.id];
      state.byId[payload.id] = { ...state.byId[payload.id], ...payload };
      if (isNew) state.ids.unshift(payload.id);
    },
    deleteProduct(state, { payload }) {
      delete state.byId[payload];
      state.ids = state.ids.filter((id) => id !== payload);
    },
    updateVariantStock(state, { payload }) {
      const { productId, variantId, stock } = payload;
      const p = state.byId[productId];
      if (!p || !p.variants) return;
      const v = p.variants.find((vv) => vv.id === variantId);
      if (v) {
        v.stock = stock;
        p.stock = p.variants.reduce((s, vv) => s + vv.stock, 0);
      }
    },
    updateVariant(state, { payload }) {
      const { productoId, variant } = payload;
      const p = state.byId[productoId];
      if (!p) return;
      const idx = p.variants.findIndex((v) => v.id === variant.id);
      if (idx >= 0) p.variants[idx] = { ...p.variants[idx], ...variant, size: variant.talla || variant.size };
      else p.variants.push({ ...variant, size: variant.talla || variant.size });
      p.stock = p.variants.reduce((s, v) => s + v.stock, 0);
    },
    decrementStockFromOrder(state, { payload }) {
      payload.forEach(({ idVariante, productoId, cantidad }) => {
        const p = state.byId[productoId];
        if (!p) return;
        const v = p.variants.find((vv) => vv.id === idVariante);
        if (v) { v.stock = Math.max(0, v.stock - cantidad); }
        p.stock = p.variants.reduce((s, vv) => s + vv.stock, 0);
      });
    },
  },
});
const { fetchStart, hydrateProducts, upsertProduct, deleteProduct, updateVariantStock, updateVariant, decrementStockFromOrder } = productsSlice.actions;

/* ─── 6. ORDERS (API shape) ─────────────────────────────────────────── */
const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    byId: {
      'ORD-2801': { id: 'ORD-2801', usuarioId: 2, fecha: '2026-05-10', estado: 'CONFIRMADA', items: [{ idVariante: 1202, productoId: 102, nombre: 'Chaqueta Guide Down Hoody', variante: 'Negro · M', cantidad: 1, precio: 89990 }], subtotal: 89990, descuento: 0, total: 89990, descuentoCodigo: null },
      'ORD-2756': { id: 'ORD-2756', usuarioId: 2, fecha: '2026-04-02', estado: 'ENTREGADA',  items: [{ idVariante: 1301, productoId: 103, nombre: 'Piolet Summit Evo', variante: 'Naranja · 52cm', cantidad: 1, precio: 112500 }], subtotal: 112500, descuento: 0, total: 112500, descuentoCodigo: null },
      'ORD-2701': { id: 'ORD-2701', usuarioId: 2, fecha: '2026-03-15', estado: 'CANCELADA',  items: [{ idVariante: 1901, productoId: 109, nombre: 'Linterna Spot 400', variante: 'Gris · Único', cantidad: 1, precio: 34990 }], subtotal: 34990, descuento: 0, total: 34990, descuentoCodigo: null },
    },
    ids: ['ORD-2801', 'ORD-2756', 'ORD-2701'],
    status: 'idle',
  },
  reducers: {
    createOrder(state, { payload }) {
      state.byId[payload.id] = payload;
      state.ids.unshift(payload.id);
    },
    updateOrderStatus(state, { payload }) {
      const { id, estado, status } = payload;
      const target = state.byId[id];
      if (!target) return;
      target.estado = estado || status;
    },
  },
});
const { createOrder, updateOrderStatus } = ordersSlice.actions;

/* Compatibility alias: order.status === order.estado */
function withEstadoAsStatus(order) {
  if (!order) return order;
  return { ...order, status: order.estado, date: order.fecha, discount: order.descuento, coupon: order.descuentoCodigo };
}

/* ─── 7. DISCOUNTS (API shape) ──────────────────────────────────────── */
const discountsSlice = createSlice({
  name: 'discounts',
  initialState: [],
  reducers: {
    hydrateDiscounts(state, { payload }) { return payload; },
    toggleDiscount(state, { payload }) {
      const d = state.find((dd) => dd.id === payload);
      if (d) d.estado = d.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    },
    upsertDiscount(state, { payload }) {
      const idx = state.findIndex((d) => d.id === payload.id);
      if (idx >= 0) state[idx] = payload;
      else state.unshift(payload);
    },
    deleteDiscount(state, { payload }) {
      return state.filter((d) => d.id !== payload);
    },
  },
});
const { hydrateDiscounts, toggleDiscount, upsertDiscount, deleteDiscount } = discountsSlice.actions;

/* ─── 8. TAXONOMIES (categorías + marcas, API shape) ────────────────── */
const taxonomiesSlice = createSlice({
  name: 'taxonomies',
  initialState: {
    categorias: [],
    marcas: [],
    /* legacy display aliases for views that still read .categories / .brands */
    categories: [],
    brands: [],
  },
  reducers: {
    hydrateTaxonomies(state, { payload }) {
      state.categorias = payload.categorias;
      state.marcas     = payload.marcas;
      state.categories = payload.categorias.map((c) => ({ id: `c${c.id}`, name: c.nombre, products: c.productos }));
      state.brands     = payload.marcas.map((m)     => ({ id: `b${m.id}`, name: m.nombre, products: m.productos }));
    },
    upsertCategoria(state, { payload }) {
      const idx = state.categorias.findIndex((c) => c.id === payload.id);
      if (idx >= 0) state.categorias[idx] = payload; else state.categorias.push(payload);
      state.categories = state.categorias.map((c) => ({ id: `c${c.id}`, name: c.nombre, products: c.productos }));
    },
    upsertMarca(state, { payload }) {
      const idx = state.marcas.findIndex((m) => m.id === payload.id);
      if (idx >= 0) state.marcas[idx] = payload; else state.marcas.push(payload);
      state.brands = state.marcas.map((m) => ({ id: `b${m.id}`, name: m.nombre, products: m.productos }));
    },
    deleteCategoria(state, { payload }) {
      state.categorias = state.categorias.filter((c) => c.id !== payload);
      state.categories = state.categorias.map((c) => ({ id: `c${c.id}`, name: c.nombre, products: c.productos }));
    },
    deleteMarca(state, { payload }) {
      state.marcas = state.marcas.filter((m) => m.id !== payload);
      state.brands = state.marcas.map((m) => ({ id: `b${m.id}`, name: m.nombre, products: m.productos }));
    },
  },
});
const { hydrateTaxonomies, upsertCategoria, upsertMarca, deleteCategoria, deleteMarca } = taxonomiesSlice.actions;
/* Legacy action name aliases used by existing admin views */
const upsertCategory = upsertCategoria;
const upsertBrand    = upsertMarca;
const deleteCategory = deleteCategoria;
const deleteBrand    = deleteMarca;

/* ─── 9. USERS (admin ABM) ──────────────────────────────────────────── */
const usersSlice = createSlice({
  name: 'users',
  initialState: { list: [], status: 'idle' },
  reducers: {
    hydrateUsers(state, { payload }) { state.list = payload; state.status = 'idle'; },
    upsertUser(state, { payload }) {
      const idx = state.list.findIndex((u) => u.id === payload.id);
      if (idx >= 0) state.list[idx] = payload;
      else state.list.unshift(payload);
    },
    deleteUser(state, { payload }) { state.list = state.list.filter((u) => u.id !== payload); },
    toggleUserStatus(state, { payload }) {
      const u = state.list.find((uu) => uu.id === payload);
      if (u) u.estado = u.estado === 'ACTIVO' ? 'INACTIVE' : 'ACTIVO';
    },
  },
});
const { hydrateUsers, upsertUser, deleteUser, toggleUserStatus } = usersSlice.actions;

/* ─── STORE ───────────────────────────────────────────────────────── */
const store = configureStore({
  reducer: {
    navigation: navigationSlice.reducer,
    auth: authSlice.reducer,
    ui: uiSlice.reducer,
    cart: cartSlice.reducer,
    products: productsSlice.reducer,
    orders: ordersSlice.reducer,
    discounts: discountsSlice.reducer,
    taxonomies: taxonomiesSlice.reducer,
    users: usersSlice.reducer,
  },
});

/* Keep the cart's discount snapshot in sync with the discounts slice */
store.subscribe(() => { LIVE_DESCUENTOS = store.getState().discounts; });

/* ─── THUNKS ──────────────────────────────────────────────────────── */

/* POST /api/auth/login → if username is "admin" → ADMIN, "juanperez" → CLIENTE */
function loginAsync({ username, password }) {
  return async (dispatch) => {
    dispatch(loginStart());
    try {
      const res = await api.login({ username, password });
      dispatch(loginSuccess(res));
      // Auto-route based on role
      if (res.usuario.rol === 'ADMIN') dispatch(navigate('admin-dashboard'));
      else dispatch(navigate('home'));
      return res;
    } catch (err) {
      dispatch(loginFailure(err.message || 'No se pudo iniciar sesión'));
      throw err;
    }
  };
}

/* POST /api/auth/register */
function registerAsync(payload) {
  return async (dispatch) => {
    dispatch(loginStart());
    try {
      const res = await api.register(payload);
      dispatch(loginSuccess(res));
      dispatch(navigate('home'));
      return res;
    } catch (err) {
      dispatch(loginFailure(err.message));
      throw err;
    }
  };
}

/* Newsletter thunk (unchanged behaviour) */
function submitNewsletterThunk(email) {
  return async (dispatch) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      dispatch(submitNewsletterError('Ingresa un correo válido'));
      return;
    }
    dispatch(submitNewsletterStart());
    await new Promise((r) => setTimeout(r, 1100));
    dispatch(submitNewsletterSuccess());
  };
}

/* POST /api/carritos/{id}/items */
function addCartItemAsync({ idVariante, cantidad, productoId, variant, unitPrice, name }) {
  return async (dispatch, getState) => {
    const carritoId = getState().cart.carritoId;
    await api.addCartItem(carritoId, { idVariante, cantidad });
    dispatch(addToCart({ idVariante, cantidad, productoId, productId: productoId, variant, unitPrice, name, qty: cantidad }));
  };
}

/* POST /api/carritos/{id}/checkout → POST /api/ordenes implicitly */
function checkoutAsync() {
  return async (dispatch, getState) => {
    const s = getState();
    const carritoId = s.cart.carritoId;
    const usuarioId = s.auth.user?.id || 0;
    const res = await api.checkout(carritoId);
    const totals = selectCartTotals(s);
    const items = s.cart.items.map((i) => ({
      idVariante: i.idVariante,
      productoId: i.productoId || i.productId,
      nombre: i.name,
      variante: `${i.variant.color} · ${i.variant.size || i.variant.talla}`,
      cantidad: i.cantidad || i.qty,
      precio: i.unitPrice,
    }));
    dispatch(createOrder({
      id: res.ordenId,
      usuarioId,
      fecha: new Date().toISOString().slice(0, 10),
      estado: 'PENDIENTE',
      items,
      subtotal: totals.subtotal,
      descuento: totals.discount,
      total: totals.total,
      descuentoCodigo: s.cart.coupon?.codigo || null,
    }));
    dispatch(decrementStockFromOrder(items.map((i) => ({ idVariante: i.idVariante, productoId: i.productoId, cantidad: i.cantidad }))));
    dispatch(clearCart());
    dispatch(navigate({ view: 'confirmation', params: { orderId: res.ordenId } }));
  };
}

/* Legacy alias used by existing Checkout.jsx */
function checkoutThunk() { return checkoutAsync(); }

/* POST /api/ordenes/{id}/confirmar */
function confirmarOrdenAsync(ordenId) {
  return async (dispatch) => {
    await api.confirmarOrden(ordenId);
    dispatch(updateOrderStatus({ id: ordenId, estado: 'CONFIRMADA' }));
  };
}

/* POST /api/ordenes/{id}/cancelar */
function cancelarOrdenAsync(ordenId) {
  return async (dispatch) => {
    await api.cancelarOrden(ordenId);
    dispatch(updateOrderStatus({ id: ordenId, estado: 'CANCELADA' }));
  };
}

/* POST /api/descuentos */
function createDescuentoAsync(payload) {
  return async (dispatch) => {
    const res = await api.createDescuento(payload);
    dispatch(upsertDiscount({ ...payload, id: res.descuentoId }));
    return res;
  };
}

/* POST /api/usuarios */
function createUsuarioAsync(payload) {
  return async (dispatch) => {
    const res = await api.createUsuario(payload);
    dispatch(upsertUser(res));
    return res;
  };
}
function updateUsuarioAsync(id, payload) {
  return async (dispatch) => {
    const res = await api.updateUsuario(id, payload);
    dispatch(upsertUser(res));
    return res;
  };
}
function deleteUsuarioAsync(id) {
  return async (dispatch) => {
    await api.deleteUsuario(id);
    dispatch(deleteUser(id));
  };
}

/* ─── EXPORTS ─────────────────────────────────────────────────────── */
Object.assign(window, {
  store, Provider, useDispatch, useSelector, shallowEqual,
  // navigation
  navigate, goBack,
  // auth
  loginStart, loginSuccess, loginFailure, logout, setRole,
  // ui
  toggleMobileMenu, closeMobileMenu, openProductDrawer, closeProductDrawer,
  setNewsletterEmail, submitNewsletterThunk, resetNewsletter,
  // cart
  addToCart, updateQty, removeItem, applyCoupon, removeCoupon, clearCart,
  selectCartTotals, withEstadoAsStatus,
  // products
  fetchStart, hydrateProducts, upsertProduct, deleteProduct,
  updateVariantStock, updateVariant, decrementStockFromOrder,
  // orders
  createOrder, updateOrderStatus,
  // discounts
  hydrateDiscounts, toggleDiscount, upsertDiscount, deleteDiscount,
  // taxonomies
  hydrateTaxonomies, upsertCategoria, upsertMarca, deleteCategoria, deleteMarca,
  upsertCategory, upsertBrand, deleteCategory, deleteBrand,
  // users
  hydrateUsers, upsertUser, deleteUser, toggleUserStatus,
  // thunks
  loginAsync, registerAsync,
  addCartItemAsync, checkoutAsync, checkoutThunk,
  confirmarOrdenAsync, cancelarOrdenAsync,
  createDescuentoAsync,
  createUsuarioAsync, updateUsuarioAsync, deleteUsuarioAsync,
});
