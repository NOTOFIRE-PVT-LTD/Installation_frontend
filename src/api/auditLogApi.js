import axiosInstance from './axiosInstance';

export const auditLogApi = {
  list: (params) => axiosInstance.get('/audit-logs', { params }),
  getById: (id) => axiosInstance.get(`/audit-logs/${id}`),
  getStats: () => axiosInstance.get('/audit-logs/stats'),
  getModules: () => axiosInstance.get('/audit-logs/modules'),
};
