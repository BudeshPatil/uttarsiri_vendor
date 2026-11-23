import apiClient from '@/lib/apiClient';

const newsletterService = {
  getAll(params = {}) {
    return apiClient.get('/newsletter', { params });
  },

  getById(id) {
    return apiClient.get(`/newsletter/${id}`);
  },

  remove(id) {
    return apiClient.delete(`/newsletter/${id}`);
  },
};

export default newsletterService;
