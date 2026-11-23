import apiClient from '@/lib/apiClient';

const projectService = {
  getAll(params) {
    return apiClient.get('/projects', { params });
  },
  getById(id) {
    return apiClient.get(`/projects/${id}`);
  },
  getBySlug(slug) {
    return apiClient.get(`/projects/slug/${slug}`);
  },
  create(payload) {
    return apiClient.post('/projects', payload);
  },
  update(id, payload) {
    return apiClient.put(`/projects/${id}`, payload);
  },
  remove(id) {
    return apiClient.delete(`/projects/${id}`);
  },
};

export default projectService;
