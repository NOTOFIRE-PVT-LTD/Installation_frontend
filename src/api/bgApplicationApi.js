import axiosInstance from './axiosInstance';

export const bgApplicationApi = {
  list: (params) => axiosInstance.get('/bg-applications', { params }),
  getById: (id) => axiosInstance.get(`/bg-applications/${id}`),
  create: (payload) => axiosInstance.post('/bg-applications', payload),
  update: (id, payload) => axiosInstance.put(`/bg-applications/${id}`, payload),
  remove: (id) => axiosInstance.delete(`/bg-applications/${id}`),
};
