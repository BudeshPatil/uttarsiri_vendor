import apiClient from '@/lib/apiClient';

const projectCategoryService = {
  getAll(params) {
    return apiClient.get('/project-categories', { params });
  },
  getPublic() {
    return apiClient.get('/project-categories/public');
  },
  create(payload) {
    return apiClient.post('/project-categories', payload);
  },
  update(id, payload) {
    return apiClient.put(`/project-categories/${id}`, payload);
  },
  remove(id) {
    return apiClient.delete(`/project-categories/${id}`);
  },
};

export default projectCategoryService;
