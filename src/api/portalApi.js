import axiosInstance from './axiosInstance';

export const portalApi = {
  me: () => axiosInstance.get('/central/portal/me'),
  openPnl: () => axiosInstance.post('/central/portal/open-pnl'),
  directory: () => axiosInstance.get('/central/portal/directory'),
};
