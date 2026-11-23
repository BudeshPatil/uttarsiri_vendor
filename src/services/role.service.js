import apiClient from '@/lib/apiClient';

const roleService = {
  getAll(params = {}) {
    return apiClient.get('/roles', { params });
  },

  getById(id) {
    return apiClient.get(`/roles/${id}`);
  },

  create(payload) {
    return apiClient.post('/roles', payload);
  },

  update(id, payload) {
    return apiClient.put(`/roles/${id}`, payload);
  },

  remove(id) {
    return apiClient.delete(`/roles/${id}`);
  },
};

export default roleService;
