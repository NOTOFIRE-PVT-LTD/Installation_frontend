import axiosInstance from './axiosInstance';

export const reportApi = {
  list: (params) => axiosInstance.get('/reports', { params }),
  getById: (id) => axiosInstance.get(`/reports/${id}`),
  create: (formData) =>
    axiosInstance.post('/reports', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) =>
    axiosInstance.put(`/reports/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id) => axiosInstance.delete(`/reports/${id}`),
  verify: (id) => axiosInstance.patch(`/reports/${id}/verify`),
};
