import axiosInstance from './axiosInstance';

export const visitApi = {
  list: (params) => axiosInstance.get('/visits', { params }),
  today: () => axiosInstance.get('/visits/today'),
  getDay: (params) => axiosInstance.get('/visits/day', { params }),
  selectDay: (payload) => axiosInstance.post('/visits/day', payload),
  submitDay: () => axiosInstance.post('/visits/day/submit'),
  getById: (id) => axiosInstance.get(`/visits/${id}`),
  create: (payload) => axiosInstance.post('/visits', payload),
  proximity: (id, params) => axiosInstance.get(`/visits/${id}/proximity`, { params }),
  checkIn: (id, formData) => axiosInstance.post(`/visits/${id}/check-in`, formData),
  checkOut: (id, formData) => axiosInstance.post(`/visits/${id}/check-out`, formData),
  reportMissed: (id, payload) => axiosInstance.post(`/visits/${id}/miss`, payload),
  approvals: (params) => axiosInstance.get('/visits/approvals', { params }),
  review: (id, payload) => axiosInstance.post(`/visits/approvals/${id}/review`, payload),
};
