import axiosInstance from './axiosInstance';

export const customerApi = {
  list: (params) => axiosInstance.get('/customers', { params }),
  getById: (id) => axiosInstance.get(`/customers/${id}`),
  create: (payload) => axiosInstance.post('/customers', payload),
  update: (id, payload) => axiosInstance.put(`/customers/${id}`, payload),
  remove: (id) => axiosInstance.delete(`/customers/${id}`),
};
