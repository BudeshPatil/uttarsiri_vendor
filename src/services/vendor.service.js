import apiClient from '@/lib/apiClient';

/**
 * Vendor portal API. Every response is the unwrapped `{ success, message, data }` envelope
 * (see apiClient) — callers read `response.data`.
 *
 * Only vendor-scoped endpoints are used here; never admin / CMS APIs.
 */
const vendorService = {
  // Public
  register(payload) {
    return apiClient.post('/vendors/register', payload);
  },

  /** Public active categories (flat list) used for product category_ids. */
  listCategories(lang = 'en') {
    return apiClient.get('/categories/public', { params: { tree: 'false', lang } });
  },

  // Vendor profile (any vendor status)
  getMe() {
    return apiClient.get('/vendors/me');
  },
  updateMe(payload) {
    return apiClient.put('/vendors/me', payload);
  },

  // Approved vendors only
  getDashboard() {
    return apiClient.get('/vendors/portal/dashboard');
  },
  getReports() {
    return apiClient.get('/vendors/portal/reports');
  },

  listProducts(params = {}) {
    return apiClient.get('/vendors/portal/products', { params });
  },
  createProduct(payload) {
    return apiClient.post('/vendors/portal/products', payload);
  },
  updateProduct(productId, payload) {
    return apiClient.put(`/vendors/portal/products/${productId}`, payload);
  },
  deleteProduct(productId) {
    return apiClient.delete(`/vendors/portal/products/${productId}`);
  },
  submitProduct(productId) {
    return apiClient.post(`/vendors/portal/products/${productId}/submit`);
  },
  addVariant(productId, payload) {
    return apiClient.post(`/vendors/portal/products/${productId}/variants`, payload);
  },
  updateVariant(productId, variantId, payload) {
    return apiClient.put(`/vendors/portal/products/${productId}/variants/${variantId}`, payload);
  },

  listInventory(params = {}) {
    return apiClient.get('/vendors/portal/inventory', { params });
  },
  listLowStock(params = {}) {
    return apiClient.get('/vendors/portal/inventory/low-stock', { params });
  },
  getInventory(variantId, params = {}) {
    return apiClient.get(`/vendors/portal/inventory/${variantId}`, { params });
  },
  updateInventory(variantId, payload) {
    return apiClient.put(`/vendors/portal/inventory/${variantId}`, payload);
  },

  listOrders(params = {}) {
    return apiClient.get('/vendors/portal/orders', { params });
  },
  getOrder(orderId) {
    return apiClient.get(`/vendors/portal/orders/${orderId}`);
  },
  updateOrderItemStatus(orderId, { order_item_id, status, reason }) {
    const body = { order_item_id, status };
    if (reason) body.reason = reason;
    return apiClient.put(`/vendors/portal/orders/${orderId}/items`, body);
  },
};

export const PRODUCT_UNITS = ['g', 'kg', 'ml', 'l', 'pack', 'piece', 'box', 'dozen'];

export default vendorService;
