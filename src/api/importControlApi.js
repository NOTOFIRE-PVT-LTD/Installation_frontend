import axiosInstance from './axiosInstance';

export const importControlApi = {
  dashboard: () => axiosInstance.get('/import-control/dashboard'),
  tab: (tab, params) => axiosInstance.get(`/import-control/tabs/${tab}`, { params }),
};
