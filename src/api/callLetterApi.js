import axiosInstance from './axiosInstance';

export const callLetterApi = {
  list: (params) => axiosInstance.get('/call-letters', { params }),
  getById: (id) => axiosInstance.get(`/call-letters/${id}`),
  create: (payload) => axiosInstance.post('/call-letters', payload),
  update: (id, payload) => axiosInstance.put(`/call-letters/${id}`, payload),
  remove: (id) => axiosInstance.delete(`/call-letters/${id}`),
};
