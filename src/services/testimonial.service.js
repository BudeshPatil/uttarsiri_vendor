import apiClient from '@/lib/apiClient';

const testimonialService = {
  getAll(params) {
    return apiClient.get('/testimonials', { params });
  },
  create(payload) {
    return apiClient.post('/testimonials', payload);
  },
  update(id, payload) {
    return apiClient.put(`/testimonials/${id}`, payload);
  },
  remove(id) {
    return apiClient.delete(`/testimonials/${id}`);
  },
};

export default testimonialService;
