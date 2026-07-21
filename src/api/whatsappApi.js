import axiosInstance from './axiosInstance';

export const whatsappApi = {
  listLogs: (params) => axiosInstance.get('/whatsapp/logs', { params }),
  getStatus: () => axiosInstance.get('/whatsapp/status'),
};
