import apiClient from '@/lib/apiClient';

const permissionService = {
  getAll(params = {}) {
    return apiClient.get('/permissions', { params });
  },

  getById(id) {
    return apiClient.get(`/permissions/${id}`);
  },

  create(payload) {
    return apiClient.post('/permissions', payload);
  },

  update(id, payload) {
    return apiClient.put(`/permissions/${id}`, payload);
  },

  remove(id) {
    return apiClient.delete(`/permissions/${id}`);
  },
};

export default permissionService;
