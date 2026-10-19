import axiosInstance from './axiosInstance';

function toFormData(payload, files = []) {
  const formData = new FormData();
  formData.append('payload', JSON.stringify(payload));
  files.forEach((file) => formData.append('atlantaProofs', file));
  return formData;
}

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

export const atlantaPaymentApi = {
  list: (params) => axiosInstance.get('/atlanta-payments', { params }),
  getById: (id) => axiosInstance.get(`/atlanta-payments/${id}`),
  create: (payload, files) => axiosInstance.post('/atlanta-payments', toFormData(payload, files), multipart),
  update: (id, payload, files) => axiosInstance.put(`/atlanta-payments/${id}`, toFormData(payload, files), multipart),
  remove: (id) => axiosInstance.delete(`/atlanta-payments/${id}`),
};
