import axiosInstance from './axiosInstance';

export const attendanceApi = {
  list: (params) => axiosInstance.get('/attendance', { params }),
  today: () => axiosInstance.get('/attendance/today'),
  summary: () => axiosInstance.get('/attendance/summary'),
  punch: (formData) => axiosInstance.post('/attendance/punch', formData),
  corrections: (params) => axiosInstance.get('/attendance/corrections', { params }),
  requestCorrection: (payload) => axiosInstance.post('/attendance/corrections', payload),
  reviewCorrection: (id, payload) => axiosInstance.post(`/attendance/corrections/${id}/review`, payload),
};
