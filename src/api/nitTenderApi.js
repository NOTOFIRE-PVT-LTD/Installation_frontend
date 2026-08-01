import axiosInstance from './axiosInstance';

export const nitTenderApi = {
  list: (params) => axiosInstance.get('/nit-tenders', { params }),
  options: () => axiosInstance.get('/nit-tenders/options'),
  getById: (id) => axiosInstance.get(`/nit-tenders/${id}`),
  create: (payload) => axiosInstance.post('/nit-tenders', payload),
  update: (id, payload) => axiosInstance.put(`/nit-tenders/${id}`, payload),
  remove: (id) => axiosInstance.delete(`/nit-tenders/${id}`),
};
