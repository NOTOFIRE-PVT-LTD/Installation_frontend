import axiosInstance from './axiosInstance';

export const divisionApi = {
  list: (params) => axiosInstance.get('/cad/divisions', { params }),
  getById: (id) => axiosInstance.get(`/cad/divisions/${id}`),
  create: (payload) => axiosInstance.post('/cad/divisions', payload),
  update: (id, payload) => axiosInstance.put(`/cad/divisions/${id}`, payload),
  remove: (id) => axiosInstance.delete(`/cad/divisions/${id}`),
};
