import apiClient from '@/lib/apiClient';

const serviceService = {
  getAll(params) {
    return apiClient.get('/services', { params });
  },
  create(payload) {
    return apiClient.post('/services', payload);
  },
  update(id, payload) {
    return apiClient.put(`/services/${id}`, payload);
  },
  remove(id) {
    return apiClient.delete(`/services/${id}`);
  },
};

export default serviceService;
