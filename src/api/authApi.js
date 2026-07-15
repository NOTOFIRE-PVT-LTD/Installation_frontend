import axiosInstance from './axiosInstance';

export const authApi = {
  login: (credentials) => axiosInstance.post('/auth/login', credentials),
  logout: () => axiosInstance.post('/auth/logout'),
  me: () => axiosInstance.get('/auth/me'),
  forgotPassword: (email) => axiosInstance.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => axiosInstance.post(`/auth/reset-password/${token}`, { password }),
  changePassword: (payload) => axiosInstance.patch('/auth/change-password', payload),
  updateProfile: (formData) =>
    axiosInstance.patch('/auth/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};
