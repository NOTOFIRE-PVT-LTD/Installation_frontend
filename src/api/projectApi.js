import axiosInstance from './axiosInstance';

export const projectApi = {
  list: (params) => axiosInstance.get('/projects', { params }),
  options: () => axiosInstance.get('/projects/options'),
  approvalsQueue: () => axiosInstance.get('/projects/approvals/queue'),
  getById: (id) => axiosInstance.get(`/projects/${id}`),
  create: (formData) => axiosInstance.post('/projects', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) =>
    axiosInstance.put(`/projects/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id) => axiosInstance.delete(`/projects/${id}`),
  addStation: (id, formData) =>
    axiosInstance.post(`/projects/${id}/stations`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateStation: (id, stationId, formData) =>
    axiosInstance.put(`/projects/${id}/stations/${stationId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  removeStation: (id, stationId) => axiosInstance.delete(`/projects/${id}/stations/${stationId}`),
  submitStationClaim: (id, stationId) => axiosInstance.post(`/projects/${id}/stations/${stationId}/claim/submit`),
  approveStationClaim: (id, stationId) => axiosInstance.post(`/projects/${id}/stations/${stationId}/claim/approve`),
  rejectStationClaim: (id, stationId, reason) =>
    axiosInstance.post(`/projects/${id}/stations/${stationId}/claim/reject`, { reason }),
  markStationPaid: (id, stationId) => axiosInstance.post(`/projects/${id}/stations/${stationId}/claim/mark-paid`),
  addDailyReport: (id, formData) =>
    axiosInstance.post(`/projects/${id}/daily-reports`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  removeDailyReport: (id, reportId) => axiosInstance.delete(`/projects/${id}/daily-reports/${reportId}`),
  addStationDailyReport: (id, stationId, formData) =>
    axiosInstance.post(`/projects/${id}/stations/${stationId}/daily-reports`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  removeStationDailyReport: (id, stationId, reportId) =>
    axiosInstance.delete(`/projects/${id}/stations/${stationId}/daily-reports/${reportId}`),
};
