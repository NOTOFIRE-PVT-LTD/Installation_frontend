import axiosInstance from './axiosInstance';

export const financialDocumentApi = {
  list: (params) => axiosInstance.get('/financial-documents', { params }),
  options: () => axiosInstance.get('/financial-documents/options'),
  getById: (id) => axiosInstance.get(`/financial-documents/${id}`),
  create: (payload) => axiosInstance.post('/financial-documents', payload),
  update: (id, payload) => axiosInstance.put(`/financial-documents/${id}`, payload),
  remove: (id) => axiosInstance.delete(`/financial-documents/${id}`),
};
