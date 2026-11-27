import axiosInstance from './axiosInstance';

export const companionApi = {
  createSession: (app) => axiosInstance.post('/companion/session', { app }),
};
