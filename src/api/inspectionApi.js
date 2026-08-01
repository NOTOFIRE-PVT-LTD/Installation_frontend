import axiosInstance from './axiosInstance';

export const inspectionApi = {
  list: (params) => axiosInstance.get('/inspections', { params }),
  getById: (id) => axiosInstance.get(`/inspections/${id}`),
  create: (formData) =>
    axiosInstance.post('/inspections', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) =>
    axiosInstance.put(`/inspections/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id) => axiosInstance.delete(`/inspections/${id}`),
};
