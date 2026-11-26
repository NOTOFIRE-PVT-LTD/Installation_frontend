import axiosInstance from './axiosInstance';

export const portalApi = {
  me: () => axiosInstance.get('/central/portal/me'),
  openPnl: () => axiosInstance.post('/central/portal/open-pnl'),
  openLeadTrack: () => axiosInstance.post('/central/portal/open-leadtrack'),
  directory: () => axiosInstance.get('/central/portal/directory'),
};
