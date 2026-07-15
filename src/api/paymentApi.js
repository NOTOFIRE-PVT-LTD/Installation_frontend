import axiosInstance from './axiosInstance';

export const paymentApi = {
  list: (params) => axiosInstance.get('/payments', { params }),
  getById: (id) => axiosInstance.get(`/payments/${id}`),
  create: (payload) => axiosInstance.post('/payments', payload),
  update: (id, payload) => axiosInstance.put(`/payments/${id}`, payload),
  remove: (id) => axiosInstance.delete(`/payments/${id}`),
  updateStatus: (id, status) => axiosInstance.patch(`/payments/${id}/status`, { status }),
};
