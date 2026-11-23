import apiClient from '@/lib/apiClient';

const cmsService = {
  getAll(params = {}) {
    return apiClient.get('/cms/pages', { params });
  },

  getById(id) {
    return apiClient.get(`/cms/pages/${id}`);
  },

  create(payload) {
    return apiClient.post('/cms/pages', payload);
  },

  update(id, payload) {
    return apiClient.put(`/cms/pages/${id}`, payload);
  },

  remove(id) {
    return apiClient.delete(`/cms/pages/${id}`);
  },
};

export default cmsService;
