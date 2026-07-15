import axiosInstance from './axiosInstance';

export const tenderApi = {
  list: (params) => axiosInstance.get('/cad/tenders', { params }),
  getById: (id) => axiosInstance.get(`/cad/tenders/${id}`),
  create: (formData) =>
    axiosInstance.post('/cad/tenders', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) =>
    axiosInstance.put(`/cad/tenders/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id) => axiosInstance.delete(`/cad/tenders/${id}`),
};
