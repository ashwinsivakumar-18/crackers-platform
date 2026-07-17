import { ApiClient, MemoryTokenStore, ApiError } from './client.js';

export function createApi({ baseUrl, tokens }) {
  const c = new ApiClient({ baseUrl, tokens });
  const setTokens = (r) => c.tokens.set(r.accessToken, r.refreshToken);

  return {
    client: c,
    auth: {
      register: async (body) => { const r = await c.post('/auth/register', body); setTokens(r); return r; },
      login: async (identifier, password) => { const r = await c.post('/auth/login', { identifier, password }); setTokens(r); return r; },
      staffLogin: async (mobile, password) => { const r = await c.post('/auth/staff/login', { mobile, password }); setTokens(r); return r; },
      forgotVerify: (mobile, email) => c.post('/auth/forgot/verify', { mobile, email }),
      forgotReset: (mobile, email, newPassword) => c.post('/auth/forgot/reset', { mobile, email, newPassword }),
      logout: () => c.post('/auth/logout', { refreshToken: c.tokens.getRefresh() }).finally(() => c.tokens.set(null, null)),
      me: () => c.get('/auth/me'),
    },
    products: {
      list: (q) => c.get('/products', q),
      get: (idOrSlug) => c.get(`/products/${idOrSlug}`),
      categories: () => c.get('/products/categories'),
      createCategory: (body) => c.post('/products/categories', body),
      updateCategory: (id, body) => c.patch(`/products/categories/${id}`, body),
      deleteCategory: (id) => c.del(`/products/categories/${id}`),
      create: (body) => c.post('/products', body),
      update: (id, body) => c.patch(`/products/${id}`, body),
    },
    orders: {
      place: (body) => c.post('/orders', body),
      myOrders: (q) => c.get('/orders', q),
      detail: (id) => c.get(`/orders/${id}`),
      uploadPayment: (id, body) => c.post(`/orders/${id}/payment`, body),
      adminList: (q) => c.get('/orders/admin/all', q),
      reviewPayment: (orderId, proofId, decision, note) => c.post(`/orders/${orderId}/payment/${proofId}/review`, { decision, note }),
      updateStatus: (orderId, status, note) => c.patch(`/orders/${orderId}/status`, { status, note }),
      addTracking: (orderId, body) => c.post(`/orders/${orderId}/tracking`, body),
      updateItemPrice: (orderId, index, unitPrice) => c.patch(`/orders/${orderId}/item-price`, { index, unitPrice }),
      setCharges: (orderId, body) => c.patch(`/orders/${orderId}/charges`, body),
      cancel: (orderId, note) => c.patch(`/orders/${orderId}/cancel`, { note }),
      remove: (orderId) => c.del(`/orders/${orderId}`),
    },
    analytics: {
      overview: () => c.get('/analytics/overview'),
      revenue: (days = 7) => c.get('/analytics/revenue', { days }),
      topProducts: () => c.get('/analytics/top-products'),
    },
    account: {
      saveLocation: (loc) => c.put('/account/location', loc),
      locations: () => c.get('/account/locations'),
      addLocation: (loc) => c.post('/account/locations', loc),
      removeLocation: (id) => c.del(`/account/locations/${id}`),
      setDefaultLocation: (id) => c.patch(`/account/locations/${id}/default`),
      wishlists: () => c.get('/account/wishlists'),
      createWishlist: (name) => c.post('/account/wishlists', { name }),
      toggleWishlistItem: (index, productId) => c.post(`/account/wishlists/${index}/items`, { productId }),
    },
    customers: {
      list: (q) => c.get('/customers', q),
      detail: (id) => c.get(`/customers/${id}`),
      remove: (id) => c.del(`/customers/${id}`),
    },
    support: {
      create: (body) => c.post('/support', body),
      list: (q) => c.get('/support', q),
      resolve: (id) => c.patch(`/support/${id}/resolve`),
      reopen: (id) => c.patch(`/support/${id}/reopen`),
      remove: (id) => c.del(`/support/${id}`),
    },
    settings: {
      getPublic: () => c.get('/settings/public'),
      getBilling: () => c.get('/settings/billing'),
      updateBilling: (body) => c.put('/settings/billing', body),
    },
    uploads: { image: (file, prefix = 'uploads') => c.upload(file, prefix) },
  };
}
export { ApiError, MemoryTokenStore };
