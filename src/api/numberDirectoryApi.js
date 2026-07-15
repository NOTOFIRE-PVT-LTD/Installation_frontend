import axiosInstance from './axiosInstance';

export const numberDirectoryApi = {
  list: (params) => axiosInstance.get('/numbers', { params }),
  getById: (id) => axiosInstance.get(`/numbers/${id}`),
  create: (payload) => axiosInstance.post('/numbers', payload),
  update: (id, payload) => axiosInstance.put(`/numbers/${id}`, payload),
  remove: (id) => axiosInstance.delete(`/numbers/${id}`),
  importFile: (formData) =>
    axiosInstance.post('/numbers/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};
