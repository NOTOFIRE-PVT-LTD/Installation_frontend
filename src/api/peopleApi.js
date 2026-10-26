import axiosInstance from './axiosInstance';

export const peopleApi = {
  list: (params) => axiosInstance.get('/people', { params }),
  create: (payload) => axiosInstance.post('/people', payload),
  update: (id, payload) => axiosInstance.put(`/people/${id}`, payload),
  updateStatus: (id, status) => axiosInstance.patch(`/people/${id}/status`, { status }),
};
