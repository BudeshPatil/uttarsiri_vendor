import apiClient from '@/lib/apiClient';

const auditLogService = {
  getAll(params = {}) {
    return apiClient.get('/admin/audit-logs', { params });
  },
};

export default auditLogService;
