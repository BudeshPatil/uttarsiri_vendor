import apiClient from '@/lib/apiClient';

const galleryService = {
  getAll(params) {
    return apiClient.get('/galleries', { params });
  },
  create(payload) {
    return apiClient.post('/galleries', payload);
  },
  update(id, payload) {
    return apiClient.put(`/galleries/${id}`, payload);
  },
  remove(id) {
    return apiClient.delete(`/galleries/${id}`);
  },
};

export default galleryService;
