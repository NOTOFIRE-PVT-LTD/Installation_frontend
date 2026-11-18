import axiosInstance from './axiosInstance';

export const visitExpenseApi = {
  list: (params) => axiosInstance.get('/visit-expenses', { params }),
  getById: (id) => axiosInstance.get(`/visit-expenses/${id}`),
  update: (id, payload) => axiosInstance.patch(`/visit-expenses/${id}`, payload),
  uploadTicket: (id, itemId, file) => {
    const form = new FormData();
    form.append('ticket', file);
    return axiosInstance.post(`/visit-expenses/${id}/items/${itemId}/ticket`, form);
  },
  submit: (id) => axiosInstance.post(`/visit-expenses/${id}/submit`),
  review: (id, payload) => axiosInstance.post(`/visit-expenses/${id}/review`, payload),
};
