import axiosInstance from './axiosInstance';

function toFormData(payload, files = []) {
  const formData = new FormData();
  formData.append('payload', JSON.stringify(payload));
  files.forEach((file) => formData.append('dcAttachments', file));
  return formData;
}

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

export const deliveryChallanApi = {
  list: (params) => axiosInstance.get('/delivery-challans', { params }),
  getById: (id) => axiosInstance.get(`/delivery-challans/${id}`),
  create: (payload, files) => axiosInstance.post('/delivery-challans', toFormData(payload, files), multipart),
  update: (id, payload, files) => axiosInstance.put(`/delivery-challans/${id}`, toFormData(payload, files), multipart),
  remove: (id) => axiosInstance.delete(`/delivery-challans/${id}`),
  nextNumber: (params) => axiosInstance.get('/delivery-challans/next-number', { params }),
  companies: () => axiosInstance.get('/delivery-challans/options/companies'),
  parties: () => axiosInstance.get('/delivery-challans/options/parties'),
};
