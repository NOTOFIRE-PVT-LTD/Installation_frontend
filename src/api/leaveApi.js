import axiosInstance from './axiosInstance';

export const leaveApi = {
  list: (params) => axiosInstance.get('/leaves', { params }),
  create: (payload) => axiosInstance.post('/leaves', payload),
  review: (id, payload) => axiosInstance.post(`/leaves/${id}/review`, payload),
};
