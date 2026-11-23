import apiClient from '@/lib/apiClient';

const userService = {
  getAll(params = {}) {
    return apiClient.get('/users', { params });
  },

  getById(id) {
    return apiClient.get(`/users/${id}`);
  },

  create(payload) {
    return apiClient.post('/users', payload);
  },

  update(id, payload) {
    return apiClient.put(`/users/${id}`, payload);
  },

  remove(id) {
    return apiClient.delete(`/users/${id}`);
  },

  approve(id) {
    return apiClient.put(`/users/${id}/approve`);
  },

  reject(id) {
    return apiClient.put(`/users/${id}/reject`);
  },

  block(id) {
    return apiClient.put(`/users/${id}/block`);
  },

  unblock(id) {
    return apiClient.put(`/users/${id}/unblock`);
  },
};

export default userService;
