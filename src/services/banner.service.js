import apiClient from '@/lib/apiClient';

const bannerService = {
  getAll(params = {}) {
    return apiClient.get('/banners', { params });
  },

  /** Public homepage banners (no auth). */
  getPublic() {
    return apiClient.get('/banners/public');
  },

  getById(id) {
    return apiClient.get(`/banners/${id}`);
  },

  create(payload) {
    return apiClient.post('/banners', payload);
  },

  update(id, payload) {
    return apiClient.put(`/banners/${id}`, payload);
  },

  remove(id) {
    return apiClient.delete(`/banners/${id}`);
  },
};

export default bannerService;
