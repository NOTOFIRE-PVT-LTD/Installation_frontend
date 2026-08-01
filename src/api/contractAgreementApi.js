import axiosInstance from './axiosInstance';

export const contractAgreementApi = {
  list: (params) => axiosInstance.get('/contract-agreements', { params }),
  options: () => axiosInstance.get('/contract-agreements/options'),
  getById: (id) => axiosInstance.get(`/contract-agreements/${id}`),
  create: (payload) => axiosInstance.post('/contract-agreements', payload),
  update: (id, payload) => axiosInstance.put(`/contract-agreements/${id}`, payload),
  remove: (id) => axiosInstance.delete(`/contract-agreements/${id}`),
};
