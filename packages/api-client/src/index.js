import { ApiClient, MemoryTokenStore, ApiError } from './client.js';

export function createApi({ baseUrl, tokens }) {
  const c = new ApiClient({ baseUrl, tokens });
  const setTokens = (r) => c.tokens.set(r.accessToken, r.refreshToken);

  return {
    client: c,
    auth: {
      requestOtp: (mobile, purpose = 'LOGIN') => c.post('/auth/otp/request', { mobile, purpose }),
      verifyOtp: async (mobile, code, opts = {}) => { const r = await c.post('/auth/otp/verify', { mobile, code, ...opts }); setTokens(r); return r; },
      staffLogin: async (mobile, password) => { const r = await c.post('/auth/staff/login', { mobile, password }); setTokens(r); return r; },
      logout: () => c.post('/auth/logout', { refreshToken: c.tokens.getRefresh() }).finally(() => c.tokens.set(null, null)),
      me: () => c.get('/auth/me'),
    },
    products: {
      list: (q) => c.get('/products', q),
      get: (idOrSlug) => c.get(`/products/${idOrSlug}`),
      categories: () => c.get('/products/categories'),
      createCategory: (body) => c.post('/products/categories', body),
      updateCategory: (id, body) => c.patch(`/products/categories/${id}`, body),
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
    },
    crm: {
      customers: (q) => c.get('/crm/customers', q),
      customer: (id) => c.get(`/crm/customers/${id}`),
      createCustomer: (body) => c.post('/crm/customers', body),
      updateCustomer: (id, body) => c.patch(`/crm/customers/${id}`, body),
      importCustomers: (file) => { const f = new FormData(); f.append('file', file); return c.postForm('/crm/customers/import', f); },
      logCommunication: (id, body) => c.post(`/crm/customers/${id}/communications`, body),
      statuses: () => c.get('/crm/statuses'),
      createStatus: (body) => c.post('/crm/statuses', body),
      updateStatus: (id, body) => c.patch(`/crm/statuses/${id}`, body),
      deleteStatus: (id) => c.del(`/crm/statuses/${id}`),
      reorderStatuses: (order) => c.post('/crm/statuses/reorder', { order }),
    },
    campaigns: {
      list: (q) => c.get('/campaigns', q),
      create: (body) => c.post('/campaigns', body),
      previewAudience: (segment) => c.post('/campaigns/preview', { segment }),
      send: (id) => c.post(`/campaigns/${id}/send`),
    },
    analytics: {
      overview: () => c.get('/analytics/overview'),
      revenue: (days = 7) => c.get('/analytics/revenue', { days }),
      topProducts: () => c.get('/analytics/top-products'),
    },
    account: {
      saveLocation: (loc) => c.put('/account/location', loc),
      wishlists: () => c.get('/account/wishlists'),
      createWishlist: (name) => c.post('/account/wishlists', { name }),
      toggleWishlistItem: (index, productId) => c.post(`/account/wishlists/${index}/items`, { productId }),
    },
    settings: {
      getBilling: () => c.get('/settings/billing'),
      updateBilling: (body) => c.put('/settings/billing', body),
    },
    uploads: { image: (file, prefix = 'uploads') => c.upload(file, prefix) },
  };
}
export { ApiError, MemoryTokenStore };
