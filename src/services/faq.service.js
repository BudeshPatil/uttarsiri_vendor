import apiClient from '@/lib/apiClient';

const faqService = {
  getAll(params) {
    return apiClient.get('/faqs', { params });
  },
  create(payload) {
    return apiClient.post('/faqs', payload);
  },
  update(id, payload) {
    return apiClient.put(`/faqs/${id}`, payload);
  },
  remove(id) {
    return apiClient.delete(`/faqs/${id}`);
  },
};

export default faqService;
