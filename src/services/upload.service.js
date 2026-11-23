import apiClient from '@/lib/apiClient';

const uploadService = {
  getAll(params = {}) {
    return apiClient.get('/uploads', { params });
  },

  upload(file, metadata = {}) {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(metadata).forEach(([key, value]) => {
      formData.append(key, value);
    });

    return apiClient.post('/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  remove(id) {
    return apiClient.delete(`/uploads/${id}`);
  },
};

export default uploadService;
