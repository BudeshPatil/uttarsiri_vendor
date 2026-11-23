import apiClient from '@/lib/apiClient';

const contactService = {
  getAll(params = {}) {
    return apiClient.get('/contacts', { params });
  },

  getById(id) {
    return apiClient.get(`/contacts/${id}`);
  },

  update(id, payload) {
    return apiClient.put(`/contacts/${id}`, payload);
  },

  remove(id) {
    return apiClient.delete(`/contacts/${id}`);
  },
};

export default contactService;
