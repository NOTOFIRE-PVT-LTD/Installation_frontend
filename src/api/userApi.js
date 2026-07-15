import axiosInstance from './axiosInstance';

export const userApi = {
  list: (params) => axiosInstance.get('/users', { params }),
  options: () => axiosInstance.get('/users/options'),
  getById: (id) => axiosInstance.get(`/users/${id}`),
  create: (formData) =>
    axiosInstance.post('/users', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) =>
    axiosInstance.put(`/users/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id) => axiosInstance.delete(`/users/${id}`),
  updateStatus: (id, status) => axiosInstance.patch(`/users/${id}/status`, { status }),
  resetPassword: (id) => axiosInstance.post(`/users/${id}/reset-password`),
  updatePermissions: (id, permissions) => axiosInstance.put(`/users/${id}/permissions`, permissions),
  impersonate: (id) => axiosInstance.post(`/users/${id}/impersonate`),
};
