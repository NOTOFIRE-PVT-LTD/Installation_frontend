import axiosInstance from './axiosInstance';

export const complaintApi = {
  // Public APIs
  publicCreate: (formData) =>
    axiosInstance.post('/complaints/public', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  publicTrack: (params) => axiosInstance.get('/complaints/public/track', { params }),

  // Operational Dashboard & Stats
  dashboardMetrics: () => axiosInstance.get('/complaints/dashboard'),
  stats: () => axiosInstance.get('/complaints/dashboard'),

  // Complaint Management
  list: (params) => axiosInstance.get('/complaints', { params }),
  getById: (id) => axiosInstance.get(`/complaints/${id}`),
  createInternal: (payload) => axiosInstance.post('/complaints', payload),
  update: (id, payload) => axiosInstance.patch(`/complaints/${id}`, payload),
  checkDuplicate: (params) => axiosInstance.get('/complaints/check-duplicate', { params }),
  assignees: () => axiosInstance.get('/complaints/assignees'),

  // Actions & Lifecycle
  acknowledge: (id) => axiosInstance.post(`/complaints/${id}/acknowledge`),
  assign: (id, payload) => axiosInstance.post(`/complaints/${id}/assign`, payload),
  updateStatus: (id, payload) => axiosInstance.post(`/complaints/${id}/status`, payload),
  addWorkLog: (id, payload) => axiosInstance.post(`/complaints/${id}/work-logs`, payload),
  resolve: (id, payload) => axiosInstance.post(`/complaints/${id}/resolve`, payload),
  reopen: (id, payload) => axiosInstance.post(`/complaints/${id}/reopen`, payload),
  addComment: (id, payload) => axiosInstance.post(`/complaints/${id}/comments`, payload),
};
