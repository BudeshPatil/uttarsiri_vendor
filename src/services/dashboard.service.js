import apiClient from '@/lib/apiClient';

const dashboardService = {
  getStats() {
    return apiClient.get('/admin/dashboard');
  },
};

export default dashboardService;
