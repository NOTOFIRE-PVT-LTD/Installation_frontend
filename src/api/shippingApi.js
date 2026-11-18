import axiosInstance from './axiosInstance';

export const shippingApi = {
  dashboard: () => axiosInstance.get('/shipping/dashboard'),
  tab: (tab, params) => axiosInstance.get(`/shipping/tabs/${tab}`, { params }),
};
