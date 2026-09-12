import axiosInstance from './axiosInstance';

export const billingApi = {
  list: (params) => axiosInstance.get('/billing', { params }),
  getById: (id) => axiosInstance.get(`/billing/${id}`),
  parseLoa: (payload) => axiosInstance.post('/billing/parse', payload),
  remove: (id) => axiosInstance.delete(`/billing/${id}`),
  downloadExcel: (params) =>
    axiosInstance.get('/billing/export', { params, responseType: 'blob' }),
};
