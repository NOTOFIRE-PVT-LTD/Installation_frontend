import axiosInstance from './axiosInstance';

export const searchApi = {
  search: (params) => axiosInstance.get('/search', { params }),
};
