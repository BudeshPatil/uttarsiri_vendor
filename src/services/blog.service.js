import apiClient from '@/lib/apiClient';

const blogService = {
  getAll(params = {}) {
    return apiClient.get('/blogs', { params });
  },

  getById(id) {
    return apiClient.get(`/blogs/${id}`);
  },

  create(payload) {
    return apiClient.post('/blogs', payload);
  },

  update(id, payload) {
    return apiClient.put(`/blogs/${id}`, payload);
  },

  remove(id) {
    return apiClient.delete(`/blogs/${id}`);
  },
};

export default blogService;
